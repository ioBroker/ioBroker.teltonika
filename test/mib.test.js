'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');

const { parseMib, oidOf, columnsOf } = require('../build/lib/snmp/mib.js');

const TELTONIKA = '1.3.6.1.4.1.48690';

describe('MIB parser', () => {
    let mib;

    before(() => {
        const source = fs.readFileSync(path.join(__dirname, 'fixtures', 'TELTONIKA-TEST-MIB.txt'), 'utf8');
        mib = parseMib(source);
    });

    it('reads the module name from the DEFINITIONS header', () => {
        expect(mib.module).to.equal('TELTONIKA-TEST-MIB');
    });

    it('anchors the module at the Teltonika enterprise OID', () => {
        expect(oidOf(mib, 'ModemImei')).to.equal(`${TELTONIKA}.1.1`);
    });

    it('resolves objects declared before their parent group', () => {
        // `Signal` sits above the `gsm OBJECT IDENTIFIER` line in the fixture
        expect(oidOf(mib, 'Signal')).to.equal(`${TELTONIKA}.2.4`);
    });

    it('resolves the remaining scalars', () => {
        expect(oidOf(mib, 'RouterName')).to.equal(`${TELTONIKA}.1.7`);
        expect(oidOf(mib, 'Temperature')).to.equal(`${TELTONIKA}.2.9`);
        expect(oidOf(mib, 'DigitalInput')).to.equal(`${TELTONIKA}.5.1`);
    });

    it('is not confused by braces, "::=" or comment markers inside DESCRIPTION', () => {
        expect(oidOf(mib, 'Signal')).to.equal(`${TELTONIKA}.2.4`);
        expect(mib.objects.Signal.description).to.contain('Signal strength');
        expect(mib.objects).to.not.have.property('bogus');
    });

    it('is not confused by an enumeration in SYNTAX', () => {
        expect(oidOf(mib, 'ConnectionState')).to.equal(`${TELTONIKA}.2.7`);
        expect(mib.objects.ConnectionState.syntax).to.contain('disconnected(0)');
    });

    it('keeps the syntax and access of a scalar', () => {
        expect(mib.objects.Temperature.syntax).to.equal('DisplayString (SIZE (0..255))');
        expect(mib.objects.Temperature.access).to.equal('read-only');
        expect(mib.objects.Temperature.description).to.contain('0.1 degrees Celsius');
    });

    it('flags a table and reads the INDEX of its row', () => {
        expect(mib.objects.portTable.table).to.equal(true);
        expect(mib.objects.portEntry.index).to.deep.equal(['portIndex']);
        expect(mib.objects.portRxBytes.table).to.equal(undefined);
    });

    it('lists the columns of a table', () => {
        const columns = columnsOf(mib, 'portTable')
            .map(column => column.name)
            .sort();
        expect(columns).to.deep.equal(['portIndex', 'portRxBytes', 'portTxBytes']);
    });

    it('reads the notifications a device can send', () => {
        expect(oidOf(mib, 'signalChangeNotification')).to.equal(`${TELTONIKA}.4.1`);
        expect(mib.objects.signalChangeNotification.notification).to.equal(true);
        expect(mib.objects.signalChangeNotification.objects).to.deep.equal(['Signal']);
    });

    it('accepts a notification without an OBJECTS clause', () => {
        // Most Teltonika traps declare no payload at all, they only signal that something happened
        expect(oidOf(mib, 'digitalInputNotification')).to.equal(`${TELTONIKA}.4.2`);
        expect(mib.objects.digitalInputNotification.notification).to.equal(true);
        expect(mib.objects.digitalInputNotification.objects).to.equal(undefined);
    });

    it('does not mistake a plain object for a notification', () => {
        expect(mib.objects.Temperature.notification).to.equal(undefined);
    });

    it('reports definitions whose parent is unknown instead of throwing', () => {
        expect(mib.unresolved).to.have.property('Orphan');
        expect(mib.objects).to.not.have.property('Orphan');
    });
});
