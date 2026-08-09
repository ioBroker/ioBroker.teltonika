// @ts-expect-error no types
import snmp from 'net-snmp';
import { decodeVarbind, type SnmpValue } from './client';
import { FAMILY_OIDS } from './oids.generated';
import type DeviceStates from '../states';

/**
 * Receiving SNMP traps.
 *
 * Teltonika notifications are mostly bare: of the seven a RUTC defines, only `signalChangeNotification` declares
 * any OBJECTS, so a trap tells you *that* something happened and almost never *what*. The receiver therefore
 * records the event and asks the device for fresh values, rather than trying to read data out of the trap.
 */

/** In a TrapV2 the notification OID is the value of this varbind, not the varbind's own OID */
const SNMP_TRAP_OID = '1.3.6.1.6.3.1.1.4.1.0';
const SYS_UPTIME = '1.3.6.1.2.1.1.3.0';

export const DEFAULT_TRAP_PORT = 162;

export interface TrapSource {
    deviceId: string;
    family: string;
    /** Poll the device now, because the trap itself carries no values */
    refresh: () => void;
}

/** Pull the notification OID out of a received PDU, for both trap flavours. */
export function notificationOid(pdu: any): string | null {
    if (!pdu) {
        return null;
    }
    for (const varbind of pdu.varbinds || []) {
        if (varbind.oid === SNMP_TRAP_OID) {
            const value = varbind.value;
            return Buffer.isBuffer(value) ? value.toString('utf8') : String(value);
        }
    }
    // A v1 trap has no snmpTrapOID varbind; it is assembled from the enterprise and the specific trap number
    if (pdu.enterprise) {
        const specific = pdu.specificTrap ?? pdu['specific-trap'] ?? 0;
        return `${pdu.enterprise}.${specific}`;
    }
    return null;
}

/** Everything a notification carried beyond the two varbinds every TrapV2 has. */
export function payloadOf(pdu: any): { [oid: string]: SnmpValue } {
    const payload: { [oid: string]: SnmpValue } = {};
    for (const varbind of pdu?.varbinds || []) {
        if (varbind.oid !== SNMP_TRAP_OID && varbind.oid !== SYS_UPTIME) {
            payload[varbind.oid] = decodeVarbind(varbind);
        }
    }
    return payload;
}

export default class TrapReceiver {
    private receiver: any = null;
    private readonly names = new Map<string, string>();

    constructor(
        private readonly adapter: ioBroker.Adapter,
        private readonly states: DeviceStates,
        private readonly lookup: (host: string) => TrapSource | undefined,
    ) {
        // One reverse map over every family: a notification OID identifies itself, no device context needed
        for (const family of Object.values(FAMILY_OIDS)) {
            for (const [name, oid] of Object.entries(family.notifications)) {
                this.names.set(oid, name);
            }
        }
    }

    start(port: number, community: string): void {
        if (this.receiver) {
            return;
        }
        try {
            this.receiver = snmp.createReceiver(
                { port, disableAuthorization: false },
                (error: Error | null, data: any) => {
                    if (error) {
                        this.adapter.log.warn(`SNMP trap receiver: ${error.message}`);
                        return;
                    }
                    void this.handle(data);
                },
            );
            this.receiver.getAuthorizer().addCommunity(community);
            this.adapter.log.info(`Listening for SNMP traps on port ${port}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            // Port 162 is privileged on Linux, so this is a configuration problem rather than a bug
            this.adapter.log.error(`Cannot listen for SNMP traps on port ${port}: ${message}`);
            this.receiver = null;
        }
    }

    stop(): void {
        if (this.receiver) {
            try {
                this.receiver.close();
            } catch {
                // already gone
            }
            this.receiver = null;
        }
    }

    private async handle(data: any): Promise<void> {
        const host = data?.rinfo?.address;
        const source = host ? this.lookup(host) : undefined;
        if (!source) {
            // Traps from anything that is not a configured device are noise, not an error
            this.adapter.log.debug(`Ignoring SNMP trap from unconfigured host ${host}`);
            return;
        }

        const oid = notificationOid(data.pdu);
        const name = (oid && this.names.get(oid)) || oid;
        if (!name) {
            this.adapter.log.debug(`SNMP trap from ${host} without a recognisable notification OID`);
            return;
        }

        const payload = payloadOf(data.pdu);
        const extra = Object.keys(payload).length ? ` ${JSON.stringify(payload)}` : '';
        this.adapter.log.info(`SNMP trap from ${host} (${source.deviceId}): ${name}${extra}`);

        await this.states.ensureChannel(`${source.deviceId}.traps`, 'traps');
        // One state per notification, holding the time it last arrived: scripts trigger on the change, and the
        // value stays meaningful afterwards, which a boolean pulse would not.
        await this.states.applyDefined(
            `${source.deviceId}.traps.${name}`,
            {
                common: { name, type: 'number', role: 'value.time', read: true, write: false },
                convert: raw => Number(raw),
            },
            String(Date.now()),
        );
        await this.states.applyDefined(
            `${source.deviceId}.traps.last`,
            {
                common: { name: 'Last trap', type: 'string', role: 'text', read: true, write: false },
            },
            name,
        );

        source.refresh();
    }
}
