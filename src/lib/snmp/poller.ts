import SnmpClient, { type SnmpTarget, type SnmpValue } from './client';
import { FAMILY_OIDS, type FamilyOids, type FamilyTable } from './oids.generated';
import { BRANCH_STATES, TABLE_ALIASES, TABLE_STATES } from './aliases';
import TrapReceiver, { DEFAULT_TRAP_PORT, type TrapSource } from './traps';
import type DeviceStates from '../states';
import { sanitizeId } from '../states';

/** Common to every Teltonika family, which is what makes a degraded mode possible for unknown devices */
const DEVICE_GROUP = {
    serial: '1.3.6.1.4.1.48690.1.1.0',
    deviceName: '1.3.6.1.4.1.48690.1.2.0',
    productCode: '1.3.6.1.4.1.48690.1.3.0',
    fwVersion: '1.3.6.1.4.1.48690.1.6.0',
    cpuUsage: '1.3.6.1.4.1.48690.1.8.0',
};

const DEFAULT_POLL_INTERVAL = 30000;

/**
 * Port control rides on the standard IF-MIB rather than the Teltonika tree, which exposes nothing writable.
 * PoE is not reachable at all: POWER-ETHERNET-MIB answers with no objects on these devices.
 */
const IF_DESCR = '1.3.6.1.2.1.2.2.1.2';
const IF_ADMIN_STATUS = '1.3.6.1.2.1.2.2.1.7';
const IF_UP = 1;
const IF_DOWN = 2;

export interface SnmpDeviceConfig extends SnmpTarget {
    enabled?: boolean;
    pollInterval?: number;
    /** Set to allow writes. Empty means the adapter only reads, and the port states stay read-only. */
    writeCommunity?: string;
}

/**
 * Index part of a table OID, i.e. what remains after the column prefix. Composite indices keep their dots, so
 * the value can be appended to any other column of the same table unchanged.
 */
export function indexOf(oid: string, columnOid: string): string | null {
    return oid.startsWith(`${columnOid}.`) ? oid.slice(columnOid.length + 1) : null;
}

/**
 * Turn the values of a table's naming column into object ids.
 *
 * A name is used as-is while it is unique. A RUTC calls four of its five ports `LAN`, so colliding names get the
 * row index appended — otherwise four ports would share one state. Only the colliding names are suffixed, which
 * keeps the readable form for everything else.
 */
export function uniqueRowNames(rows: Map<string, string>): Map<string, string> {
    const seen: { [name: string]: number } = {};
    for (const name of rows.values()) {
        const id = sanitizeId(name);
        seen[id] = (seen[id] || 0) + 1;
    }
    const result = new Map<string, string>();
    for (const [index, name] of rows) {
        const id = sanitizeId(name);
        result.set(index, seen[id] > 1 ? `${id}_${index}` : id);
    }
    return result;
}

/**
 * Pair each port row with its IF-MIB interface.
 *
 * Case insensitive, because a RUTC writes `WAN` in one table and `wan` in the other, but strictly one to one: a
 * name that appears more than once among the interfaces yields no match at all. That is the RUTC again, which
 * reports four ports called `LAN` against interfaces `lan1`…`lan4` — there is no sound way to tell which is
 * which, and switching off the wrong port cannot be undone remotely.
 */
export function matchInterfaces(
    rowIds: Map<string, string>,
    rawNames: Map<string, string>,
    interfaces: Map<string, string>,
): { matched: Map<string, string>; skipped: string[] } {
    const byName = new Map<string, string[]>();
    for (const [index, name] of interfaces) {
        const key = name.toLowerCase();
        byName.set(key, [...(byName.get(key) || []), index]);
    }

    const matched = new Map<string, string>();
    const skipped: string[] = [];
    for (const [index, rowId] of rowIds) {
        const candidates = byName.get((rawNames.get(index) || '').toLowerCase());
        if (candidates?.length === 1) {
            matched.set(rowId, candidates[0]);
        } else {
            skipped.push(rowId);
        }
    }
    return { matched, skipped };
}

export class SnmpPoller {
    private readonly adapter: ioBroker.Adapter;
    private readonly states: DeviceStates;
    private readonly config: SnmpDeviceConfig;
    private readonly client: SnmpClient;

    private timer: NodeJS.Timeout | null = null;
    private stopped = false;
    private busy = false;
    private oids: FamilyOids | null = null;
    private deviceId: string | null = null;
    private failures = 0;
    /** Port state name to its IF-MIB index, only for ports that could be matched beyond doubt */
    private readonly portInterfaces = new Map<string, string>();
    private writeClient: SnmpClient | null = null;

    private readonly branches: ReadonlySet<string>;

    constructor(
        adapter: ioBroker.Adapter,
        states: DeviceStates,
        config: SnmpDeviceConfig,
        branches: ReadonlySet<string> = new Set(),
    ) {
        this.adapter = adapter;
        this.states = states;
        this.config = config;
        this.branches = branches;
        this.client = new SnmpClient(config);
    }

    get host(): string {
        return this.config.host;
    }

    get id(): string | null {
        return this.deviceId;
    }

    get family(): string {
        return this.oids?.family || '';
    }

    /** Poll ahead of the timer, used when a trap says something changed. */
    refresh(): void {
        void this.tick();
    }

    async start(): Promise<void> {
        await this.tick();
        if (!this.stopped) {
            this.timer = setInterval(() => void this.tick(), this.config.pollInterval || DEFAULT_POLL_INTERVAL);
        }
    }

    async stop(): Promise<void> {
        this.stopped = true;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.deviceId) {
            await this.states.setAlive(this.deviceId, false);
            this.states.release(this.deviceId, 'snmp');
        }
        this.client.close();
        this.writeClient?.close();
        this.writeClient = null;
    }

    private async tick(): Promise<void> {
        // A slow device must not stack up overlapping polls
        if (this.busy || this.stopped) {
            return;
        }
        this.busy = true;
        try {
            if (!this.deviceId) {
                await this.identify();
            }
            if (this.deviceId) {
                await this.poll();
                await this.states.setAlive(this.deviceId, true);
            }
            this.failures = 0;
        } catch (error) {
            await this.onFailure(error);
        } finally {
            this.busy = false;
        }
    }

    private async onFailure(error: unknown): Promise<void> {
        // A request still in flight when the adapter shuts down fails by design, that is not worth reporting
        if (this.stopped) {
            return;
        }
        this.failures++;
        const message = error instanceof Error ? error.message : String(error);
        // Only the first failure is an error; a device that stays away would otherwise flood the log
        if (this.failures === 1) {
            this.adapter.log.error(`SNMP ${this.config.host}: ${message}`);
        } else {
            this.adapter.log.debug(`SNMP ${this.config.host}: ${message} (${this.failures} in a row)`);
        }
        if (this.deviceId) {
            await this.states.setAlive(this.deviceId, false);
        }
        this.client.close();
    }

    /** Read the device group, pick the generated table for the family and settle on an id for the device. */
    private async identify(): Promise<void> {
        const info = await this.client.get(Object.values(DEVICE_GROUP));
        const fwVersion = info.get(DEVICE_GROUP.fwVersion);
        const serial = info.get(DEVICE_GROUP.serial);
        const productCode = info.get(DEVICE_GROUP.productCode);
        const deviceName = info.get(DEVICE_GROUP.deviceName);

        if (!serial && !fwVersion) {
            throw new Error('no Teltonika device answered on 1.3.6.1.4.1.48690');
        }

        const family = fwVersion ? fwVersion.split('_R_')[0] : '';
        this.oids = FAMILY_OIDS[family] || null;
        if (!this.oids) {
            // Guessing OIDs across families is not safe: `.8.2.1.4` is pVlanVID on a RUTC and pVlanPortsUntag on
            // a TSW202. Without a generated table we stay on the objects every family shares.
            this.adapter.log.warn(
                `SNMP ${this.config.host}: no OID table for family "${family}" (${fwVersion}); ` +
                    `only common device values are read. Add its MIB and run "npm run generate-oids".`,
            );
        }

        const id = await this.readDeviceId();
        this.deviceId = sanitizeId(id || serial || this.config.host);

        if (!this.states.claim(this.deviceId, 'snmp')) {
            throw new Error(`device ${this.deviceId} is already owned by another transport`);
        }

        await this.states.ensureDevice(
            this.deviceId,
            deviceName || productCode || this.deviceId,
            `Teltonika ${productCode || family || 'device'} at ${this.config.host}`,
        );
        this.adapter.log.info(
            `SNMP ${this.config.host}: ${productCode || family || 'device'} identified as ${this.deviceId}`,
        );
    }

    /** Routers are known by modem IMEI so they match the id the MQTT path uses; switches have none. */
    private async readDeviceId(): Promise<string | null> {
        const imeiOid = this.oids?.rows.modemTable?.id;
        if (!imeiOid) {
            return null;
        }
        const found = await this.client.subtree(imeiOid);
        for (const value of found.values()) {
            if (value) {
                return value;
            }
        }
        return null;
    }

    private async poll(): Promise<void> {
        const deviceId = this.deviceId;
        if (!deviceId) {
            return;
        }

        if (this.oids) {
            await this.pollScalars(deviceId, this.oids);
            await this.pollRows(deviceId, this.oids);
            await this.pollBranches(deviceId, this.oids);
            for (const [name, table] of Object.entries(this.oids.tables)) {
                // A branch the user did not ask for is not even requested from the device
                if (table.branch && !this.branches.has(table.branch)) {
                    continue;
                }
                await this.pollTable(deviceId, name, table);
            }
        }

        const cpu = await this.client.get([DEVICE_GROUP.cpuUsage]);
        const usage = cpu.get(DEVICE_GROUP.cpuUsage);
        if (usage !== null && usage !== undefined) {
            await this.states.applyDefined(
                `${deviceId}.cpu`,
                {
                    common: { name: 'CPU usage', type: 'number', role: 'value', unit: '%', read: true, write: false },
                    convert: raw => (isNaN(parseFloat(raw)) ? null : parseFloat(raw)),
                },
                usage,
            );
        }
    }

    private async pollScalars(deviceId: string, oids: FamilyOids): Promise<void> {
        const wanted = Object.entries(oids.scalars).map(([topic, oid]) => [topic, `${oid}.0`] as const);
        if (!wanted.length) {
            return;
        }
        const values = await this.client.get(wanted.map(([, oid]) => oid));
        for (const [topic, oid] of wanted) {
            const value = values.get(oid);
            if (value !== null && value !== undefined) {
                await this.states.applyValue(deviceId, topic, value);
            }
        }
    }

    /** Scalars of the optional branches, each read only while the user has that branch switched on. */
    private async pollBranches(deviceId: string, oids: FamilyOids): Promise<void> {
        for (const [branch, states] of Object.entries(oids.branches)) {
            const definitions = BRANCH_STATES[branch];
            if (!definitions || !this.branches.has(branch)) {
                continue;
            }
            const wanted = Object.entries(states)
                .filter(([state]) => definitions[state])
                .map(([state, oid]) => [state, `${oid}.0`] as const);
            if (!wanted.length) {
                continue;
            }
            const values = await this.client.get(wanted.map(([, oid]) => oid));
            await this.states.ensureChannel(`${deviceId}.${branch}`, branch);
            for (const [state, oid] of wanted) {
                const value = values.get(oid);
                if (value !== null && value !== undefined) {
                    await this.states.applyDefined(`${deviceId}.${branch}.${state}`, definitions[state], value);
                }
            }
        }
    }

    /**
     * Datapoints that live in a table, the modem values above all. The row indices are not known in advance, so
     * one column is walked to learn them and everything else is fetched by exact OID.
     */
    private async pollRows(deviceId: string, oids: FamilyOids): Promise<void> {
        for (const topics of Object.values(oids.rows)) {
            const entries = Object.entries(topics);
            if (!entries.length) {
                continue;
            }
            const [, probeOid] = entries[0];
            const indices: string[] = [];
            for (const oid of (await this.client.subtree(probeOid)).keys()) {
                const index = indexOf(oid, probeOid);
                if (index) {
                    indices.push(index);
                }
            }
            if (!indices.length) {
                continue;
            }

            const wanted: { topic: string; oid: string; index: string }[] = [];
            for (const [topic, oid] of entries) {
                for (const index of indices) {
                    wanted.push({ topic, oid: `${oid}.${index}`, index });
                }
            }
            const values = await this.client.get(wanted.map(entry => entry.oid));

            for (const entry of wanted) {
                const value = values.get(entry.oid);
                if (value === null || value === undefined) {
                    continue;
                }
                // The first row keeps the flat layout the MQTT path produces; further rows get their own channel
                const target = entry.index === indices[0] ? deviceId : `${deviceId}.modem_${entry.index}`;
                if (target !== deviceId) {
                    await this.states.ensureChannel(target, `Modem ${entry.index}`);
                }
                await this.states.applyValue(target, entry.topic, value);
            }
        }
    }

    get controllable(): boolean {
        return !!this.config.writeCommunity;
    }

    /**
     * Attach each port row to its IF-MIB interface, which is where the only writable object lives.
     *
     * Matched case insensitively and **only when the name is unique**: a TSW202 calls its ports `port1`…`port8`
     * in both tables, but a RUTC reports four ports named `LAN` while the IF-MIB has `lan1`…`lan4`. There is no
     * sound way to tell which is which, and switching off the wrong port cannot be undone remotely.
     */
    private async mapPortInterfaces(rowIds: Map<string, string>, rawNames: Map<string, string>): Promise<void> {
        const interfaces = new Map<string, string>();
        for (const [oid, value] of await this.client.subtree(IF_DESCR)) {
            const index = indexOf(oid, IF_DESCR);
            if (index && value) {
                interfaces.set(index, value);
            }
        }

        const { matched, skipped } = matchInterfaces(rowIds, rawNames, interfaces);
        this.portInterfaces.clear();
        for (const [rowId, index] of matched) {
            this.portInterfaces.set(rowId, index);
        }
        if (skipped.length) {
            this.adapter.log.debug(
                `SNMP ${this.config.host}: no unambiguous interface for ${skipped.join(', ')}, not controllable`,
            );
        }
    }

    /** Read the administrative state of every port that could be matched, and offer it for writing. */
    private async pollPortAdminStatus(deviceId: string, channel: string): Promise<void> {
        if (!this.portInterfaces.size) {
            return;
        }
        const wanted = [...this.portInterfaces].map(([rowId, index]) => ({
            rowId,
            oid: `${IF_ADMIN_STATUS}.${index}`,
        }));
        const values = await this.client.get(wanted.map(entry => entry.oid));
        for (const entry of wanted) {
            const value = values.get(entry.oid);
            if (value === null || value === undefined) {
                continue;
            }
            await this.states.applyDefined(
                `${deviceId}.${channel}.${entry.rowId}.enabled`,
                {
                    common: {
                        name: 'Enabled',
                        type: 'boolean',
                        role: 'switch.enable',
                        read: true,
                        // Without a write community the adapter has no way to change it, so do not pretend
                        write: this.controllable,
                    },
                    convert: raw => (raw === String(IF_UP) ? true : raw === String(IF_DOWN) ? false : null),
                },
                value,
            );
        }
    }

    /** Switch a port. Returns false when this device or port cannot be controlled. */
    async setPortEnabled(rowId: string, enabled: boolean): Promise<boolean> {
        const index = this.portInterfaces.get(rowId);
        if (!index || !this.config.writeCommunity) {
            return false;
        }
        this.writeClient ||= new SnmpClient({ ...this.config, community: this.config.writeCommunity });
        await this.writeClient.setInteger(`${IF_ADMIN_STATUS}.${index}`, enabled ? IF_UP : IF_DOWN);
        this.adapter.log.info(`SNMP ${this.config.host}: port ${rowId} set to ${enabled ? 'up' : 'down'}`);
        // Read back rather than trusting the write, so the state reflects the device
        this.refresh();
        return true;
    }

    private async pollTable(deviceId: string, name: string, table: FamilyTable): Promise<void> {
        const definitions = TABLE_STATES[name];
        const alias = TABLE_ALIASES[name];
        if (!definitions || !alias) {
            return;
        }

        const rawNames = new Map<string, string>();
        for (const [oid, value] of await this.client.subtree(table.rowName)) {
            const index = indexOf(oid, table.rowName);
            if (index && value) {
                rawNames.set(index, value);
            }
        }
        if (!rawNames.size) {
            return;
        }
        const rowIds = uniqueRowNames(rawNames);

        const labels = new Map<string, SnmpValue>();
        if (table.label) {
            for (const [oid, value] of await this.client.subtree(table.label)) {
                const index = indexOf(oid, table.label);
                if (index) {
                    labels.set(index, value);
                }
            }
        }

        const columns = Object.entries(table.columns).filter(([state]) => definitions[state]);
        const wanted: { state: string; index: string; oid: string }[] = [];
        for (const [state, columnOid] of columns) {
            for (const index of rowIds.keys()) {
                wanted.push({ state, index, oid: `${columnOid}.${index}` });
            }
        }
        const values = await this.client.get(wanted.map(entry => entry.oid));

        await this.states.ensureChannel(`${deviceId}.${alias.channel}`, alias.channel);
        for (const [index, rowId] of rowIds) {
            const channel = `${deviceId}.${alias.channel}.${rowId}`;
            await this.states.ensureChannel(channel, labels.get(index) || rawNames.get(index) || rowId);
        }

        for (const entry of wanted) {
            const value = values.get(entry.oid);
            if (value === null || value === undefined) {
                continue;
            }
            const rowId = rowIds.get(entry.index);
            await this.states.applyDefined(
                `${deviceId}.${alias.channel}.${rowId}.${entry.state}`,
                definitions[entry.state],
                value,
            );
        }

        // Physical ports additionally carry their administrative state, which is the one writable value
        if (name === 'portTable') {
            await this.mapPortInterfaces(rowIds, rawNames);
            await this.pollPortAdminStatus(deviceId, alias.channel);
        }
    }
}

export interface TrapOptions {
    enabled?: boolean;
    port?: number;
    community?: string;
}

/** Owns one poller per configured device, plus the shared trap receiver. */
export default class SnmpManager {
    private readonly pollers: SnmpPoller[] = [];
    private readonly branches: ReadonlySet<string>;
    private traps: TrapReceiver | null = null;

    constructor(
        private readonly adapter: ioBroker.Adapter,
        private readonly states: DeviceStates,
        branches: string[] = [],
    ) {
        this.branches = new Set(branches);
    }

    start(devices: SnmpDeviceConfig[], traps?: TrapOptions): void {
        for (const device of devices) {
            if (device.enabled === false || !device.host) {
                continue;
            }
            const poller = new SnmpPoller(this.adapter, this.states, device, this.branches);
            this.pollers.push(poller);
            poller.start().catch(error => this.adapter.log.error(`SNMP ${device.host}: ${error}`));
        }
        if (this.pollers.length) {
            const optional = this.branches.size ? `, optional branches: ${[...this.branches].join(', ')}` : '';
            this.adapter.log.info(`Polling ${this.pollers.length} device(s) over SNMP${optional}`);
        }

        if (traps?.enabled && this.pollers.length) {
            this.traps = new TrapReceiver(this.adapter, this.states, host => this.sourceFor(host));
            this.traps.start(traps.port || DEFAULT_TRAP_PORT, traps.community || 'public');
        }
    }

    /** Switch a port of a device. False when the device is unknown, uncontrollable or the port unmatched. */
    async setPortEnabled(deviceId: string, rowId: string, enabled: boolean): Promise<boolean> {
        const poller = this.pollers.find(entry => entry.id === deviceId);
        return poller ? poller.setPortEnabled(rowId, enabled) : false;
    }

    /** Match a trap sender to one of the polled devices. Only a device we already identified can be addressed. */
    private sourceFor(host: string): TrapSource | undefined {
        const poller = this.pollers.find(entry => entry.host === host && entry.id);
        if (!poller?.id) {
            return undefined;
        }
        return { deviceId: poller.id, family: poller.family, refresh: () => poller.refresh() };
    }

    async destroy(): Promise<void> {
        this.traps?.stop();
        this.traps = null;
        await Promise.all(this.pollers.map(poller => poller.stop()));
        this.pollers.length = 0;
    }
}
