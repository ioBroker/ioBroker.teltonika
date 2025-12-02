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
    messageId: string;
    retain: boolean;
}

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
    puback: (options: { messageId: string }) => void;
    pubrel: (options: { messageId: string }) => void;
    pubrec: (options: { messageId: string }) => void;
    pubcomp: (options: { messageId: string }) => void;
    suback: (options: { messageId: string; granted: (0 | 1 | 2 | 128)[] }) => void;
    unsuback: (options: { messageId: string }) => void;
    pingresp: () => void;
    stream: {
        remoteAddress: string;
        remotePort: number;
    };
    states: {
        [topic: string]: {
            message: Buffer;
            retain: boolean;
            qos: 1 | 0 | 2;
        };
    };
}

export default class MQTTServer {
    private readonly mappingClients: { [iobId: string]: string } = {};

    private readonly server: Server;
    private readonly clients: { [id: string]: MQTTClient } = {};

    private cacheAddedObjects: { [objectId: string]: boolean } = {};
    private config: TeltonikaAdapterConfig;
    private adapter: ioBroker.Adapter;

    constructor(adapter: ioBroker.Adapter) {
        this.config = adapter.config as TeltonikaAdapterConfig;
        this.server = new Server();
        this.adapter = adapter;
        this.start().catch(error => this.adapter.log.error(`Cannot start broker: ${error}`));
    }

    async start(): Promise<void> {
        if (this.config.timeout === undefined) {
            this.config.timeout = 300;
        } else {
            this.config.timeout = parseInt(this.config.timeout as string, 10);
        }

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

                    client.connack({ returnCode: 0, sessionPresent });
                    this.clients[client.id] = client;
                    await this.updateClients();

                    await this.createClient(client);
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

            client.on(
                'publish',
                async (packet: MQTTPacket): Promise<void> => {
                    if (this.clients[client.id] && client.__secret !== this.clients[client.id].__secret) {
                        !this.config.ignorePings &&
                            this.adapter.log.warn(
                                `Old client ${client.id} with secret ${client.__secret} sends publish. Ignore! Actual secret is ${this.clients[client.id].__secret}`,
                            );
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
                },
            );

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
                    messageId: string;
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

        this.config.port = parseInt(this.config.port as string, 10) || 1883;

        this.config.retransmitInterval = this.config.retransmitInterval || 2000;
        this.config.retransmitCount = this.config.retransmitCount || 10;
        this.config.defaultQoS = parseInt(this.config.defaultQoS as string, 10) || 0;

        // Update connection state
        await this.updateClients();

        // to start
        this.server.listen(this.config.port, this.config.bind, () => {
            this.adapter.log.info(
                `Starting MQTT ${this.config.user ? 'authenticated ' : ''} server on port ${this.config.port}`,
            );
        });
    }

    async destroy(): Promise<void> {
        if (this.server) {
            for (const id in this.clients) {
                await this.adapter.setForeignStateAsync(
                    `${this.adapter.namespace}.${this.clients[id].iobId}.alive`,
                    false,
                    true,
                );
            }
            // to release all resources
            await new Promise<void>(resolve => this.server.close(() => resolve()));
        }
    }

    private async addObject(id: string, newObj: ioBroker.StateObject | ioBroker.ChannelObject): Promise<void> {
        if (!this.cacheAddedObjects[id]) {
            this.cacheAddedObjects[id] = true;
            const obj = await this.adapter.getForeignObjectAsync(id);
            if (!obj?.common) {
                await this.adapter.setForeignObjectAsync(id, newObj);
                this.adapter.log.info(`New object created: ${id}`);
            } else if (newObj.type === 'state' && obj.common.type !== newObj.common.type) {
                obj.common.type = newObj.common.type;
                await this.adapter.setForeignObjectAsync(id, obj);
                this.adapter.log.info(`Object updated: ${id}`);
            }
        }
    }

    private async createClient(client: MQTTClient): Promise<void> {
        let id = `${this.adapter.namespace}.${client.iobId}`;
        await this.addObject(id, {
            _id: id,
            common: {
                name: client.id,
                desc: '',
            },
            native: {
                clientId: client.id,
            },
            type: 'channel',
        });

        await this.addObject(`${id}.alive`, {
            _id: `${id}.alive`,
            common: {
                type: 'boolean',
                role: 'indicator.reachable',
                read: true,
                write: false,
                name: `${client.id} alive`,
            },
            native: {},
            type: 'state',
        });
    }

    private async updateClients() {
        const clientIds = [];
        if (this.clients) {
            for (const id in this.clients) {
                const oid = `info.clients.${id.replace(/[.\s]+/g, '_').replace(FORBIDDEN_CHARS, '_')}`;
                clientIds.push(oid);
                const clientObj = await this.adapter.getObjectAsync(oid);
                if (!clientObj?.native) {
                    await this.adapter.setObjectAsync(oid, {
                        type: 'state',
                        common: {
                            name: id,
                            role: 'indicator.reachable',
                            type: 'boolean',
                            read: true,
                            write: false,
                        },
                        native: {
                            ip: this.clients[id].stream.remoteAddress,
                            port: this.clients[id].stream.remotePort,
                        },
                    });
                } else {
                    if (
                        this.clients[id] &&
                        (clientObj.native.port !== this.clients[id].stream.remotePort ||
                            clientObj.native.ip !== this.clients[id].stream.remoteAddress)
                    ) {
                        clientObj.native.port = this.clients[id].stream.remotePort;
                        clientObj.native.ip = this.clients[id].stream.remoteAddress;
                        await this.adapter.setObjectAsync(clientObj._id, clientObj);
                    }
                }
                await this.adapter.setStateAsync(oid, true, true);
            }
        }
        // read all other states and set alive to false
        const allStates = await this.adapter.getStatesAsync('info.clients.*');
        for (const id in allStates) {
            if (!clientIds.includes(id.replace(`${this.adapter.namespace}.`, ''))) {
                await this.adapter.setStateAsync(id, { val: false, ack: true });
            }
        }

        let text = '';
        if (this.clients) {
            for (let id in this.clients) {
                text += `${text ? ',' : ''}${id}`;
            }
        }
        await this.adapter.setStateAsync('info.connection', text, true);
    }

    private async updateAlive(client: MQTTClient, alive: boolean): Promise<void> {
        let idAlive = `${this.adapter.namespace}.${client.iobId}.alive`;

        const state = await this.adapter.getForeignStateAsync(idAlive);
        if (!state || state.val !== alive) {
            this.adapter.setForeignStateAsync(idAlive, alive, true);
        }
    }

    private receivedTopic(
        packet: {
            qos: 0 | 1 | 2;
            topic: string;
            payload: Buffer;
            messageId: string;
            retain: boolean;
            ts?: number;
            cmd?: string;
            count?: number;
        },
        client: MQTTClient,
    ): void {
        if (!packet) {
            return this.adapter.log.warn(`Empty packet received: ${JSON.stringify(packet)}`);
        }

        client.states ||= {};
        client.states[packet.topic] = {
            message: packet.payload,
            retain: packet.retain,
            qos: packet.qos,
        };

        // update alive state
        this.updateAlive(client, true);

        let val = packet.payload.toString('utf8');
        this.adapter.log.debug(`Client [${client.id}] received: ${packet.topic} = ${val}`);

        const parts = packet.topic.split('/');

        const stateId = parts.pop();
        // TODO
        console.log(stateId, packet.payload);
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
                client.destroy();
            } else {
                client.destroy();
            }
        } catch (e) {
            this.adapter.log.warn(`Client [${client.id}] cannot close client: ${e}`);
        }
    }
}
