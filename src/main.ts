import { Adapter, type AdapterOptions } from '@iobroker/adapter-core'; // Get common this utils
import Server from './lib/server';

export class TeltonikaAdapter extends Adapter {
    private server: Server | null = null;

    public constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: 'teltonika',
            ready: () => this.main(),
            unload: (cb: () => void) => this.unload(cb),
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

        this.server = new Server(this as unknown as ioBroker.Adapter);
    }

    async unload(cb: () => void): Promise<void> {
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
