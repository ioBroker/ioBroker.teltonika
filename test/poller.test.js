'use strict';

const { expect } = require('chai');
const { indexOf, uniqueRowNames, matchInterfaces } = require('../build/lib/snmp/poller.js');
const { TABLE_STATES, BRANCH_STATES } = require('../build/lib/snmp/aliases.js');
const { FAMILY_OIDS } = require('../build/lib/snmp/oids.generated.js');

const PORT = TABLE_STATES.portTable;
const IO = TABLE_STATES.ioTable;

describe('SNMP table helpers', () => {
    describe('indexOf', () => {
        it('returns the part behind the column prefix', () => {
            expect(indexOf('1.3.6.1.4.1.48690.10.2.1.2.7', '1.3.6.1.4.1.48690.10.2.1.2')).to.equal('7');
        });

        it('keeps a composite index intact', () => {
            expect(indexOf('1.3.6.1.4.1.48690.20.2.1.2.4.9', '1.3.6.1.4.1.48690.20.2.1.2')).to.equal('4.9');
        });

        it('rejects an OID outside the column', () => {
            expect(indexOf('1.3.6.1.4.1.48690.10.2.1.3.7', '1.3.6.1.4.1.48690.10.2.1.2')).to.equal(null);
            // A longer sibling column must not match by string prefix alone
            expect(indexOf('1.3.6.1.4.1.48690.10.2.1.20.1', '1.3.6.1.4.1.48690.10.2.1.2')).to.equal(null);
        });
    });

    describe('uniqueRowNames', () => {
        it('keeps unique names readable', () => {
            const rows = new Map([
                ['1', 'port1'],
                ['2', 'port2'],
                ['9', 'sfp1'],
            ]);
            expect([...uniqueRowNames(rows).values()]).to.deep.equal(['port1', 'port2', 'sfp1']);
        });

        it('disambiguates the LAN ports a RUTC reports under one name', () => {
            const rows = new Map([
                ['1', 'WAN'],
                ['2', 'LAN'],
                ['3', 'LAN'],
                ['4', 'LAN'],
                ['5', 'LAN'],
            ]);
            expect([...uniqueRowNames(rows).values()]).to.deep.equal(['WAN', 'LAN_2', 'LAN_3', 'LAN_4', 'LAN_5']);
        });

        it('strips characters an ioBroker id cannot carry', () => {
            const rows = new Map([['1', 'eth 0.1']]);
            expect(uniqueRowNames(rows).get('1')).to.equal('eth_0_1');
        });

        it('treats names that only differ by a stripped character as colliding', () => {
            const rows = new Map([
                ['1', 'lan 1'],
                ['2', 'lan.1'],
            ]);
            expect([...uniqueRowNames(rows).values()]).to.deep.equal(['lan_1_1', 'lan_1_2']);
        });
    });
});

describe('matchInterfaces', () => {
    it('pairs every port of a switch, where both tables use the same names', () => {
        const rowIds = new Map([
            ['1', 'port1'],
            ['2', 'port2'],
            ['9', 'sfp1'],
        ]);
        const { matched, skipped } = matchInterfaces(
            rowIds,
            rowIds,
            new Map([
                ['1', 'lo'],
                ['2', 'eth0'],
                ['3', 'port1'],
                ['4', 'port2'],
                ['11', 'sfp1'],
            ]),
        );
        // The IF-MIB index is offset from the Teltonika one, which is exactly why the match goes by name
        expect(matched.get('port1')).to.equal('3');
        expect(matched.get('port2')).to.equal('4');
        expect(matched.get('sfp1')).to.equal('11');
        expect(skipped).to.deep.equal([]);
    });

    it('matches regardless of case', () => {
        const { matched } = matchInterfaces(
            new Map([['1', 'WAN']]),
            new Map([['1', 'WAN']]),
            new Map([['3', 'wan']]),
        );
        expect(matched.get('WAN')).to.equal('3');
    });

    it('refuses to guess when a name is not unique', () => {
        // A RUTC calls four ports LAN while the IF-MIB has lan1..lan4: no sound pairing exists
        const rowIds = new Map([
            ['1', 'WAN'],
            ['2', 'LAN_2'],
            ['3', 'LAN_3'],
        ]);
        const rawNames = new Map([
            ['1', 'WAN'],
            ['2', 'LAN'],
            ['3', 'LAN'],
        ]);
        const { matched, skipped } = matchInterfaces(
            rowIds,
            rawNames,
            new Map([
                ['3', 'wan'],
                ['4', 'lan1'],
                ['5', 'lan2'],
            ]),
        );
        expect([...matched.keys()]).to.deep.equal(['WAN']);
        expect(skipped).to.deep.equal(['LAN_2', 'LAN_3']);
    });

    it('skips a port the interface table does not know', () => {
        const { matched, skipped } = matchInterfaces(
            new Map([['1', 'port1']]),
            new Map([['1', 'port1']]),
            new Map([['1', 'lo']]),
        );
        expect(matched.size).to.equal(0);
        expect(skipped).to.deep.equal(['port1']);
    });

    it('treats two interfaces of the same name as ambiguous', () => {
        const { matched, skipped } = matchInterfaces(
            new Map([['1', 'port1']]),
            new Map([['1', 'port1']]),
            new Map([
                ['3', 'port1'],
                ['4', 'PORT1'],
            ]),
        );
        expect(matched.size).to.equal(0);
        expect(skipped).to.deep.equal(['port1']);
    });
});

describe('table datapoint conversion', () => {
    it('reads a port link state', () => {
        expect(PORT.state.convert('up')).to.equal(true);
        expect(PORT.state.convert('down')).to.equal(false);
        expect(PORT.state.convert('N/A')).to.equal(null);
    });

    it('reads a digital input level', () => {
        expect(IO.state.convert('1')).to.equal(true);
        expect(IO.state.convert('0')).to.equal(false);
        // ioStateNumeric uses -1 for na
        expect(IO.state.convert('-1')).to.equal(null);
    });

    it('reads plain counters', () => {
        expect(PORT.rxBytes.convert('470749715')).to.equal(470749715);
        expect(PORT.txBytes.convert('0')).to.equal(0);
    });

    it('discards the sign extended counters a TSW202 reports', () => {
        // 0x00fffffffff1374e43 as read from a real device: a negative 32 bit counter widened to 64 bit
        expect(PORT.txBytes.convert('18446744073461517891')).to.equal(null);
        expect(PORT.rxBytes.convert('18446744073709551615')).to.equal(null);
    });

    it('keeps counters below the broken range', () => {
        const belowThreshold = (2n ** 63n - 1n).toString();
        expect(PORT.rxBytes.convert(belowThreshold)).to.be.a('number');
        expect(PORT.rxBytes.convert('9223372036854775808')).to.equal(null);
    });

    it('maps N/A cells to null rather than NaN', () => {
        expect(PORT.speed.convert('N/A')).to.equal(null);
        expect(PORT.duplex.convert('N/A')).to.equal(null);
        expect(IO.current.convert('N/A')).to.equal(null);
    });
});

describe('optional branches', () => {
    it('tags only the optional tables with a branch', () => {
        const tables = FAMILY_OIDS.RUTC.tables;
        expect(tables.radioTable.branch).to.equal('wireless');
        expect(tables.wIfaceTable.branch).to.equal('wireless');
        expect(tables.hsSessionTable.branch).to.equal('hotspot');
        // The datapoints that are always read carry no branch
        expect(tables.portTable.branch).to.equal(undefined);
        expect(tables.ioTable.branch).to.equal(undefined);
    });

    it('never exposes the per-client MAC table', () => {
        // wIfaceClientTable is one row per connected device and would keep a rolling list of hardware addresses
        expect(FAMILY_OIDS.RUTC.tables).to.not.have.property('wIfaceClientTable');
    });

    it('resolves the GPS scalars of a family that has them', () => {
        expect(Object.keys(FAMILY_OIDS.RUTC.branches.gps).sort()).to.deep.equal([
            'accuracy',
            'fixTime',
            'latitude',
            'longitude',
            'satellites',
        ]);
        // A switch has no GPS, so the branch stays empty rather than pointing at guessed OIDs
        expect(FAMILY_OIDS.TSW2.branches).to.not.have.property('gps');
    });

    it('converts the GPS scalars', () => {
        expect(BRANCH_STATES.gps.latitude.convert('38.949089')).to.equal(38.949089);
        expect(BRANCH_STATES.gps.satellites.convert('9')).to.equal(9);
        expect(BRANCH_STATES.gps.accuracy.convert('N/A')).to.equal(null);
    });

    it('reads the integer flags the MIB uses instead of TruthValue', () => {
        expect(TABLE_STATES.radioTable.up.convert('1')).to.equal(true);
        expect(TABLE_STATES.wIfaceTable.hidden.convert('0')).to.equal(false);
        expect(TABLE_STATES.hsSessionTable.authorized.convert('1')).to.equal(true);
        expect(TABLE_STATES.radioTable.up.convert('N/A')).to.equal(null);
    });
});
