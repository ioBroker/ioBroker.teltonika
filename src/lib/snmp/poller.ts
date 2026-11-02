import SnmpClient, { type SnmpTarget, type SnmpValue } from './client';
import { FAMILY_OIDS, type FamilyOids, type FamilyTable } from './oids.generated';
import { BRANCH_STATES, TABLE_ALIASES, TABLE_STATES } from './aliases';
import TrapReceiver, { DEFAULT_TRAP_PORT, type TrapSource } from './traps';
import type DeviceStates from '../states';
import { sanitizeId } from '../states';
import type PresenceTracker from '../presence';
import TeltonikaApi from '../api/client';

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
 * PoE is not reachable over SNMP at all: POWER-ETHERNET-MIB answers with no objects on these devices (checked on
 * a TSW202), which is why it goes through the Web API instead. The `ifDescr` names also label the addresses read
 * from the IP-MIB.
 */
const IF_DESCR = '1.3.6.1.2.1.2.2.1.2';
const IF_ADMIN_STATUS = '1.3.6.1.2.1.2.2.1.7';
/** `ifAlias` of IF-MIB. A TSW switch puts the description of each port here, as set under Port settings. */
const IF_ALIAS = '1.3.6.1.2.1.31.1.1.1.18';
const IF_UP = 1;
const IF_DOWN = 2;

/**
 * Column `ipAdEntIfIndex` of the IP-MIB `ipAddrTable`. The Teltonika MIB carries no interface address at all, but
 * routers and switches alike answer here. The table is indexed by the address itself, so walking this one column
 * yields both the address and the interface it sits on. IPv4 only: the newer `ipAddressTable`, which would carry
 * IPv6 as well, is empty on these devices.
 */
const IP_AD_ENT_IF_INDEX = '1.3.6.1.2.1.4.20.1.2';

const LAN_ADDRESS: ioBroker.StateCommon = {
    name: 'LAN IP Address',
    desc: 'IPv4 address of the device in the local network',
    type: 'string',
    role: 'info.ip',
    read: true,
    write: false,
};

/** WebUI user of a Teltonika device out of the box, taken when only a password is configured */
const DEFAULT_API_USER = 'admin';

/** Web API section holding the per-port settings, PoE among them. Only ports with PoE carry `poe_enable`. */
const PORT_SETTINGS = 'ports_settings/config';
/** Live values per port. Lists `poe_enable` for the SFP cages too (as `"0"`), so it cannot tell who has PoE. */
const PORT_STATUS = 'ports_settings/status';

const POE_STATE: ioBroker.StateCommon = {
    name: 'PoE',
    desc: 'Power over Ethernet output of the port, switched over the Web API',
    type: 'boolean',
    role: 'switch.power',
    read: true,
    write: true,
};

const POE_ACTIVE: ioBroker.StateCommon = {
    name: 'PoE powering',
    desc: 'A device draws power from the port. False with PoE on means nothing PoE-powered is plugged in.',
    type: 'boolean',
    role: 'indicator',
    read: true,
    write: false,
};

const POE_POWER: ioBroker.StateCommon = {
    name: 'PoE power',
    type: 'number',
    role: 'value.power',
    unit: 'W',
    read: true,
    write: false,
};

/** Table of the associated Wi-Fi stations, which is read by hand rather than through the generic table path */
const WIFI_CLIENT_TABLE = 'wIfaceClientTable';

const WIFI_CLIENT_COUNT: ioBroker.StateCommon = {
    name: 'Connected clients',
    type: 'number',
    role: 'value',
    read: true,
    write: false,
};

const WIFI_CLIENT_LIST: ioBroker.StateCommon = {
    name: 'Client list',
    desc: 'MAC address and SSID of every associated station, as JSON',
    type: 'string',
    role: 'json',
    read: true,
    write: false,
};

export interface SnmpDeviceConfig extends SnmpTarget {
    enabled?: boolean;
    pollInterval?: number;
    /** Set to allow writes. Empty means the adapter only reads, and the port states stay read-only. */
    writeCommunity?: string;
    /** WebUI login, needed for PoE only. Without a password the Web API is never contacted; the user defaults to `admin`. */
    apiUser?: string;
    apiPassword?: string;
}

/** What a poller needs beyond the device itself, kept apart because both of these are instance wide */
export interface SnmpPollerExtras {
    /** Fed with every associated station, so the configured devices can be marked present */
    presence?: PresenceTracker | null;
    /**
     * Write the full list of associated MAC addresses into the object tree. Off unless the user asks: presence
     * needs the list, but it does not need everyone who ever joined the network to end up in the tree.
     */
    exposeClients?: boolean;
}

export interface WifiClient {
    /** As the device reports it, which is `A1:B2:C3:D4:E5:F6` on these routers */
    mac: string;
    ssid: string | null;
}

/**
 * Pair each associated station with the network it joined.
 *
 * Sorted, so the JSON state changes when the set of clients changes rather than because the device happened to
 * walk its table in a different order.
 */
export function clientsWithSsid(
    macs: Map<string, string>,
    ifaceIndices: Map<string, string>,
    ssids: Map<string, string>,
): WifiClient[] {
    const clients: WifiClient[] = [];
    for (const [index, mac] of macs) {
        const iface = ifaceIndices.get(index);
        clients.push({ mac, ssid: (iface && ssids.get(iface)) || null });
    }
    return clients.sort((a, b) => (a.ssid || '').localeCompare(b.ssid || '') || a.mac.localeCompare(b.mac));
}

/**
 * Index part of a table OID, i.e. what remains after the column prefix. Composite indices keep their dots, so
 * the value can be appended to any other column of the same table unchanged.
 */
export function indexOf(oid: string, columnOid: string): string | null {
    return oid.startsWith(`${columnOid}.`) ? oid.slice(columnOid.length + 1) : null;
}

/** Walk one column of a table, keyed by the row index its OIDs carry. Empty values are left out. */
export async function walkColumn(client: SnmpClient, columnOid: string): Promise<Map<string, string>> {
    const values = new Map<string, string>();
    for (const [oid, value] of await client.subtree(columnOid)) {
        const index = indexOf(oid, columnOid);
        if (index && value) {
            values.set(index, value);
        }
    }
    return values;
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

/**
 * Group the IPv4 addresses of a device by the name of their interface, loopback left out.
 *
 * @param ifIndices address to IF-MIB interface index, as `ipAdEntIfIndex` delivers it
 * @param ifNames interface index to `ifDescr`; an index without a name falls back to `if<index>`
 */
export function addressesByInterface(
    ifIndices: Map<string, string>,
    ifNames: Map<string, string>,
): Map<string, string[]> {
    const result = new Map<string, string[]>();
    for (const [address, ifIndex] of ifIndices) {
        if (address.startsWith('127.')) {
            continue;
        }
        const name = ifNames.get(ifIndex) || `if${ifIndex}`;
        result.set(name, [...(result.get(name) || []), address]);
    }
    return result;
}

/**
 * The address the device has in the local network.
 *
 * OpenWrt bridges the LAN ports: `br-lan` on a router, `br0.1` (VLAN 1 of the bridge) on a TSW switch. Without
 * any bridge, the address the adapter polls is the best guess left, as long as the device actually carries it.
 */
export function lanAddress(byInterface: Map<string, string[]>, host: string): string | null {
    const names = [...byInterface.keys()];
    const bridge = names.find(name => name === 'br-lan') || names.find(name => name.startsWith('br'));
    if (bridge) {
        return byInterface.get(bridge)?.[0] || null;
    }
    for (const addresses of byInterface.values()) {
        if (addresses.includes(host)) {
            return host;
        }
    }
    return null;
}

/** A flag as the Web API writes it, `"1"` or `"0"`. Anything else is not guessed at. */
function apiFlag(value: unknown): boolean | null {
    if (value === '1' || value === 1 || value === true) {
        return true;
    }
    if (value === '0' || value === 0 || value === false) {
        return false;
    }
    return null;
}

/** The rows of a Web API table that carry an id, typed loosely: the options differ across firmware versions */
function apiRows(rows: unknown): { id: string; [option: string]: unknown }[] {
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows.filter(
        (row): row is { id: string } => !!row && typeof row === 'object' && typeof row.id === 'string' && !!row.id,
    );
}

/**
 * The PoE switch of every port in `ports_settings/config`, keyed by the API's port id (`port1`…).
 *
 * Only `poe_enable` is read: Teltonika has renamed other options of this section between firmware versions
 * (`enable` became `enabled`), so nothing else is relied upon. A row without the option is a port without
 * PoE — the SFP cages, or every port of a router.
 */
export function poeStates(rows: unknown): Map<string, boolean> {
    const result = new Map<string, boolean>();
    for (const row of apiRows(rows)) {
        const on = apiFlag(row.poe_enable);
        if (on !== null) {
            result.set(row.id, on);
        }
    }
    return result;
}

export interface PoeStatus {
    on: boolean | null;
    /** A powered device is attached and drawing power */
    active: boolean | null;
    /** In watts. The API reports `budget` in milliwatts. */
    power: number | null;
}

/** The live PoE values of `ports_settings/status`, for the ports known to have PoE. */
export function poeStatus(rows: unknown, ports: ReadonlySet<string>): Map<string, PoeStatus> {
    const result = new Map<string, PoeStatus>();
    for (const row of apiRows(rows)) {
        if (!ports.has(row.id)) {
            continue;
        }
        const milliwatts = typeof row.budget === 'string' || typeof row.budget === 'number' ? Number(row.budget) : NaN;
        result.set(row.id, {
            on: apiFlag(row.poe_enable),
            active: apiFlag(row.power),
            power: isFinite(milliwatts) ? Math.round(milliwatts / 100) / 10 : null,
        });
    }
    return result;
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
    /** Address states written by the last poll, so one whose interface lost its address can be cleared */
    private readonly addressIds = new Set<string>();
    /** Only with a web login configured. SNMP stays the source of everything else. */
    private readonly api: TeltonikaApi | null;
    /** Port state name to the API's port id, for every port that reported a PoE switch */
    private readonly poePorts = new Map<string, string>();
    private apiFailures = 0;
    /** The port configuration was read once, so `poePorts` is known — possibly empty */
    private poeChecked = false;
    /** Answering right now, which is what the instance reports through `info.connection` */
    reachable = false;
    onReachabilityChange: (() => void) | null = null;

    private readonly branches: ReadonlySet<string>;
    private readonly presence: PresenceTracker | null;
    private readonly exposeClients: boolean;

    constructor(
        adapter: ioBroker.Adapter,
        states: DeviceStates,
        config: SnmpDeviceConfig,
        branches: ReadonlySet<string> = new Set(),
        extras: SnmpPollerExtras = {},
    ) {
        this.adapter = adapter;
        this.states = states;
        this.config = config;
        this.branches = branches;
        this.presence = extras.presence || null;
        this.exposeClients = !!extras.exposeClients;
        this.client = new SnmpClient(config);
        // The password alone switches the Web API on; the user defaults to `admin`, the one every device ships with
        this.api = config.apiPassword
            ? new TeltonikaApi({
                  host: config.host,
                  user: config.apiUser?.trim() || DEFAULT_API_USER,
                  password: config.apiPassword,
              })
            : null;
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
        this.api?.close();
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
                this.reachable = true;
                this.onReachabilityChange?.();
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
        this.reachable = false;
        this.onReachabilityChange?.();
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
        } else if (this.branches.has('clients') && !this.oids.tables[WIFI_CLIENT_TABLE]) {
            // Worth saying out loud: presence stays silent forever on such a device, and nothing else would
            // tell the user why. Teltonika added the wireless group to the MIB only in recent firmware.
            this.adapter.log.warn(
                `SNMP ${this.config.host}: the MIB of family "${family}" defines no ${WIFI_CLIENT_TABLE}, ` +
                    `so no Wi-Fi clients and no presence can be read from this device.`,
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
                if (name === WIFI_CLIENT_TABLE) {
                    await this.pollWifiClients(deviceId, table);
                    continue;
                }
                await this.pollTable(deviceId, name, table);
            }
        }

        // Standard MIB, so read even on a family without a generated OID table
        await this.pollAddresses(deviceId);
        // After the port table, so the port channels exist
        await this.pollPoe(deviceId);

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

    /**
     * Every IPv4 address of the device under `addresses.<interface>`, and the LAN address on its own as `lan`, next
     * to the `wan` the modem reports. On a router `addresses` also holds the wired WAN, which `wan` does not.
     */
    private async pollAddresses(deviceId: string): Promise<void> {
        const ifIndices = await walkColumn(this.client, IP_AD_ENT_IF_INDEX);
        if (!ifIndices.size) {
            return;
        }

        const indices = [...new Set(ifIndices.values())];
        const descriptions = await this.client.get(indices.map(index => `${IF_DESCR}.${index}`));
        const ifNames = new Map<string, string>();
        for (const index of indices) {
            const name = descriptions.get(`${IF_DESCR}.${index}`);
            if (name) {
                ifNames.set(index, name);
            }
        }
        const byInterface = addressesByInterface(ifIndices, ifNames);

        const lan = lanAddress(byInterface, this.config.host);
        const lanId = `${deviceId}.lan`;
        if (lan) {
            await this.states.writeValue(lanId, LAN_ADDRESS, lan);
        }

        const current = new Set<string>(lan ? [lanId] : []);
        if (byInterface.size) {
            await this.states.ensureChannel(`${deviceId}.addresses`, 'IP addresses');
        }
        for (const [name, addresses] of byInterface) {
            const id = `${deviceId}.addresses.${sanitizeId(name)}`;
            current.add(id);
            await this.states.writeValue(
                id,
                {
                    name,
                    desc: `IPv4 address of interface ${name}`,
                    type: 'string',
                    role: 'info.ip',
                    read: true,
                    write: false,
                },
                addresses.join(', '),
            );
        }

        // An interface that lost its address, a modem going down for instance, must not go on showing the old one
        for (const id of this.addressIds) {
            if (!current.has(id)) {
                await this.adapter.setStateAsync(id, null, true);
                this.addressIds.delete(id);
            }
        }
        for (const id of current) {
            this.addressIds.add(id);
        }
    }

    /**
     * The PoE switch of each port, read over the Web API.
     *
     * A failure here is logged and otherwise ignored: the device answers SNMP, so it is reachable and its other
     * values are fine — a wrong password must not mark it as gone.
     */
    private async pollPoe(deviceId: string): Promise<void> {
        if (!this.api) {
            return;
        }
        let status: Map<string, PoeStatus>;
        try {
            // Which ports have PoE does not change, so the configuration is asked once, the status every poll
            if (!this.poeChecked) {
                await this.learnPoePorts();
            }
            if (!this.poePorts.size) {
                return;
            }
            status = poeStatus(await this.api.get(PORT_STATUS), new Set(this.poePorts.values()));
        } catch (error) {
            this.apiFailures++;
            const message = error instanceof Error ? error.message : String(error);
            if (this.apiFailures === 1) {
                this.adapter.log.warn(`Web API ${this.config.host}: ${message}`);
            } else {
                this.adapter.log.debug(`Web API ${this.config.host}: ${message} (${this.apiFailures} in a row)`);
            }
            return;
        }
        if (this.apiFailures) {
            this.adapter.log.info(`Web API ${this.config.host}: reachable again`);
            this.apiFailures = 0;
        }

        await this.states.ensureChannel(`${deviceId}.ports`, 'ports');
        for (const [rowId, apiId] of this.poePorts) {
            const port = status.get(apiId);
            if (!port) {
                continue;
            }
            const base = `${deviceId}.ports.${rowId}`;
            await this.states.ensureChannel(base, apiId);
            await this.states.writeValue(`${base}.poe`, POE_STATE, port.on);
            await this.states.writeValue(`${base}.poeActive`, POE_ACTIVE, port.active);
            await this.states.writeValue(`${base}.poePower`, POE_POWER, port.power);
        }
    }

    /** Read which ports have PoE at all, and say so once in the log. */
    private async learnPoePorts(): Promise<void> {
        const ports = poeStates(await this.api?.get(PORT_SETTINGS));
        this.poePorts.clear();
        for (const apiId of ports.keys()) {
            this.poePorts.set(sanitizeId(apiId), apiId);
        }
        this.poeChecked = true;
        this.adapter.log.info(
            ports.size
                ? `Web API ${this.config.host}: PoE switchable on ${[...ports.keys()].join(', ')}`
                : `Web API ${this.config.host}: the device reports no PoE ports`,
        );
    }

    /** Switch the PoE output of a port. Returns false when no web login is configured or the port has no PoE. */
    async setPortPoe(rowId: string, on: boolean): Promise<boolean> {
        const apiId = this.poePorts.get(rowId);
        if (!this.api || !apiId) {
            return false;
        }
        await this.api.put(`${PORT_SETTINGS}/${encodeURIComponent(apiId)}`, { poe_enable: on ? '1' : '0' });
        this.adapter.log.info(`Web API ${this.config.host}: PoE of ${rowId} switched ${on ? 'on' : 'off'}`);
        // Read back rather than trusting the write, so the state reflects the device
        this.refresh();
        return true;
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

    /**
     * Name each port channel after the description set on the device ("Camera mast"), which `ifAlias` carries.
     * Only for ports matched to an interface beyond doubt, and never over a name the user gave in ioBroker.
     */
    private async namePorts(
        deviceId: string,
        channel: string,
        rowIds: Map<string, string>,
        rawNames: Map<string, string>,
    ): Promise<void> {
        if (!this.portInterfaces.size) {
            return;
        }
        const rawByRow = new Map<string, string>();
        for (const [index, rowId] of rowIds) {
            rawByRow.set(rowId, rawNames.get(index) || rowId);
        }
        const wanted = [...this.portInterfaces].map(([rowId, index]) => ({ rowId, oid: `${IF_ALIAS}.${index}` }));
        const aliases = await this.client.get(wanted.map(entry => entry.oid));
        for (const { rowId, oid } of wanted) {
            await this.states.nameChannel(
                `${deviceId}.${channel}.${rowId}`,
                aliases.get(oid),
                rawByRow.get(rowId) || rowId,
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

    /**
     * The stations associated to the access points of the device.
     *
     * Three walks: the MAC column names the stations, the interface column says which wireless interface each
     * joined, and `wIfaceTable` turns that into an SSID. The last one is read even while the wireless branch is
     * off, because a MAC address without the network it joined is of little use.
     *
     * An empty table is a result, not a failure — nobody is connected — so this writes a count of zero and
     * reports an empty list rather than returning early the way the generic table path does.
     */
    private async pollWifiClients(deviceId: string, table: FamilyTable): Promise<void> {
        const macs = await walkColumn(this.client, table.rowName);
        const ifaceColumn = table.columns.ssidIndex;
        const ifaceIndices = ifaceColumn ? await walkColumn(this.client, ifaceColumn) : new Map<string, string>();
        const wIface = this.oids?.tables.wIfaceTable;
        const ssids = wIface ? await walkColumn(this.client, wIface.rowName) : new Map<string, string>();

        const clients = clientsWithSsid(macs, ifaceIndices, ssids);

        if (this.exposeClients) {
            await this.states.ensureChannel(`${deviceId}.${table.channel}`, 'Wi-Fi clients');
            await this.states.writeValue(`${deviceId}.${table.channel}.count`, WIFI_CLIENT_COUNT, clients.length);
            await this.states.writeValue(
                `${deviceId}.${table.channel}.list`,
                WIFI_CLIENT_LIST,
                JSON.stringify(clients),
            );
        }

        await this.presence?.report(deviceId, clients);
    }

    private async pollTable(deviceId: string, name: string, table: FamilyTable): Promise<void> {
        const definitions = TABLE_STATES[name];
        const alias = TABLE_ALIASES[name];
        if (!definitions || !alias) {
            return;
        }

        const rawNames = await walkColumn(this.client, table.rowName);
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
            await this.namePorts(deviceId, alias.channel, rowIds, rawNames);
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
        private readonly extras: SnmpPollerExtras = {},
    ) {
        this.branches = new Set(branches);
    }

    start(devices: SnmpDeviceConfig[], traps?: TrapOptions): void {
        for (const device of devices) {
            if (device.enabled === false || !device.host) {
                continue;
            }
            const poller = new SnmpPoller(this.adapter, this.states, device, this.branches, this.extras);
            poller.onReachabilityChange = () => void this.publishConnections();
            this.pollers.push(poller);
            poller.start().catch(error => this.adapter.log.error(`SNMP ${device.host}: ${error}`));
        }
        if (this.pollers.length) {
            const optional = this.branches.size ? `, optional branches: ${[...this.branches].join(', ')}` : '';
            this.adapter.log.info(`Polling ${this.pollers.length} device(s) over SNMP${optional}`);
        }

        if (traps?.enabled && this.pollers.length) {
            this.traps = new TrapReceiver(this.adapter, this.states, host => this.sourceFor(host));
            void this.traps.start(traps.port || DEFAULT_TRAP_PORT, traps.community || 'public');
        }
    }

    /** Report which devices are answering, so the instance does not look disconnected while it is polling. */
    private async publishConnections(): Promise<void> {
        const reachable = this.pollers
            .filter(poller => poller.reachable && poller.id)
            .map(poller => poller.id as string);
        await this.states.setConnections('snmp', reachable);
    }

    /** Switch a port of a device. False when the device is unknown, uncontrollable or the port unmatched. */
    async setPortEnabled(deviceId: string, rowId: string, enabled: boolean): Promise<boolean> {
        const poller = this.pollers.find(entry => entry.id === deviceId);
        return poller ? poller.setPortEnabled(rowId, enabled) : false;
    }

    /** Switch PoE of a port. False when the device is unknown, has no web login or the port no PoE. */
    async setPortPoe(deviceId: string, rowId: string, on: boolean): Promise<boolean> {
        const poller = this.pollers.find(entry => entry.id === deviceId);
        return poller ? poller.setPortPoe(rowId, on) : false;
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
