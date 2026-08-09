import SnmpClient, { type SnmpVersion } from './client';
import type { SnmpDeviceEntry } from '../../types';

/**
 * Finding Teltonika devices on a network.
 *
 * Detection asks the Teltonika private branch directly rather than looking at `sysObjectID`: both a RUTC and a
 * TSW202 report `1.3.6.1.4.1.8072.3.2.10` there, which is the net-snmp agent's own enterprise OID and says
 * nothing about the vendor. Reading the private branch also yields serial and product code in the same request,
 * so a hit can be shown with something more useful than an address.
 */

const SERIAL = '1.3.6.1.4.1.48690.1.1.0';
const PRODUCT_CODE = '1.3.6.1.4.1.48690.1.3.0';
const FW_VERSION = '1.3.6.1.4.1.48690.1.6.0';

/** A /22 already means a thousand probes; anything larger is a mistake rather than an intention. */
const MAX_HOSTS = 1024;
const CONCURRENCY = 32;

export interface ScanResult {
    host: string;
    serial: string;
    productCode: string;
    fwVersion: string;
}

export interface ScanOptions {
    version?: SnmpVersion;
    community?: string;
    port?: number;
    /** Per host, deliberately short: a scan must not wait out every silent address */
    timeout?: number;
}

function ipToInt(ip: string): number {
    const parts = ip.split('.');
    if (parts.length !== 4) {
        throw new Error(`"${ip}" is not an IPv4 address`);
    }
    let result = 0;
    for (const part of parts) {
        const octet = Number(part);
        if (!/^\d{1,3}$/.test(part) || octet > 255) {
            throw new Error(`"${ip}" is not an IPv4 address`);
        }
        result = (result * 256 + octet) >>> 0;
    }
    return result;
}

function intToIp(value: number): string {
    return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

/**
 * Expand `192.168.1.0/24`, `192.168.1.10-192.168.1.40` or a single address into the hosts to probe.
 * Network and broadcast address are left out of a CIDR block; nothing answers there.
 */
export function expandRange(spec: string): string[] {
    const input = (spec || '').trim();
    if (!input) {
        throw new Error('No address range given');
    }

    let first: number;
    let last: number;

    if (input.includes('/')) {
        const [address, bitsText] = input.split('/');
        const bits = Number(bitsText);
        if (!/^\d{1,2}$/.test(bitsText) || bits < 0 || bits > 32) {
            throw new Error(`"${input}" is not a valid CIDR block`);
        }
        const value = ipToInt(address);
        const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
        const network = (value & mask) >>> 0;
        const broadcast = (network | (~mask >>> 0)) >>> 0;
        // A /31 is a point to point link and a /32 a single host: both addresses are usable
        first = bits >= 31 ? network : network + 1;
        last = bits >= 31 ? broadcast : broadcast - 1;
    } else if (input.includes('-')) {
        const [from, to] = input.split('-');
        first = ipToInt(from.trim());
        last = ipToInt(to.trim());
    } else {
        first = ipToInt(input);
        last = first;
    }

    if (last < first) {
        throw new Error(`"${input}" ends before it starts`);
    }
    const count = last - first + 1;
    if (count > MAX_HOSTS) {
        throw new Error(`"${input}" covers ${count} addresses, at most ${MAX_HOSTS} are scanned`);
    }

    const hosts: string[] = [];
    for (let value = first; value <= last; value++) {
        hosts.push(intToIp(value));
    }
    return hosts;
}

async function probe(host: string, options: ScanOptions): Promise<ScanResult | null> {
    const client = new SnmpClient({
        host,
        port: options.port,
        version: options.version || 'v2c',
        community: options.community || 'public',
        timeout: options.timeout || 1000,
        // A silent address should cost one timeout, not two
        retries: 0,
    });
    try {
        const values = await client.get([SERIAL, PRODUCT_CODE, FW_VERSION]);
        const serial = values.get(SERIAL);
        if (!serial) {
            return null;
        }
        return {
            host,
            serial,
            productCode: values.get(PRODUCT_CODE) || '',
            fwVersion: values.get(FW_VERSION) || '',
        };
    } catch {
        // Unreachable, no SNMP, wrong community — all of it simply means "not a device we can use"
        return null;
    } finally {
        client.close();
    }
}

export async function scanRange(
    spec: string,
    options: ScanOptions = {},
    onProgress?: (done: number, total: number) => void,
): Promise<ScanResult[]> {
    const hosts = expandRange(spec);
    const found: ScanResult[] = [];
    let next = 0;
    let done = 0;

    const worker = async (): Promise<void> => {
        while (next < hosts.length) {
            const host = hosts[next++];
            const result = await probe(host, options);
            if (result) {
                found.push(result);
            }
            onProgress?.(++done, hosts.length);
        }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, hosts.length) }, () => worker()));
    return found.sort((a, b) => ipToInt(a.host) - ipToInt(b.host));
}

/**
 * Fold scan results into the configured list. Existing entries are returned untouched — a rescan must never
 * overwrite credentials or a poll interval somebody set by hand — and only unknown addresses are appended.
 */
export function mergeDevices(
    existing: SnmpDeviceEntry[] | undefined,
    found: ScanResult[],
    defaults: Partial<SnmpDeviceEntry> = {},
): SnmpDeviceEntry[] {
    const current = existing || [];
    const known = new Set(current.map(entry => (entry.host || '').trim()).filter(Boolean));
    const added: SnmpDeviceEntry[] = found
        .filter(result => !known.has(result.host))
        .map(result => ({
            enabled: true,
            host: result.host,
            port: defaults.port || 161,
            version: defaults.version || 'v2c',
            community: defaults.community || 'public',
            pollInterval: defaults.pollInterval || 30000,
        }));
    return [...current, ...added];
}
