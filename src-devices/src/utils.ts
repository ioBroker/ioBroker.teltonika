// Discovery and shaping of what the widgets display.
//
// Unlike the ping adapter, the devices here are not listed in the instance configuration: MQTT routers announce
// themselves and SNMP devices create their objects on the first successful poll. The object tree is therefore
// the only complete source, and it is read through the socket's object view.

import type { Connection } from '@iobroker/gui-components';

/** Everything a port can report. Fields stay undefined when the device does not expose them. */
export interface PortInfo {
    /** Object id fragment used in the tree, already unique */
    id: string;
    /** Label to show, taken from the channel name so a renamed port keeps its label */
    label: string;
    link: boolean | null;
    speed: number | null;
    duplex: boolean | null;
    rxRate: number | null;
    txRate: number | null;
    rxBytes: number | null;
    txBytes: number | null;
    /** Present only where the adapter could match the port to an interface it may switch */
    enabled: boolean | null;
    /** True when the state carries the write flag, i.e. a write community is configured */
    switchable: boolean;
    /** Fibre ports are drawn in their own group, like on the device's front panel */
    fibre: boolean;
}

/** One WAN interface as mwan3 tracks it. */
export interface WanInfo {
    id: string;
    label: string;
    /** `online`, `standby` or `notracking` — the failover role rather than a plain up/down */
    status: string | null;
    enabled: boolean | null;
    uptime: number | null;
    /** The hosts mwan3 pings to judge the link. The interface address is not available over SNMP. */
    trackingHosts: string | null;
}

export interface DeviceInfo {
    /** Full channel id, e.g. `teltonika.0.6007866821` */
    id: string;
    name: string;
    alive: boolean | null;
    /** Product code, e.g. `TSW20200XXXX` */
    model: string | null;
    uptime: number | null;
    cpu: number | null;
    /** Mobile values, only routers have them */
    operator: string | null;
    signal: number | null;
    connection: string | null;
    network: string | null;
    temperature: number | null;
    wan: string | null;
    wanIPv6: string | null;
    ports: PortInfo[];
    /** WAN interfaces, only routers have them */
    wanInterfaces: WanInfo[];
    /** Digital inputs and outputs, only routers have them */
    io: { id: string; label: string; state: boolean | null; type: string | null }[];
    /** A device that reports mobile values is a router, everything else is treated as a switch */
    isRouter: boolean;
}

/** Highest code point ioBroker uses to close a range in an object view */
const RANGE_END = '香';

function stateType(id: string): number {
    return id.split('.').length;
}

/**
 * Sort ports the way they sit on the device: by the number in the name where there is one, alphabetically
 * otherwise. `port10` must come after `port9`, which a plain string sort would get wrong.
 */
export function comparePorts(a: string, b: string): number {
    const na = /(\d+)\s*$/.exec(a);
    const nb = /(\d+)\s*$/.exec(b);
    if (na && nb) {
        const prefixA = a.slice(0, a.length - na[1].length);
        const prefixB = b.slice(0, b.length - nb[1].length);
        if (prefixA === prefixB) {
            return Number(na[1]) - Number(nb[1]);
        }
    }
    return a.localeCompare(b);
}

/** Split the Ethernet ports over two rows the way a front panel is printed: odd above, even below. */
export function splitRows<T>(ports: T[]): { top: T[]; bottom: T[] } {
    const top: T[] = [];
    const bottom: T[] = [];
    ports.forEach((port, index) => (index % 2 === 0 ? top : bottom).push(port));
    return { top, bottom };
}

/** `1000` -> `GbE`, `100` -> `FE`. Null when there is no link, since a speed of 0 says nothing. */
export function speedLabel(speed: number | null, link: boolean | null): string | null {
    if (!link || !speed) {
        return null;
    }
    if (speed >= 1000) {
        return speed >= 10000 ? `${Math.round(speed / 1000)}G` : 'GbE';
    }
    if (speed >= 100) {
        return 'FE';
    }
    return `${speed}M`;
}

export function formatUptime(seconds: number | null): string | null {
    if (seconds === null || isNaN(seconds)) {
        return null;
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days) {
        return `${days}d ${hours}h`;
    }
    if (hours) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

export function formatBytes(bytes: number | null): string | null {
    if (bytes === null || isNaN(bytes)) {
        return null;
    }
    const units = ['B', 'kB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/**
 * Every state below one instance, grouped by the device channel it belongs to.
 *
 * Read in two views rather than one per device: an instance with ten devices would otherwise cost dozens of
 * round trips before the widget can draw anything.
 */
export async function readInstance(
    socket: Connection,
    instance: string,
): Promise<{ devices: Map<string, DeviceInfo>; stateIds: Map<string, string> }> {
    const prefix = `${instance}.`;
    const [channels, states] = await Promise.all([
        socket.getObjectViewSystem('channel', prefix, `${prefix}${RANGE_END}`),
        socket.getObjectViewSystem('state', prefix, `${prefix}${RANGE_END}`),
    ]);

    const devices = new Map<string, DeviceInfo>();
    const base = stateType(prefix) - 1;

    // Names of the row channels. The adapter fills these from what the device reports and never overwrites them
    // afterwards, so a channel renamed in ioBroker keeps that name — which is the only way to put a label like
    // "Starlink" on an interface: SNMP has no such field, `ifAlias` is empty on these devices.
    const channelNames = new Map<string, string>();
    for (const [id, obj] of Object.entries(channels)) {
        if (typeof obj.common?.name === 'string' && obj.common.name) {
            channelNames.set(id, obj.common.name);
        }
    }

    for (const [id, obj] of Object.entries(channels)) {
        // A device channel sits directly under the instance; `ports`, `io` and the rows below are deeper
        if (stateType(id) !== base + 1 || id.endsWith('.info')) {
            continue;
        }
        devices.set(id, {
            id,
            name: typeof obj.common?.name === 'string' ? obj.common.name : id.split('.').pop() || id,
            alive: null,
            model: null,
            uptime: null,
            cpu: null,
            operator: null,
            signal: null,
            connection: null,
            network: null,
            temperature: null,
            wan: null,
            wanIPv6: null,
            ports: [],
            wanInterfaces: [],
            io: [],
            isRouter: false,
        });
    }

    // state id -> the device it belongs to, so a later state change can be routed without re-reading anything
    const stateIds = new Map<string, string>();
    const portsByDevice = new Map<string, Map<string, PortInfo>>();
    const wanByDevice = new Map<string, Map<string, WanInfo>>();
    const ioByDevice = new Map<
        string,
        Map<string, { id: string; label: string; state: boolean | null; type: string | null }>
    >();

    for (const [id, obj] of Object.entries(states)) {
        const parts = id.split('.');
        const deviceId = parts.slice(0, base + 1).join('.');
        const device = devices.get(deviceId);
        if (!device) {
            continue;
        }
        stateIds.set(id, deviceId);
        const rest = parts.slice(base + 1);

        if (rest[0] === 'ports' && rest.length === 3) {
            const map = portsByDevice.get(deviceId) || new Map<string, PortInfo>();
            portsByDevice.set(deviceId, map);
            const port = map.get(rest[1]) || {
                id: rest[1],
                label: rest[1],
                link: null,
                speed: null,
                duplex: null,
                rxRate: null,
                txRate: null,
                rxBytes: null,
                txBytes: null,
                enabled: null,
                switchable: false,
                fibre: /^sfp/i.test(rest[1]),
            };
            if (rest[2] === 'enabled') {
                port.switchable = obj.common?.write === true;
            }
            map.set(rest[1], port);
        } else if (rest[0] === 'interfaces' && rest.length === 3) {
            const map = wanByDevice.get(deviceId) || new Map<string, WanInfo>();
            wanByDevice.set(deviceId, map);
            if (!map.has(rest[1])) {
                map.set(rest[1], {
                    id: rest[1],
                    // A user-assigned channel name wins over the raw interface name
                    label: channelNames.get(`${deviceId}.interfaces.${rest[1]}`) || rest[1],
                    status: null,
                    enabled: null,
                    uptime: null,
                    trackingHosts: null,
                });
            }
            device.isRouter = true;
        } else if (rest[0] === 'io' && rest.length === 3) {
            const map = ioByDevice.get(deviceId) || new Map();
            ioByDevice.set(deviceId, map);
            if (!map.has(rest[1])) {
                map.set(rest[1], { id: rest[1], label: rest[1], state: null, type: null });
            }
        } else if (rest.length === 1 && ['operator', 'signal', 'connection', 'temperature'].includes(rest[0])) {
            device.isRouter = true;
        }
    }

    for (const [deviceId, ports] of portsByDevice) {
        const device = devices.get(deviceId);
        if (device) {
            device.ports = [...ports.values()].sort((a, b) => comparePorts(a.id, b.id));
        }
    }
    for (const [deviceId, wan] of wanByDevice) {
        const device = devices.get(deviceId);
        if (device) {
            device.wanInterfaces = [...wan.values()].sort((a, b) => a.id.localeCompare(b.id));
        }
    }
    for (const [deviceId, io] of ioByDevice) {
        const device = devices.get(deviceId);
        if (device) {
            device.io = [...io.values()].sort((a, b) => a.id.localeCompare(b.id));
        }
    }

    return { devices, stateIds };
}

/** Apply one state change onto the device it belongs to. Returns false when nothing the widget shows changed. */
export function applyState(device: DeviceInfo, relativeId: string, value: ioBroker.StateValue): boolean {
    const parts = relativeId.split('.');

    if (parts.length === 1) {
        switch (parts[0]) {
            case 'alive':
                device.alive = value === null ? null : !!value;
                return true;
            case 'name':
                device.model = value === null ? null : String(value);
                return true;
            case 'uptime':
                device.uptime = typeof value === 'number' ? value : null;
                return true;
            case 'cpu':
                device.cpu = typeof value === 'number' ? value : null;
                return true;
            case 'operator':
            case 'connection':
            case 'network':
            case 'wan':
            case 'wanIPv6':
                (device as unknown as Record<string, unknown>)[parts[0]] = value === null ? null : String(value);
                return true;
            case 'signal':
            case 'temperature':
                (device as unknown as Record<string, unknown>)[parts[0]] = typeof value === 'number' ? value : null;
                return true;
            default:
                return false;
        }
    }

    if (parts[0] === 'ports' && parts.length === 3) {
        const port = device.ports.find(entry => entry.id === parts[1]);
        if (!port) {
            return false;
        }
        switch (parts[2]) {
            case 'state':
                port.link = value === null ? null : !!value;
                return true;
            case 'enabled':
                port.enabled = value === null ? null : !!value;
                return true;
            case 'duplex':
                port.duplex = value === null ? null : !!value;
                return true;
            case 'speed':
            case 'rxRate':
            case 'txRate':
            case 'rxBytes':
            case 'txBytes':
                (port as unknown as Record<string, unknown>)[parts[2]] = typeof value === 'number' ? value : null;
                return true;
            default:
                return false;
        }
    }

    if (parts[0] === 'interfaces' && parts.length === 3) {
        const wan = device.wanInterfaces.find(entry => entry.id === parts[1]);
        if (!wan) {
            return false;
        }
        switch (parts[2]) {
            case 'status':
            case 'trackingHosts':
                (wan as unknown as Record<string, unknown>)[parts[2]] = value === null ? null : String(value);
                return true;
            case 'enabled':
                wan.enabled = value === null ? null : !!value;
                return true;
            case 'uptime':
                wan.uptime = typeof value === 'number' ? value : null;
                return true;
            default:
                return false;
        }
    }

    if (parts[0] === 'io' && parts.length === 3) {
        const io = device.io.find(entry => entry.id === parts[1]);
        if (!io) {
            return false;
        }
        if (parts[2] === 'state') {
            io.state = value === null ? null : !!value;
            return true;
        }
        if (parts[2] === 'type') {
            io.type = value === null ? null : String(value);
            return true;
        }
    }

    return false;
}
