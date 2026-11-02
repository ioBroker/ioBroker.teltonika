import { Adapter, type AdapterOptions } from '@iobroker/adapter-core'; // Get common this utils
import Server from './lib/server';
import DeviceStates from './lib/states';
import SnmpManager from './lib/snmp/poller';
import PresenceTracker, { DEFAULT_GRACE } from './lib/presence';
import { mergeDevices, scanRange } from './lib/snmp/scan';
import { describeStations, mergeStations, readStations } from './lib/snmp/stations';
import type { SnmpDeviceEntry, TeltonikaAdapterConfig } from './types';

export class TeltonikaAdapter extends Adapter {
    private server: Server | null = null;
    private snmp: SnmpManager | null = null;
    private presence: PresenceTracker | null = null;

    public constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: 'teltonika',
            ready: () => this.main(),
            unload: (cb: () => void) => this.unload(cb),
            message: (obj: ioBroker.Message) => void this.onMessage(obj),
            stateChange: (id: string, state: ioBroker.State | null | undefined) => void this.onStateChange(id, state),
        });
    }

    async main(): Promise<void> {
        // read all states and set alive to false
        const states = await this.getStatesOfAsync();
        if (states?.length) {
            for (const state of states) {
                if (state._id.endsWith('.alive')) {
                    await this.setForeignStateAsync(state._id, false, true);
                }
            }
        }

        // Both transports share one layer, so the object cache and the device ownership are common to them
        const deviceStates = new DeviceStates(this);
        this.server = new Server(this, deviceStates);

        const config = this.config as unknown as TeltonikaAdapterConfig;
        for (const device of config.snmpDevices || []) {
            device.community = this.decryptCredential(device.community);
            device.authKey = this.decryptCredential(device.authKey);
            device.privKey = this.decryptCredential(device.privKey);
            device.writeCommunity = this.decryptCredential(device.writeCommunity);
            device.apiPassword = this.decryptCredential(device.apiPassword);
        }
        // Presence watches the persons the user named, whichever router reports their devices
        const presence = new PresenceTracker(this, config.presenceDevices || [], {
            grace: Number(config.presenceGrace) > 0 ? Number(config.presenceGrace) : DEFAULT_GRACE,
            historyLength: Number(config.presenceHistory) || undefined,
            guestSsids: (config.presenceGuestSsids || '').split(/[,;]/),
            unknown: !!config.presenceUnknown,
        });
        // also without anything configured: start() deletes what a former configuration left behind
        await presence.start();
        if (presence.enabled) {
            this.presence = presence;
        }

        if (config.snmpDevices?.length) {
            // The station list is needed for presence as well, so asking for presence switches that read on
            // without also putting every observed MAC address into the object tree
            const wantsClients = !!config.snmpWifiClients || !!this.presence;
            const branches = [
                config.snmpGps ? 'gps' : null,
                config.snmpHotspot ? 'hotspot' : null,
                config.snmpWireless ? 'wireless' : null,
                wantsClients ? 'clients' : null,
            ].filter((branch): branch is string => branch !== null);
            // Only the port and PoE switches are writable; everything else the adapter creates is read-only
            await this.subscribeStatesAsync('*.ports.*.enabled');
            await this.subscribeStatesAsync('*.ports.*.poe');
            this.snmp = new SnmpManager(this, deviceStates, branches, {
                presence: this.presence,
                exposeClients: !!config.snmpWifiClients,
            });
            this.snmp.start(config.snmpDevices, {
                enabled: config.trapsEnabled,
                port: config.trapPort,
                community: this.decryptCredential(config.trapCommunity),
            });
        } else if (this.presence) {
            this.log.warn(
                'Presence is configured, but no SNMP device is. The MQTT publisher of a router cannot report ' +
                    'its Wi-Fi clients, so presence is read over SNMP only.',
            );
        }
    }

    /**
     * The device picker of the widget configuration.
     *
     * Read from the object tree rather than the configuration: MQTT routers announce themselves and SNMP
     * devices appear on their first poll, so the configured device table knows only part of them. Shaped as
     * json-config's `selectSendTo` expects, `{ value, label }`, with the channel id as the value because that
     * is what the widget subscribes below.
     */
    private async sendDeviceList(obj: ioBroker.Message): Promise<void> {
        const list: { value: string; label: string }[] = [];
        try {
            const channels = await this.getChannelsOfAsync();
            const depth = `${this.namespace}.`.split('.').length;
            for (const channel of channels || []) {
                // Device channels sit directly under the instance; `ports`, `io` and their rows are deeper
                if (channel._id.split('.').length !== depth || channel._id.endsWith('.info')) {
                    continue;
                }
                const id = channel._id.slice(this.namespace.length + 1);
                const name = typeof channel.common?.name === 'string' ? channel.common.name : '';
                list.push({
                    value: channel._id,
                    label: name && name !== id ? `${id} — ${name}` : id,
                });
            }
            list.sort((a, b) => a.label.localeCompare(b.label));
        } catch (error) {
            this.log.warn(`Cannot collect the device list: ${error instanceof Error ? error.message : error}`);
        }
        if (obj.callback) {
            this.sendTo(obj.from, obj.command, list, obj.callback);
        }
    }

    /**
     * Answers the "read connected devices" button of the presence tab.
     *
     * Reads the association list of every configured SNMP device and appends the stations that are not listed
     * yet, so the MAC addresses do not have to be typed. The reply carries both the table and a readable
     * summary, because the MAC alone says little — which of them is a phone is told by the random address.
     */
    private async sendStationList(obj: ioBroker.Message): Promise<void> {
        const config = this.config as unknown as TeltonikaAdapterConfig;
        const devices = (config.snmpDevices || []).filter(device => device.enabled !== false && device.host);
        if (!devices.length) {
            if (obj.callback) {
                this.sendTo(
                    obj.from,
                    obj.command,
                    { error: 'No SNMP device is configured. Wi-Fi clients can only be read over SNMP.' },
                    obj.callback,
                );
            }
            return;
        }

        const scans = await Promise.all(
            devices.map(device =>
                readStations({
                    ...device,
                    community: this.decryptCredential(device.community),
                    authKey: this.decryptCredential(device.authKey),
                    privKey: this.decryptCredential(device.privKey),
                }),
            ),
        );
        const stations = scans.flatMap(scan => scan.stations);
        const { devices: presenceDevices, added, renamed } = mergeStations(config.presenceDevices, stations);

        const lines = describeStations(scans, added);
        const failed = scans.filter(scan => scan.error);
        if (failed.length) {
            this.log.warn(`Wi-Fi clients: ${failed.length} of ${scans.length} device(s) could not be read`);
        }
        this.log.info(`Wi-Fi clients: ${stations.length} station(s), ${added.length} new, ${renamed} renamed`);
        for (const line of lines) {
            this.log.info(`  ${line}`);
        }

        // Nothing answered at all: that is an error the dialog has to show, not a quiet "0 added"
        if (failed.length === scans.length) {
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { error: lines.join('\n') }, obj.callback);
            }
            return;
        }
        // Every device that answered is a switch: a quiet "0 added" would not say why
        if (scans.every(scan => scan.error || scan.noWifi)) {
            lines.unshift('None of the configured SNMP devices has Wi-Fi.');
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { error: lines.join('\n') }, obj.callback);
            }
            return;
        }

        if (obj.callback) {
            this.sendTo(
                obj.from,
                obj.command,
                {
                    native: { presenceDevices },
                    result: `${added.length} of ${stations.length} station(s) added as inactive rows${
                        renamed ? `, ${renamed} placeholder name(s) replaced` : ''
                    }:\n${lines.join('\n')}`,
                },
                obj.callback,
            );
        }
    }

    /**
     * Decrypt a credential that `encryptedNative` covers.
     *
     * js-controller only auto-decrypts plain top-level attributes, never a path into a table, so the device
     * table has to be unlocked here. Guarded by the marker on purpose: `decrypt` falls back to a symmetric XOR
     * for anything that does not carry it, which would turn a still unencrypted value into garbage — and a row
     * the network scan just added is exactly that until the user saves the configuration once.
     */
    private decryptCredential(value: string | undefined): string | undefined {
        return value?.startsWith('$/aes-192-cbc:') ? this.decrypt(value) : value;
    }

    /**
     * A port or PoE switch was written. Acknowledged states are the adapter's own readings and must be ignored,
     * or every poll would trigger a write back to the device.
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (!state || state.ack || !this.snmp) {
            return;
        }
        const local = id.startsWith(`${this.namespace}.`) ? id.slice(this.namespace.length + 1) : id;
        const match = /^(.+)\.ports\.([^.]+)\.(enabled|poe)$/.exec(local);
        if (!match) {
            return;
        }
        const [, deviceId, port, what] = match;
        try {
            if (what === 'poe') {
                if (!(await this.snmp.setPortPoe(deviceId, port, !!state.val))) {
                    this.log.warn(`Cannot switch ${local}: no web login configured, or the port has no PoE`);
                }
            } else if (!(await this.snmp.setPortEnabled(deviceId, port, !!state.val))) {
                this.log.warn(`Cannot switch ${local}: no write community configured, or the port has no match`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log.error(`Cannot switch ${local}: ${message}`);
        }
    }

    /**
     * Answers the scan button of the admin page. `useNative` means the reply has to carry a `native` attribute,
     * which admin then merges into the form the user is looking at.
     */
    private async onMessage(obj: ioBroker.Message): Promise<void> {
        if (obj?.command === 'presence' || obj?.command === 'personList') {
            // The persons for the widgets. `personList` feeds the `autocompleteSendTo` of the device tile,
            // which only takes an array
            const info = this.presence?.info() ?? { persons: [], groups: [] };
            const answer =
                obj.command === 'presence'
                    ? info
                    : info.persons
                          .map(person => person.name)
                          .sort((a, b) => a.localeCompare(b))
                          .map(name => ({ label: name, value: name }));
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, answer, obj.callback);
            }
            return;
        }
        if (obj?.command === 'teltonika:getDevices') {
            await this.sendDeviceList(obj);
            return;
        }
        if (obj?.command === 'teltonika:getWifiClients') {
            await this.sendStationList(obj);
            return;
        }
        if (obj?.command !== 'scan') {
            return;
        }
        const params = (obj.message || {}) as {
            range?: string;
            community?: string;
            version?: SnmpDeviceEntry['version'];
        };
        const config = this.config as unknown as TeltonikaAdapterConfig;
        const defaults = {
            version: params.version || 'v2c',
            community: params.community || 'public',
        } as const;

        try {
            const found = await scanRange(params.range || '', defaults);
            this.log.info(`SNMP scan of "${params.range}": ${found.length} device(s) found`);
            for (const device of found) {
                this.log.info(`  ${device.host}: ${device.productCode} (${device.fwVersion})`);
            }
            const snmpDevices = mergeDevices(config.snmpDevices, found, defaults);
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { native: { snmpDevices } }, obj.callback);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log.warn(`SNMP scan failed: ${message}`);
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { error: message }, obj.callback);
            }
        }
    }

    async unload(cb: () => void): Promise<void> {
        if (this.presence) {
            this.presence.stop();
            this.presence = null;
        }
        if (this.snmp) {
            await this.snmp.destroy();
            this.snmp = null;
        }
        if (this.server) {
            await this.server.destroy();
            this.server = null;
        }
        if (typeof cb === 'function') {
            cb();
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<AdapterOptions> | undefined) => new TeltonikaAdapter(options);
} else {
    // otherwise start the instance directly
    (() => new TeltonikaAdapter())();
}
