// @ts-expect-error no types
import snmp from 'net-snmp';

/**
 * Thin session wrapper around net-snmp.
 *
 * Every value is handed back as a string, deliberately: the datapoint definitions in `topics.ts` already carry
 * `convert` functions that take the string a router publishes over MQTT, and canonicalising here lets the SNMP
 * path reuse them unchanged instead of growing a second set of converters.
 */

export type SnmpVersion = 'v1' | 'v2c' | 'v3';

export interface SnmpTarget {
    host: string;
    port?: number;
    version: SnmpVersion;
    /** v1 and v2c */
    community?: string;
    /** v3 */
    user?: string;
    authProtocol?: 'md5' | 'sha';
    authKey?: string;
    privProtocol?: 'des' | 'aes';
    privKey?: string;
    timeout?: number;
    retries?: number;
}

/** Absent values — no such object, no such instance, end of view — are null rather than an error */
export type SnmpValue = string | null;

/** Keeps a GET request inside one UDP datagram. Larger batches risk tooBig responses on small devices. */
const MAX_OIDS_PER_REQUEST = 20;
const MAX_REPETITIONS = 20;

function isPrintable(text: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /^[\x09\x0a\x0d\x20-\x7e]*$/.test(text);
}

/** Counter64 arrives as eight raw bytes; Number would silently lose the low bits past 2^53. */
function bufferToBigInt(buffer: Buffer): bigint {
    let result = 0n;
    for (const byte of buffer) {
        result = (result << 8n) | BigInt(byte);
    }
    return result;
}

export function decodeVarbind(varbind: any): SnmpValue {
    if (!varbind || snmp.isVarbindError(varbind)) {
        return null;
    }
    const value = varbind.value;
    if (value === null || value === undefined) {
        return null;
    }
    if (Buffer.isBuffer(value)) {
        // Check the declared type first: an OctetString can be eight bytes long too
        if (varbind.type === snmp.ObjectType.Counter64) {
            return bufferToBigInt(value).toString();
        }
        const text = value.toString('utf8');
        return isPrintable(text) ? text : value.toString('hex');
    }
    return String(value);
}

export function isTimeout(error: unknown): boolean {
    return error instanceof Error && error.name === 'RequestTimedOutError';
}

export default class SnmpClient {
    private readonly target: SnmpTarget;
    private session: any = null;

    constructor(target: SnmpTarget) {
        this.target = target;
    }

    get host(): string {
        return this.target.host;
    }

    private open(): any {
        if (this.session) {
            return this.session;
        }

        const options = {
            port: this.target.port || 161,
            timeout: this.target.timeout || 5000,
            retries: this.target.retries ?? 1,
            version: this.target.version === 'v1' ? snmp.Version1 : snmp.Version2c,
        };

        if (this.target.version === 'v3') {
            const hasAuth = !!this.target.authKey;
            const hasPriv = hasAuth && !!this.target.privKey;
            this.session = snmp.createV3Session(
                this.target.host,
                {
                    name: this.target.user || '',
                    level: hasPriv
                        ? snmp.SecurityLevel.authPriv
                        : hasAuth
                          ? snmp.SecurityLevel.authNoPriv
                          : snmp.SecurityLevel.noAuthNoPriv,
                    authProtocol: this.target.authProtocol === 'md5' ? snmp.AuthProtocols.md5 : snmp.AuthProtocols.sha,
                    authKey: this.target.authKey,
                    privProtocol: this.target.privProtocol === 'aes' ? snmp.PrivProtocols.aes : snmp.PrivProtocols.des,
                    privKey: this.target.privKey,
                },
                { ...options, version: snmp.Version3 },
            );
        } else {
            this.session = snmp.createSession(this.target.host, this.target.community || 'public', options);
        }

        // A session that emitted an error is not reliably usable again, so drop it and let the next call reopen
        this.session.on('error', () => this.close());

        return this.session;
    }

    private getChunk(oids: string[]): Promise<any[]> {
        const session = this.open();
        return new Promise<any[]>((resolve, reject) =>
            session.get(oids, (error: Error | null, varbinds: any[]) =>
                error ? reject(error) : resolve(varbinds || []),
            ),
        );
    }

    /**
     * Read the given OIDs. The result is keyed by the requested OID, so a caller can look up exactly what it
     * asked for even when the device answers with an error varbind.
     */
    async get(oids: string[]): Promise<Map<string, SnmpValue>> {
        const result = new Map<string, SnmpValue>();
        for (let offset = 0; offset < oids.length; offset += MAX_OIDS_PER_REQUEST) {
            const chunk = oids.slice(offset, offset + MAX_OIDS_PER_REQUEST);
            const varbinds = await this.getChunk(chunk);
            chunk.forEach((oid, index) => result.set(oid, decodeVarbind(varbinds[index])));
        }
        return result;
    }

    /** Walk everything below an OID. Used for tables, where the row indices are not known in advance. */
    async subtree(baseOid: string): Promise<Map<string, SnmpValue>> {
        const session = this.open();
        const result = new Map<string, SnmpValue>();
        await new Promise<void>((resolve, reject) => {
            session.subtree(
                baseOid,
                MAX_REPETITIONS,
                (varbinds: any[]) => {
                    for (const varbind of varbinds) {
                        result.set(varbind.oid, decodeVarbind(varbind));
                    }
                },
                (error: Error | null) => (error ? reject(error) : resolve()),
            );
        });
        return result;
    }

    /**
     * Write an integer object, which is what every controllable value on these devices happens to be.
     * Rejects on a refused write, so the caller can tell "not permitted" from "did not arrive".
     */
    async setInteger(oid: string, value: number): Promise<void> {
        const session = this.open();
        await new Promise<void>((resolve, reject) => {
            session.set([{ oid, type: snmp.ObjectType.Integer, value }], (error: Error | null, varbinds: any[]) => {
                if (error) {
                    reject(error);
                    return;
                }
                const refused = (varbinds || []).find((varbind: any) => snmp.isVarbindError(varbind));
                if (refused) {
                    reject(new Error(String(snmp.varbindError(refused))));
                    return;
                }
                resolve();
            });
        });
    }

    close(): void {
        if (this.session) {
            const session = this.session;
            this.session = null;
            try {
                session.close();
            } catch {
                // already gone
            }
        }
    }
}
