'use strict';

const { expect } = require('chai');
const { expandRange, mergeDevices } = require('../build/lib/snmp/scan.js');

describe('expandRange', () => {
    it('takes a single address', () => {
        expect(expandRange('192.168.1.1')).to.deep.equal(['192.168.1.1']);
    });

    it('leaves network and broadcast out of a CIDR block', () => {
        const hosts = expandRange('192.168.1.0/24');
        expect(hosts).to.have.lengthOf(254);
        expect(hosts[0]).to.equal('192.168.1.1');
        expect(hosts[253]).to.equal('192.168.1.254');
    });

    it('handles a block that is not aligned to its boundary', () => {
        // 192.168.1.77/24 still describes the whole 192.168.1.0 network
        expect(expandRange('192.168.1.77/24')[0]).to.equal('192.168.1.1');
    });

    it('keeps both addresses of a /31 and the single address of a /32', () => {
        expect(expandRange('10.0.0.4/31')).to.deep.equal(['10.0.0.4', '10.0.0.5']);
        expect(expandRange('10.0.0.4/32')).to.deep.equal(['10.0.0.4']);
    });

    it('crosses an octet boundary in an explicit range', () => {
        const hosts = expandRange('192.168.1.254-192.168.2.2');
        expect(hosts).to.deep.equal(['192.168.1.254', '192.168.1.255', '192.168.2.0', '192.168.2.1', '192.168.2.2']);
    });

    it('rejects malformed input', () => {
        expect(() => expandRange('')).to.throw(/No address range/);
        expect(() => expandRange('192.168.1')).to.throw(/not an IPv4 address/);
        expect(() => expandRange('192.168.1.300')).to.throw(/not an IPv4 address/);
        expect(() => expandRange('192.168.1.0/33')).to.throw(/valid CIDR/);
        expect(() => expandRange('192.168.1.50-192.168.1.10')).to.throw(/ends before it starts/);
    });

    it('refuses a range too large to scan', () => {
        expect(() => expandRange('10.0.0.0/16')).to.throw(/at most 1024/);
    });
});

describe('mergeDevices', () => {
    const found = [
        { host: '192.168.1.1', serial: '6006072934', productCode: 'RUTC5020XXXX', fwVersion: 'RUTC_R_00.07.24.1' },
        { host: '192.168.1.2', serial: '6007866821', productCode: 'TSW20200XXXX', fwVersion: 'TSW2_R_00.01.10' },
    ];

    it('appends found devices to an empty list', () => {
        const merged = mergeDevices([], found, { version: 'v2c', community: 'public' });
        expect(merged.map(entry => entry.host)).to.deep.equal(['192.168.1.1', '192.168.1.2']);
        expect(merged[0]).to.include({ enabled: true, port: 161, version: 'v2c', community: 'public' });
    });

    it('copes with an undefined list', () => {
        expect(mergeDevices(undefined, found)).to.have.lengthOf(2);
    });

    it('never touches an entry the user has configured', () => {
        const existing = [{ enabled: false, host: '192.168.1.1', version: 'v3', user: 'ops', pollInterval: 60000 }];
        const merged = mergeDevices(existing, found);
        expect(merged).to.have.lengthOf(2);
        // The configured entry survives a rescan unchanged, credentials and all
        expect(merged[0]).to.deep.equal(existing[0]);
        expect(merged[1].host).to.equal('192.168.1.2');
    });

    it('does not add a host that is already listed', () => {
        const existing = [{ host: '192.168.1.2', version: 'v2c' }];
        expect(mergeDevices(existing, found).map(entry => entry.host)).to.deep.equal([
            '192.168.1.2',
            '192.168.1.1',
        ]);
    });

    it('ignores surrounding whitespace when comparing hosts', () => {
        const existing = [{ host: ' 192.168.1.1 ', version: 'v2c' }];
        expect(mergeDevices(existing, found)).to.have.lengthOf(2);
    });
});
