import { extractIPv6, SUPPORTED_TOPICS } from './topics';

/**
 * Everything that turns a received value into ioBroker objects and states.
 *
 * Kept apart from the MQTT broker because SNMP feeds the very same datapoints and must produce the very same
 * object tree. The layer knows devices by id only — it has no notion of connections, clients or sessions, so
 * either transport can drive it.
 */

/** A datapoint definition that is not one of the fixed SUPPORTED_TOPICS, for example a table column */
export interface StateDefinition {
    common: ioBroker.StateCommon;
    convert?: (raw: string) => ioBroker.StateValue;
}

export type DeviceOwner = 'mqtt' | 'snmp';

/** ioBroker object ids cannot carry these, and a dot would silently open a new level in the tree */
const FORBIDDEN_IN_ID = /[\][*,;'"`<>\\?.\s]/g;

/** Make a value coming off a device — a port name, an I/O system name — usable as an object id */
export function sanitizeId(value: string): string {
    return value.replace(FORBIDDEN_IN_ID, '_');
}

// Convert seconds to 1d 12:23:45
function seconds2time(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d) {
        return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default class DeviceStates {
    private readonly adapter: ioBroker.Adapter;
    private readonly createdObjects: { [objectId: string]: boolean } = {};
    private readonly aliveStates: { [deviceId: string]: boolean } = {};
    private readonly owners: { [deviceId: string]: DeviceOwner } = {};
    private readonly warned: { [key: string]: boolean } = {};
    private readonly connections: { [owner in DeviceOwner]: string[] } = { mqtt: [], snmp: [] };
    private lastConnection: string | null = null;

    constructor(adapter: ioBroker.Adapter) {
        this.adapter = adapter;
    }

    /**
     * Decide which transport may write a device, so a router that is both configured for SNMP and connected over
     * MQTT does not get written twice. SNMP wins because it was entered by hand, while an MQTT connection just
     * happens — deciding by whoever arrived first would make the outcome depend on timing.
     *
     * Idempotent, and warns at most once per device.
     */
    claim(deviceId: string, owner: DeviceOwner): boolean {
        const current = this.owners[deviceId];
        if (!current || current === owner || owner === 'snmp') {
            if (current && current !== owner) {
                const key = `${deviceId}:${current}`;
                if (!this.warned[key]) {
                    this.warned[key] = true;
                    this.adapter.log.warn(
                        `Device ${deviceId} is polled over SNMP, its ${current.toUpperCase()} data is ignored`,
                    );
                }
            }
            this.owners[deviceId] = owner;
            return true;
        }
        return false;
    }

    /**
     * Feed the connection indicator. Both transports report here, because `info.connection` describes the
     * instance as a whole: with SNMP devices only, filling it from the MQTT client list alone would leave the
     * adapter looking disconnected while it is happily polling.
     */
    async setConnections(owner: DeviceOwner, ids: string[]): Promise<void> {
        this.connections[owner] = ids;
        const all = [...this.connections.mqtt, ...this.connections.snmp];
        const value = all.join(',');
        if (value !== this.lastConnection) {
            this.lastConnection = value;
            await this.adapter.setStateAsync('info.connection', value, true);
        }
    }

    release(deviceId: string, owner: DeviceOwner): void {
        if (this.owners[deviceId] === owner) {
            delete this.owners[deviceId];
        }
    }

    async addObject(
        id: string,
        newObj: ioBroker.StateObject | ioBroker.ChannelObject | ioBroker.DeviceObject,
    ): Promise<void> {
        if (this.createdObjects[id]) {
            return;
        }
        this.createdObjects[id] = true;
        const obj = await this.adapter.getObjectAsync(id);
        if (!obj?.common) {
            await this.adapter.setObjectAsync(id, newObj);
            this.adapter.log.info(`New object created: ${id}`);
        } else if (newObj.type === 'state' && obj.type === 'state') {
            // Reconcile what the adapter derives rather than the user: the type, and whether the datapoint is
            // writable. The write flag decides whether a UI offers a control at all, and it flips when a write
            // community is added to a device that was already polled — without this the port would stay
            // read-only forever and a click in the widget would do nothing.
            const changed: string[] = [];
            if (obj.common.type !== newObj.common.type) {
                obj.common.type = newObj.common.type;
                changed.push('type');
            }
            if (!!obj.common.write !== !!newObj.common.write) {
                obj.common.write = newObj.common.write;
                changed.push('write');
            }
            if (changed.length) {
                await this.adapter.setObjectAsync(id, obj);
                this.adapter.log.info(`Object updated (${changed.join(', ')}): ${id}`);
            }
        }
    }

    async ensureDevice(deviceId: string, name: string, desc?: string): Promise<void> {
        await this.addObject(deviceId, {
            _id: `${this.adapter.namespace}.${deviceId}`,
            type: 'channel',
            common: {
                name,
                desc: desc || `Teltonika Router ${deviceId}`,
            },
            native: {},
        });
    }

    async ensureChannel(id: string, name: string): Promise<void> {
        await this.addObject(id, {
            _id: `${this.adapter.namespace}.${id}`,
            type: 'channel',
            common: { name },
            native: {},
        });
    }

    async setAlive(deviceId: string, alive: boolean): Promise<void> {
        if (this.aliveStates[deviceId] === alive) {
            return;
        }
        await this.addObject(`${deviceId}.alive`, {
            _id: `${this.adapter.namespace}.${deviceId}.alive`,
            type: 'state',
            common: {
                name: 'Connected',
                role: 'indicator.connected',
                type: 'boolean',
                read: true,
                write: false,
            },
            native: {},
        });
        this.aliveStates[deviceId] = alive;
        await this.adapter.setStateAsync(`${deviceId}.alive`, alive, true);
    }

    /** Create the object for an arbitrary datapoint and write its value. */
    async applyDefined(id: string, definition: StateDefinition, raw: string): Promise<ioBroker.StateValue> {
        await this.addObject(id, {
            _id: `${this.adapter.namespace}.${id}`,
            type: 'state',
            common: definition.common,
            native: {},
        });
        const value: ioBroker.StateValue = definition.convert ? definition.convert(raw) : raw;
        await this.adapter.setStateAsync(id, value, true);
        return value;
    }

    /**
     * Write one of the fixed datapoints of a device. Returns false when the key is not a known datapoint, so the
     * caller can report the raw payload in the terms of its own transport.
     */
    async applyValue(deviceId: string, key: string, raw: string): Promise<boolean> {
        const topic = SUPPORTED_TOPICS[key];
        if (!topic) {
            return false;
        }

        const value = await this.applyDefined(`${deviceId}.${key}`, topic, raw);

        // The device hands out both address families in one field, but `info.ip` holds a single value. The IPv4
        // address stays in `wan`; a second state appears only on devices that actually have IPv6.
        if (key === 'wan') {
            const ipv6 = extractIPv6(raw);
            if (ipv6) {
                await this.applyDefined(
                    `${deviceId}.wanIPv6`,
                    {
                        common: {
                            name: 'WAN IPv6 Address',
                            type: 'string',
                            role: 'info.ip',
                            read: true,
                            write: false,
                        },
                    },
                    ipv6,
                );
            }
        }

        if (key === 'uptime') {
            await this.applyDefined(
                `${deviceId}.uptimeStr`,
                {
                    common: {
                        name: 'Uptime String',
                        type: 'string',
                        role: 'value.interval',
                        read: true,
                        write: false,
                    },
                },
                seconds2time(value as number),
            );
        }

        return true;
    }
}
