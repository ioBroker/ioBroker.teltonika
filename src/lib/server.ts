import { Server } from 'node:net';
// @ts-expect-error no types
import mqtt from 'mqtt-connection';
import { SUPPORTED_TOPICS } from './topics';
import { TeltonikaAdapterConfig } from '../types';
const FORBIDDEN_CHARS = /[\]\[*,;'"`<>\\?]/g;

interface MQTTPacket {
    qos: 0 | 1 | 2;
    topic: string;
    payload: Buffer;
    messageId: number;
    retain: boolean;
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

type StateState = 'requested' | 'received' | 'ignored';

interface MQTTPacketQos2 extends MQTTPacket {
    ts?: number;
    cmd?: string;
    count?: number;
}

interface MQTTClient {
    __secret: string;
    _will: string;
    id: string;
    iobId: string;
    _messages: (MQTTPacketQos2 | MQTTPacket)[];
    on: (event: string, handler: (arg?: any) => void) => void;
    connack: (options: { returnCode: number; sessionPresent?: boolean }) => void;
    destroy: () => void;
    puback: (options: { messageId: number }) => void;
    pubrel: (options: { messageId: number }) => void;
    pubrec: (options: { messageId: number }) => void;
    pubcomp: (options: { messageId: number }) => void;
    suback: (options: { messageId: number; granted: (0 | 1 | 2 | 128)[] }) => void;
    unsuback: (options: { messageId: number }) => void;
    pingresp: () => void;
    publish: (
        packet: { topic: string; payload: string; qos: 0 | 1 | 2; retain?: boolean; messageId: number },
        cb?: () => void,
    ) => void;
    stream: {
        remoteAddress: string;
        remotePort: number;
    };
    states: {
        [topic: string]: StateState;
    };
    routerId?: string;
}

export default class MQTTServer {
    private readonly mappingClients: { [iobId: string]: string } = {};

    private readonly server: Server;
    private readonly clients: { [id: string]: MQTTClient } = {};
    private pollInterval: NodeJS.Timeout | null = null;

    private cacheAddedObjects: { [objectId: string]: boolean } = {};
    private config: TeltonikaAdapterConfig;
    private adapter: ioBroker.Adapter;
    private messageId = 1;
    private aliveStates: { [clientId: string]: boolean } = {};

    constructor(adapter: ioBroker.Adapter) {
        this.config = adapter.config as TeltonikaAdapterConfig;
        this.server = new Server();
        this.adapter = adapter;
        this.start().catch(error => this.adapter.log.error(`Cannot start broker: ${error}`));
    }

    async start(): Promise<void> {
        this.config.timeout = !this.config.timeout ? 300 : parseInt(this.config.timeout as string, 10);
        this.config.retransmitInterval = parseInt(this.config.retransmitInterval as string, 10) || 2000;
        this.config.retransmitCount = parseInt(this.config.retransmitCount as string, 10) || 10;
        this.config.defaultQoS = parseInt(this.config.defaultQoS as string, 10) || 0;
        this.config.pollInterval = parseInt(this.config.pollInterval as string, 10) || 5000;
        this.config.port = parseInt(this.config.port as string, 10) || 1883;

        this.server.on('connection', (stream: any): void => {
            let client: MQTTClient = mqtt(stream);
            // Store unique connection identifier
            client.__secret = `${Date.now()}_${Math.round(Math.random() * 10000)}`;

            // client connected
            client.on(
                'connect',
                async (options: {
                    clientId: string;
                    password: string;
                    username: string;
                    will?: string;
                }): Promise<void> => {
                    // acknowledge the "connect" packet
                    client.id = options.clientId;
                    client.iobId = client.id.replace(FORBIDDEN_CHARS, '_');
                    this.mappingClients[client.iobId] = client.id;

                    // get possible an old client
                    let oldClient = this.clients[client.id];

                    if (this.config.user) {
                        if (options.password) {
                            options.password = options.password.toString();
                        }
                        if (this.config.user !== options.username || this.config.password !== options.password) {
                            this.adapter.log.warn(`Client [${client.id}] has invalid password or username`);
                            client.connack({ returnCode: 4 });
                            if (oldClient) {
                                // delete existing client
                                delete this.clients[client.id];
                                await this.updateAlive(oldClient, false);
                                await this.updateClients();
                                oldClient.destroy();
                            }
                            client.destroy();
                            return;
                        }
                    }

                    if (oldClient) {
                        this.adapter.log.info(
                            `Client [${client.id}] reconnected. Old secret ${this.clients[client.id].__secret} ==> New secret ${client.__secret}`,
                        );
                        // need to destroy the old client

                        if (client.__secret !== this.clients[client.id].__secret) {
                            // it is another socket!!
                            // It was following situation:
                            // - old connection was active
                            // - new connection is on the same TCP
                            // Just forget him
                            // oldClient.destroy();
                        }
                    } else {
                        this.adapter.log.info(`Client [${client.id}] connected with secret ${client.__secret}`);
                    }

                    let sessionPresent = false;

                    client._messages ||= [];
                    client.states ||= {};

                    client.connack({ returnCode: 0, sessionPresent });
                    this.clients[client.id] = client;
                    await this.updateClients();

                    await this.readId(client);
                },
            );

            // timeout idle streams after 5 minutes
            if (this.config.timeout) {
                stream.setTimeout((this.config.timeout as number) * 1000);
            }

            // connection error handling
            client.on('close', had_error => this.clientClose(client, had_error ? 'closed because of error' : 'closed'));
            client.on('error', e => this.clientClose(client, e));
            client.on('disconnect', () => this.clientClose(client, 'disconnected'));
            // stream timeout
            stream.on('timeout', () => this.clientClose(client, 'timeout'));

            client.on('publish', async (packet: MQTTPacket): Promise<void> => {
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    if (!this.config.ignorePings) {
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends publish. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    }
                    return;
                }

                if (packet.qos === 1) {
                    // send PUBACK to a client
                    client.puback({ messageId: packet.messageId });
                } else if (packet.qos === 2) {
                    const pack = client._messages?.find(e => e.messageId === packet.messageId);
                    if (pack) {
                        // duplicate message => ignore
                        this.adapter.log.warn(
                            `Client [${client.id}] ignored duplicate message with ID: ${packet.messageId}`,
                        );
                        return;
                    } else {
                        const packetQos2: MQTTPacketQos2 = packet as MQTTPacketQos2;
                        packetQos2.ts = Date.now();
                        packetQos2.cmd = 'pubrel';
                        packetQos2.count = 0;
                        client._messages.push(packetQos2);

                        client.pubrec({ messageId: packet.messageId });
                        return;
                    }
                }

                await this.receivedTopic(packet, client);
            });

            // response for QoS2
            client.on('pubrec', packet => {
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    !this.config.ignorePings &&
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends pubrec. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    return;
                }

                let pos = null;
                // remove this message from queue
                client._messages?.forEach((e, i) => {
                    if (e.messageId === packet.messageId) {
                        pos = i;
                        return false;
                    }
                });
                if (pos !== null) {
                    client.pubrel({ messageId: packet.messageId });
                } else {
                    this.adapter.log.warn(
                        `Client [${client.id}] received pubrec on ${client.id} for unknown message ID: ${packet.messageId}`,
                    );
                }
            });

            // response for QoS2
            client.on('pubcomp', packet => {
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    !this.config.ignorePings &&
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends pubcomp. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    return;
                }

                let pos = null;
                // remove this message from queue
                client._messages?.forEach((e, i) => {
                    if (e.messageId === packet.messageId) {
                        pos = i;
                        return false;
                    }
                });
                if (pos !== null) {
                    client._messages?.splice(pos, 1);
                } else {
                    this.adapter.log.warn(
                        `Client [${client.id}] received pubcomp for unknown message ID: ${packet.messageId}`,
                    );
                }
            });

            // response for QoS2
            client.on('pubrel', packet => {
                if (!client._messages) {
                    return;
                }
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    !this.config.ignorePings &&
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends pubrel. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    return;
                }

                let pos = null;
                // remove this message from queue
                client._messages?.forEach((e, i) => {
                    if (e.messageId === packet.messageId) {
                        pos = i;
                        return false;
                    }
                });

                if (pos !== null) {
                    client.pubcomp({ messageId: packet.messageId });

                    this.receivedTopic(client._messages[pos], client);
                    client._messages?.splice(pos, 1);
                } else {
                    this.adapter.log.warn(
                        `Client [${client.id}] received pubrel on ${client.id} for unknown messageId ${packet.messageId}`,
                    );
                }
            });

            // response for QoS1
            client.on('puback', packet => {
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    !this.config.ignorePings &&
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends puback. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    return;
                }

                // remove this message from queue
                let pos = null;
                // remove this message from queue
                client._messages?.forEach((e, i) => {
                    if (e.messageId === packet.messageId) {
                        pos = i;
                        return false;
                    }
                });

                if (pos !== null) {
                    this.adapter.log.debug(
                        `Client [${client.id}] received puback for ${client.id} message ID: ${packet.messageId}`,
                    );
                    client._messages?.splice(pos, 1);
                } else {
                    this.adapter.log.warn(
                        `Client [${client.id}] received puback for unknown message ID: ${packet.messageId}`,
                    );
                }
            });

            client.on('unsubscribe', packet => {
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    !this.config.ignorePings &&
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends unsubscribe. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    return;
                }

                client.unsuback({ messageId: packet.messageId });
            });

            client.on(
                'subscribe',
                (packet: {
                    messageId: number;
                    subscriptions: {
                        qos: 0 | 1 | 2;
                    }[];
                }): void => {
                    if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                        if (!this.config.ignorePings) {
                            this.adapter.log.warn(
                                `Old client ${client.id} with secret ${client.__secret} sends subscribe. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                            );
                        }
                        return;
                    }

                    // just confirm the request.
                    const granted = packet.subscriptions.map(subs => subs.qos);

                    client.suback({ granted, messageId: packet.messageId });
                },
            );

            client.on('pingreq', (/*packet*/) => {
                if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                    !this.config.ignorePings &&
                        this.adapter.log.warn(
                            `Old client ${client.id} with secret ${client.__secret} sends pingreq. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                        );
                    return;
                }

                this.adapter.log.debug(`Client [${client.id}] pingreq`);
                client.pingresp();
            });
        });

        this.server.on('error', err => this.adapter.log.error(`Can not start Server ${err}`));

        // Update connection state
        await this.updateClients();

        // to start
        this.server.listen(this.config.port, this.config.bind, () =>
            this.adapter.log.info(
                `Starting MQTT ${this.config.user ? 'authenticated ' : ''} server on port ${this.config.port}`,
            ),
        );
    }

    readId(client: MQTTClient): Promise<void> {
        return new Promise<void>(resolve =>
            client.publish(
                { topic: 'router/get', payload: 'id', qos: 0, retain: false, messageId: this.messageId++ },
                () => resolve(),
            ),
        );
    }

    private async polling(): Promise<void> {
        for (const clientId in this.clients) {
            if (this.clients[clientId].routerId) {
                // poll all data
                for (const topic in SUPPORTED_TOPICS) {
                    if (!this.clients[clientId].states[topic] || this.clients[clientId].states[topic] === 'received') {
                        this.clients[clientId].states[topic] ||= 'requested';
                        await new Promise<void>(resolve =>
                            this.clients[clientId].publish(
                                {
                                    topic: 'router/get',
                                    payload: topic,
                                    qos: 0,
                                    messageId: this.messageId++,
                                },
                                () => resolve(),
                            ),
                        );
                    }
                }
            }
        }
    }

    startPolling() {
        if (!this.pollInterval) {
            console.log(`${new Date().toISOString()}! START POLLING!`);
            this.polling().catch(error => this.adapter.log.error(`Polling: ${error}`));
            this.pollInterval = setInterval(
                async (): Promise<void> => {
                    console.log(`${new Date().toISOString()}! POLLING!`);
                    this.polling();
                },
                (this.config.pollInterval as number) || 5000,
            );
        }
    }

    stopPolling() {
        if (this.pollInterval) {
            if (Object.keys(this.clients).length === 0) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
        }
    }

    async destroy(): Promise<void> {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        if (this.server) {
            for (const id in this.clients) {
                await this.updateAlive(this.clients[id], false);
            }
            // to release all resources
            await new Promise<void>(resolve => this.server.close(() => resolve()));
        }
    }

    private async addObject(id: string, newObj: ioBroker.StateObject | ioBroker.ChannelObject): Promise<void> {
        if (!this.cacheAddedObjects[id]) {
            this.cacheAddedObjects[id] = true;
            const obj = await this.adapter.getObjectAsync(id);
            if (!obj?.common) {
                await this.adapter.setObjectAsync(id, newObj);
                this.adapter.log.info(`New object created: ${id}`);
            } else if (newObj.type === 'state' && obj.common.type !== newObj.common.type) {
                obj.common.type = newObj.common.type;
                await this.adapter.setObjectAsync(id, obj);
                this.adapter.log.info(`Object updated: ${id}`);
            }
        }
    }

    private async updateClients() {
        await this.adapter.setStateAsync('info.connection', Object.keys(this.clients).join(','), true);
    }

    private async updateAlive(client: MQTTClient, alive: boolean): Promise<void> {
        if (client.routerId && this.aliveStates[client.id] !== alive) {
            await this.addObject(`${client.routerId}.alive`, {
                _id: `${client.routerId}.${alive}`,
                common: {
                    name: 'Connected',
                    role: 'indicator.connected',
                    type: 'boolean',
                    read: true,
                    write: false,
                },
                native: {},
                type: 'state',
            });
            this.aliveStates[client.id] = alive;
            await this.adapter.setForeignStateAsync(`${this.adapter.namespace}.${client.routerId}.alive`, alive, true);
        }
    }

    private async receivedTopic(packet: MQTTPacketQos2, client: MQTTClient): Promise<void> {
        if (!packet) {
            return this.adapter.log.warn(`Empty packet received: ${JSON.stringify(packet)}`);
        }

        // update alive state
        await this.updateAlive(client, true);

        let val = packet.payload.toString('utf8');
        this.adapter.log.debug(`Client [${client.id}] received: ${packet.topic} = ${val}`);
        if (packet.topic === 'router/id') {
            client.routerId = val;
            // Create channel
            await this.addObject(val, {
                _id: `${this.adapter.namespace}.${val}`,
                type: 'channel',
                common: {
                    name: client.id,
                    desc: `Teltonika Router ${val}`,
                },
                native: {},
            });
            this.startPolling();
        } else {
            const name = packet.topic.split('/').pop() || '';
            if (SUPPORTED_TOPICS[name] && client.routerId) {
                client.states[name] = 'received';
                await this.addObject(`${client.routerId}.${name}`, {
                    _id: name,
                    type: 'state',
                    common: SUPPORTED_TOPICS[name].common,
                    native: {},
                });
                let iobValue: ioBroker.StateValue;
                if (SUPPORTED_TOPICS[name].convert) {
                    iobValue = SUPPORTED_TOPICS[name].convert(val);
                } else {
                    iobValue = val;
                }
                await this.adapter.setStateAsync(`${client.routerId}.${name}`, iobValue, true);
                if (name === 'uptime') {
                    await this.addObject(`${client.routerId}.uptimeStr`, {
                        _id: name,
                        type: 'state',
                        common: {
                            name: 'Uptime String',
                            type: 'string',
                            role: 'value.interval',
                            read: true,
                            write: false,
                        },
                        native: {},
                    });
                    await this.adapter.setStateAsync(
                        `${client.routerId}.uptimeStr`,
                        seconds2time(iobValue as number),
                        true,
                    );
                }
            } else {
                this.adapter.log.warn(`Received unknown variable "${packet.topic}": ${packet.payload}`);
            }
        }
    }

    private async clientClose(client: MQTTClient, reason?: string): Promise<void> {
        if (!client) {
            return;
        }

        try {
            if (this.clients[client.id] && client.__secret === this.clients[client.id].__secret) {
                this.adapter.log.info(`Client [${client.id}] connection closed: ${reason}`);
                await this.updateAlive(client, false);
                delete this.clients[client.id];
                await this.updateClients();
            }

            client.destroy();
        } catch (e) {
            this.adapter.log.warn(`Client [${client.id}] cannot close client: ${e}`);
        }
        this.stopPolling();
    }
}
