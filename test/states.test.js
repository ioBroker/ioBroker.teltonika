'use strict';

const { expect } = require('chai');
const DeviceStates = require('../build/lib/states.js').default;

const DEVICE = '864088062647128';

function makeAdapter() {
    const calls = { getObject: 0, setObject: 0, setState: 0 };
    const objects = {};
    const states = {};
    return {
        namespace: 'teltonika.0',
        objects,
        states,
        calls,
        log: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
        getObjectAsync: async id => {
            calls.getObject++;
            return objects[id] || null;
        },
        setObjectAsync: async (id, obj) => {
            calls.setObject++;
            objects[id] = JSON.parse(JSON.stringify(obj));
        },
        setStateAsync: async (id, val, ack) => {
            calls.setState++;
            states[id] = { val, ack };
        },
    };
}

describe('DeviceStates', () => {
    it('creates the state object and writes the converted value', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        expect(await sut.applyValue(DEVICE, 'temperature', '366')).to.equal(true);

        expect(adapter.objects[`${DEVICE}.temperature`]).to.have.property('type', 'state');
        // topics.ts stores tenths of a degree
        expect(adapter.states[`${DEVICE}.temperature`]).to.deep.equal({ val: 36.6, ack: true });
    });

    it('passes a value through unchanged when the datapoint has no converter', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'operator', 'COSMOTE');

        expect(adapter.states[`${DEVICE}.operator`].val).to.equal('COSMOTE');
    });

    it('maps the "N/A" payload of an absent input to null', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'digital1', 'N/A');

        expect(adapter.states[`${DEVICE}.digital1`].val).to.equal(null);
    });

    it('derives uptimeStr alongside uptime', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'uptime', '93784');

        expect(adapter.states[`${DEVICE}.uptime`].val).to.equal(93784);
        expect(adapter.states[`${DEVICE}.uptimeStr`].val).to.equal('1d 02:03:04');
    });

    it('splits the dual stack address the modem reports', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'wan', '10.176.1.2 2a02:3032:22e:28f2:ed34:bfb:6222:4803');

        // `info.ip` holds a single value, so IPv4 stays in `wan` and IPv6 gets its own state
        expect(adapter.states[`${DEVICE}.wan`].val).to.equal('10.176.1.2');
        expect(adapter.states[`${DEVICE}.wanIPv6`].val).to.equal('2a02:3032:22e:28f2:ed34:bfb:6222:4803');
    });

    it('creates no IPv6 state on a device that has none', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'wan', '1.1.1.1');

        expect(adapter.states[`${DEVICE}.wan`].val).to.equal('1.1.1.1');
        expect(adapter.states).to.not.have.property(`${DEVICE}.wanIPv6`);
    });

    it('falls back to the only address when the modem reports IPv6 alone', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'wan', '2a02:3032:22e:28f2::1');

        expect(adapter.states[`${DEVICE}.wan`].val).to.equal('2a02:3032:22e:28f2::1');
        expect(adapter.states[`${DEVICE}.wanIPv6`].val).to.equal('2a02:3032:22e:28f2::1');
    });

    it('maps an absent address to null', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'wan', 'N/A');

        expect(adapter.states[`${DEVICE}.wan`].val).to.equal(null);
        expect(adapter.states).to.not.have.property(`${DEVICE}.wanIPv6`);
    });

    it('turns an existing state writable once the adapter may write it', async () => {
        const adapter = makeAdapter();
        // Created on an earlier run, before a write community was configured
        adapter.objects[`${DEVICE}.ports.port1.enabled`] = {
            _id: `teltonika.0.${DEVICE}.ports.port1.enabled`,
            type: 'state',
            common: { name: 'Enabled', type: 'boolean', role: 'switch.enable', read: true, write: false },
            native: {},
        };
        const sut = new DeviceStates(adapter);

        await sut.applyDefined(
            `${DEVICE}.ports.port1.enabled`,
            { common: { name: 'Enabled', type: 'boolean', role: 'switch.enable', read: true, write: true } },
            'true',
        );

        // Without this the port would stay read-only and a click in the widget would silently do nothing
        expect(adapter.objects[`${DEVICE}.ports.port1.enabled`].common.write).to.equal(true);
    });

    it('leaves an object alone when nothing the adapter owns has changed', async () => {
        const adapter = makeAdapter();
        adapter.objects[`${DEVICE}.signal`] = {
            _id: `teltonika.0.${DEVICE}.signal`,
            type: 'state',
            common: { name: 'Renamed by the user', type: 'number', role: 'value', read: true, write: false },
            native: {},
        };
        const sut = new DeviceStates(adapter);

        await sut.applyValue(DEVICE, 'signal', '-64');

        expect(adapter.calls.setObject).to.equal(0);
        // A name the user changed must survive
        expect(adapter.objects[`${DEVICE}.signal`].common.name).to.equal('Renamed by the user');
    });

    it('reports an unknown datapoint and writes nothing', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        expect(await sut.applyValue(DEVICE, 'notADatapoint', '1')).to.equal(false);
        expect(adapter.calls.setObject).to.equal(0);
        expect(adapter.calls.setState).to.equal(0);
    });

    it('creates every object only once, however often a value arrives', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        for (let i = 0; i < 5; i++) {
            await sut.applyValue(DEVICE, 'signal', `-6${i}`);
        }

        expect(adapter.calls.getObject).to.equal(1);
        expect(adapter.calls.setObject).to.equal(1);
        expect(adapter.calls.setState).to.equal(5);
        expect(adapter.states[`${DEVICE}.signal`].val).to.equal(-64);
    });

    it('writes alive only when it actually changes', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.setAlive(DEVICE, true);
        await sut.setAlive(DEVICE, true);
        await sut.setAlive(DEVICE, false);

        expect(adapter.calls.setState).to.equal(2);
        expect(adapter.states[`${DEVICE}.alive`]).to.deep.equal({ val: false, ack: true });
        expect(adapter.objects[`${DEVICE}.alive`].common.role).to.equal('indicator.connected');
        // The object id must carry the name, not the boolean it was created with
        expect(adapter.objects[`${DEVICE}.alive`]._id).to.equal(`teltonika.0.${DEVICE}.alive`);
    });

    it('creates the device channel', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);

        await sut.ensureDevice(DEVICE, 'Emitter*1');

        expect(adapter.objects[DEVICE]).to.include({ type: 'channel' });
        expect(adapter.objects[DEVICE].common.name).to.equal('Emitter*1');
    });
});

describe('nameChannel', () => {
    const PORT = `${DEVICE}.ports.port1`;

    async function withPort(name, native = {}) {
        const adapter = makeAdapter();
        adapter.objects[PORT] = { type: 'channel', common: { name }, native };
        return { adapter, sut: new DeviceStates(adapter) };
    }

    it('names a port after the description set on the device', async () => {
        const { adapter, sut } = await withPort('port1');
        await sut.nameChannel(PORT, 'ReolinkCockpit', 'port1');
        expect(adapter.objects[PORT].common.name).to.equal('ReolinkCockpit');
        expect(adapter.objects[PORT].native.deviceName).to.equal('ReolinkCockpit');
    });

    it('follows a description changed on the device', async () => {
        const { adapter, sut } = await withPort('ReolinkCockpit', { deviceName: 'ReolinkCockpit' });
        await sut.nameChannel(PORT, 'Bow camera', 'port1');
        expect(adapter.objects[PORT].common.name).to.equal('Bow camera');
    });

    it('goes back to the port name when the description is deleted', async () => {
        const { adapter, sut } = await withPort('ReolinkCockpit', { deviceName: 'ReolinkCockpit' });
        await sut.nameChannel(PORT, '', 'port1');
        expect(adapter.objects[PORT].common.name).to.equal('port1');
    });

    it('keeps a name the user gave in ioBroker', async () => {
        const { adapter, sut } = await withPort('Cockpit camera', { deviceName: 'ReolinkCockpit' });
        await sut.nameChannel(PORT, 'Bow camera', 'port1');
        expect(adapter.objects[PORT].common.name).to.equal('Cockpit camera');

        const translated = await withPort({ en: 'Camera', de: 'Kamera' });
        await translated.sut.nameChannel(PORT, 'Bow camera', 'port1');
        expect(translated.adapter.objects[PORT].common.name).to.deep.equal({ en: 'Camera', de: 'Kamera' });
    });

    it('reads the object only when the description changes', async () => {
        const { adapter, sut } = await withPort('port1');
        await sut.nameChannel(PORT, 'ReolinkCockpit', 'port1');
        await sut.nameChannel(PORT, 'ReolinkCockpit', 'port1');
        await sut.nameChannel(PORT, 'ReolinkCockpit', 'port1');
        expect(adapter.calls.getObject).to.equal(1);
        expect(adapter.calls.setObject).to.equal(1);
    });

    it('waits for a channel that does not exist yet', async () => {
        const adapter = makeAdapter();
        const sut = new DeviceStates(adapter);
        await sut.nameChannel(PORT, 'ReolinkCockpit', 'port1');
        expect(adapter.objects[PORT]).to.equal(undefined);

        adapter.objects[PORT] = { type: 'channel', common: { name: 'port1' }, native: {} };
        await sut.nameChannel(PORT, 'ReolinkCockpit', 'port1');
        expect(adapter.objects[PORT].common.name).to.equal('ReolinkCockpit');
    });
});
