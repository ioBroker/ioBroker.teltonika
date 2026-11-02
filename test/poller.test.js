'use strict';

const { expect } = require('chai');
const {
    indexOf,
    uniqueRowNames,
    matchInterfaces,
    clientsWithSsid,
    addressesByInterface,
    lanAddress,
    poeStates,
    poeStatus,
} = require('../build/lib/snmp/poller.js');
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

    it('keeps the per-client MAC table out of the generic table path', () => {
        // Resolved like every other table, but only read while the `clients` branch is on
        expect(FAMILY_OIDS.RUTC.tables.wIfaceClientTable.branch).to.equal('clients');
        expect(FAMILY_OIDS.RUTC.tables.wIfaceClientTable.rowName).to.equal('1.3.6.1.4.1.48690.7.5.1.3');
        // No TABLE_STATES entry, so a channel per MAC address cannot appear by accident
        expect(TABLE_STATES).to.not.have.property('wIfaceClientTable');
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

describe('clientsWithSsid', () => {
    it('names the network each station joined', () => {
        const macs = new Map([
            ['1', 'A1:B2:C3:D4:E5:F6'],
            ['2', '00:11:22:33:44:55'],
        ]);
        // wIfaceClientInterfaceIndex points into wIfaceTable, whose naming column holds the SSID
        const ifaces = new Map([
            ['1', '1'],
            ['2', '2'],
        ]);
        const ssids = new Map([
            ['1', 'Home'],
            ['2', 'Guest'],
        ]);

        expect(clientsWithSsid(macs, ifaces, ssids)).to.deep.equal([
            { mac: '00:11:22:33:44:55', ssid: 'Guest' },
            { mac: 'A1:B2:C3:D4:E5:F6', ssid: 'Home' },
        ]);
    });

    it('keeps a station whose interface cannot be resolved', () => {
        // The wireless branch may be off, or the device may report an index the interface table does not have
        const macs = new Map([['7', 'A1:B2:C3:D4:E5:F6']]);

        expect(clientsWithSsid(macs, new Map(), new Map())).to.deep.equal([
            { mac: 'A1:B2:C3:D4:E5:F6', ssid: null },
        ]);
    });

    it('sorts, so the JSON state follows the clients and not the walk order', () => {
        const ssids = new Map([['1', 'Home']]);
        const first = clientsWithSsid(
            new Map([
                ['1', 'bb:bb:bb:bb:bb:bb'],
                ['2', 'aa:aa:aa:aa:aa:aa'],
            ]),
            new Map([
                ['1', '1'],
                ['2', '1'],
            ]),
            ssids,
        );
        const second = clientsWithSsid(
            new Map([
                ['5', 'aa:aa:aa:aa:aa:aa'],
                ['6', 'bb:bb:bb:bb:bb:bb'],
            ]),
            new Map([
                ['5', '1'],
                ['6', '1'],
            ]),
            ssids,
        );

        expect(JSON.stringify(first)).to.equal(JSON.stringify(second));
    });

    it('reports an empty table as nobody connected', () => {
        expect(clientsWithSsid(new Map(), new Map(), new Map())).to.deep.equal([]);
    });
});

describe('interface addresses', () => {
    // What a RUTC50 answers: ipAdEntIfIndex keyed by the address, ifDescr for the interfaces it names
    const RUTC_INDICES = new Map([
        ['10.179.26.239', '79'],
        ['100.67.162.12', '3'],
        ['127.0.0.1', '1'],
        ['192.168.1.1', '14'],
    ]);
    const RUTC_NAMES = new Map([
        ['1', 'lo'],
        ['3', 'wan'],
        ['14', 'br-lan'],
        ['79', 'qmimux0'],
    ]);

    it('groups the addresses by interface and leaves loopback out', () => {
        expect([...addressesByInterface(RUTC_INDICES, RUTC_NAMES)]).to.deep.equal([
            ['qmimux0', ['10.179.26.239']],
            ['wan', ['100.67.162.12']],
            ['br-lan', ['192.168.1.1']],
        ]);
    });

    it('keeps every address of an interface that carries several', () => {
        const indices = new Map([
            ['192.168.1.1', '14'],
            ['192.168.2.1', '14'],
        ]);
        expect(addressesByInterface(indices, new Map([['14', 'br-lan']])).get('br-lan')).to.deep.equal([
            '192.168.1.1',
            '192.168.2.1',
        ]);
    });

    it('names an interface without ifDescr by its index', () => {
        expect([...addressesByInterface(new Map([['10.0.0.1', '7']]), new Map()).keys()]).to.deep.equal(['if7']);
    });

    it('takes br-lan of a router as its LAN address, not the modem or the wired WAN', () => {
        expect(lanAddress(addressesByInterface(RUTC_INDICES, RUTC_NAMES), '192.168.1.1')).to.equal('192.168.1.1');
    });

    it('takes the bridge of a TSW switch', () => {
        const byInterface = addressesByInterface(
            new Map([
                ['127.0.0.1', '1'],
                ['192.168.1.3', '14'],
            ]),
            new Map([
                ['1', 'lo'],
                ['14', 'br0.1'],
            ]),
        );
        // Polled by a host name, so only the bridge can tell
        expect(lanAddress(byInterface, 'switch.local')).to.equal('192.168.1.3');
    });

    it('falls back to the polled address when there is no bridge', () => {
        const byInterface = new Map([
            ['eth1', ['100.64.0.2']],
            ['eth0', ['192.168.1.5']],
        ]);
        expect(lanAddress(byInterface, '192.168.1.5')).to.equal('192.168.1.5');
        expect(lanAddress(byInterface, '192.168.1.99')).to.equal(null);
    });
});

describe('poeStates', () => {
    it('reads the PoE switch of every port that has one', () => {
        const rows = [
            { id: 'port1', enabled: '1', poe_enable: '1', speed: 'auto' },
            { id: 'port2', enabled: '1', poe_enable: '0' },
            // The SFP cages carry no PoE option at all
            { id: 'sfp1', enabled: '1' },
        ];
        expect([...poeStates(rows)]).to.deep.equal([
            ['port1', true],
            ['port2', false],
        ]);
    });

    it('accepts numbers and booleans as well as the strings the API sends', () => {
        expect([
            ...poeStates([
                { id: 'port1', poe_enable: 1 },
                { id: 'port2', poe_enable: false },
            ]),
        ]).to.deep.equal([
            ['port1', true],
            ['port2', false],
        ]);
    });

    it('leaves out what it cannot read rather than guessing off', () => {
        expect(
            poeStates([
                { id: 'port1', poe_enable: '' },
                { id: 'port2', poe_enable: 'auto' },
                { poe_enable: '1' },
                null,
                'port3',
            ]).size,
        ).to.equal(0);
        expect(poeStates({ data: [] }).size).to.equal(0);
        expect(poeStates(undefined).size).to.equal(0);
    });
});

describe('poeStatus', () => {
    // What a TSW202 answers on ports_settings/status, trimmed to the PoE options
    const ROWS = [
        { id: 'port1', poe_enable: '1', power: '1', budget: '5464.944128', link: '1' },
        { id: 'port3', poe_enable: '0', power: '0', budget: '0', link: '0' },
        // Link up, PoE on, but the device behind it is not PoE powered
        { id: 'port7', poe_enable: '1', power: '0', budget: '0', link: '1' },
        // The SFP cages are listed with poe_enable "0" although they have no PoE at all
        { id: 'sfp1', poe_enable: '0', power: '0', budget: '0' },
    ];
    const PORTS = new Set(['port1', 'port3', 'port7']);

    it('reads switch, powering and power in watts', () => {
        expect(poeStatus(ROWS, PORTS).get('port1')).to.deep.equal({ on: true, active: true, power: 5.5 });
        expect(poeStatus(ROWS, PORTS).get('port3')).to.deep.equal({ on: false, active: false, power: 0 });
        expect(poeStatus(ROWS, PORTS).get('port7')).to.deep.equal({ on: true, active: false, power: 0 });
    });

    it('only reports the ports the configuration names as PoE ports', () => {
        expect([...poeStatus(ROWS, PORTS).keys()]).to.deep.equal(['port1', 'port3', 'port7']);
    });

    it('leaves a value it cannot read empty', () => {
        expect(poeStatus([{ id: 'port1', poe_enable: 'x' }], new Set(['port1'])).get('port1')).to.deep.equal({
            on: null,
            active: null,
            power: null,
        });
    });
});
