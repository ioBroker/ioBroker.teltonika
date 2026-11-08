/**
 * The devices of an instance for the elements: discovered from the object tree once, their values taken from the
 * states the element subscribed.
 *
 * The discovery and the meaning of the states are those of the native widgets - `readInstance()` and
 * `applyState()` of `src-devices/src/utils.ts`, compiled in. Like there, the object tree is the only complete
 * source: MQTT routers announce themselves and SNMP devices appear on their first poll.
 */
import type { WebComponentSocket } from '@iobroker/web-components';

import { applyState, readInstance, type DeviceInfo } from '../../src-devices/src/utils';

export type { DeviceInfo, PortInfo, WanInfo } from '../../src-devices/src/utils';
export { formatBytes, formatUptime, speedLabel, splitRows } from '../../src-devices/src/utils';
export { instanceOfId, toInstance } from './instance';

/** What a view shows of a device, and so which of its states are subscribed */
export type DeviceDetailLevel =
    /** reachable, and the link of each port: the summary of all devices */
    | 'summary'
    /** what a tile of the device shows */
    | 'tile'
    /** the front panel: every value of a port */
    | 'panel'
    /** everything: the details */
    | 'all';

/** The devices of an instance as discovered, without values */
export interface InstanceDevices {
    instance: string;
    /** The devices by their channel ID, e.g. `teltonika.0.6007866821` */
    devices: Map<string, DeviceInfo>;
    /** ID of a state -> the device it belongs to */
    owners: Map<string, string>;
}

/**
 * The channel of a device for what a `device` setting holds: the channel itself or a state below it
 *
 * @param id e.g. `teltonika.0.6007866821` or `teltonika.0.6007866821.ports.port1.state`
 * @returns `teltonika.0.6007866821`, or null if the ID is no device of the adapter
 */
export function toDeviceChannel(id: string | undefined | null): string | null {
    const match = String(id ?? '')
        .trim()
        .match(/^(teltonika\.\d+)\.([^.]+)(\.|$)/);
    if (!match || match[2] === 'info' || match[2] === 'presence') {
        return null;
    }
    return `${match[1]}.${match[2]}`;
}

/**
 * Every device of an instance and the states below it - two object views, however many devices there are
 *
 * @param socket the connection of the host
 * @param instance e.g. `teltonika.0`
 */
export async function discoverDevices(socket: WebComponentSocket, instance: string): Promise<InstanceDevices> {
    // `readInstance` calls nothing of the connection but `getObjectViewSystem`
    const { devices, stateIds } = await readInstance(socket, instance);
    // the presence detection is a channel directly below the instance as well, but no device
    devices.delete(`${instance}.presence`);
    const owners = new Map([...stateIds].filter(([, owner]) => devices.has(owner)));
    return { instance, devices, owners };
}

const TILE_VALUES = ['alive', 'name', 'uptime', 'temperature', 'cpu', 'operator', 'connection', 'signal', 'lan', 'wan'];

/**
 * Whether a view shows a state of a device
 *
 * @param relative the ID below the device channel, e.g. `ports.port1.state`
 * @param level what the view shows
 */
export function isShown(relative: string, level: DeviceDetailLevel): boolean {
    const parts = relative.split('.');
    switch (level) {
        case 'summary':
            return relative === 'alive' || (parts[0] === 'ports' && (parts[2] === 'state' || parts[2] === 'enabled'));
        case 'tile':
            return (
                TILE_VALUES.includes(relative) ||
                (parts[0] === 'ports' && (parts[2] === 'state' || parts[2] === 'enabled')) ||
                (parts[0] === 'interfaces' && (parts[2] === 'status' || parts[2] === 'enabled'))
            );
        case 'panel':
            return relative === 'alive' || parts[0] === 'ports';
        default:
            return true;
    }
}

/**
 * The states to subscribe for some devices
 *
 * @param found what `discoverDevices()` found
 * @param deviceIds the channels of the devices shown
 * @param level what the view shows of them
 */
export function getDeviceStateIds(found: InstanceDevices, deviceIds: string[], level: DeviceDetailLevel): string[] {
    const wanted = new Set(deviceIds);
    const ids: string[] = [];
    for (const [id, owner] of found.owners) {
        if (wanted.has(owner) && isShown(id.slice(owner.length + 1), level)) {
            ids.push(id);
        }
    }
    return ids;
}

/** A copy of a discovered device, which the values may change */
function copyDevice(device: DeviceInfo): DeviceInfo {
    return {
        ...device,
        addresses: { ...device.addresses },
        ports: device.ports.map(port => ({ ...port })),
        wanInterfaces: device.wanInterfaces.map(wan => ({ ...wan })),
        io: device.io.map(io => ({ ...io })),
    };
}

/**
 * The devices with the values of the subscribed states
 *
 * @param found what `discoverDevices()` found
 * @param deviceIds the channels of the devices wanted
 * @param states the states of the element
 */
export function withValues(
    found: InstanceDevices,
    deviceIds: string[],
    states: Record<string, ioBroker.State | null | undefined>,
): DeviceInfo[] {
    const devices = new Map<string, DeviceInfo>();
    for (const id of deviceIds) {
        const device = found.devices.get(id);
        if (device) {
            devices.set(id, copyDevice(device));
        }
    }
    for (const [id, state] of Object.entries(states)) {
        const owner = found.owners.get(id);
        const device = owner ? devices.get(owner) : undefined;
        if (device && state) {
            applyState(device, id.slice(device.id.length + 1), state.val);
        }
    }
    return [...devices.values()];
}

/** Unreachable first, since that is the one that needs attention, then by name - as the native widgets */
export function sortDevices(devices: DeviceInfo[]): DeviceInfo[] {
    const rank = (device: DeviceInfo): number => (device.alive === false ? 0 : device.alive === true ? 1 : 2);
    return [...devices].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}
