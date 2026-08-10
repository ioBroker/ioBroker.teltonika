import { Adapter, type AdapterOptions } from '@iobroker/adapter-core'; // Get common this utils
import Server from './lib/server';
import DeviceStates from './lib/states';
import SnmpManager from './lib/snmp/poller';
import { mergeDevices, scanRange } from './lib/snmp/scan';
import type { SnmpDeviceEntry, TeltonikaAdapterConfig } from './types';

export class TeltonikaAdapter extends Adapter {
    private server: Server | null = null;
    private snmp: SnmpManager | null = null;

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
        }
        if (config.snmpDevices?.length) {
            const branches = [
                config.snmpGps ? 'gps' : null,
                config.snmpHotspot ? 'hotspot' : null,
                config.snmpWireless ? 'wireless' : null,
            ].filter((branch): branch is string => branch !== null);
            // Only the port switches are writable; everything else the adapter creates is read-only
            await this.subscribeStatesAsync('*.ports.*.enabled');
            this.snmp = new SnmpManager(this, deviceStates, branches);
            this.snmp.start(config.snmpDevices, {
                enabled: config.trapsEnabled,
                port: config.trapPort,
                community: this.decryptCredential(config.trapCommunity),
            });
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
     * A port switch was written. Acknowledged states are the adapter's own readings and must be ignored, or
     * every poll would trigger a write back to the device.
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (!state || state.ack || !this.snmp) {
            return;
        }
        const local = id.startsWith(`${this.namespace}.`) ? id.slice(this.namespace.length + 1) : id;
        const match = /^(.+)\.ports\.([^.]+)\.enabled$/.exec(local);
        if (!match) {
            return;
        }
        const [, deviceId, port] = match;
        try {
            if (!(await this.snmp.setPortEnabled(deviceId, port, !!state.val))) {
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
        if (obj?.command === 'teltonika:getDevices') {
            await this.sendDeviceList(obj);
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
