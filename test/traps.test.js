'use strict';

const { expect } = require('chai');
const snmp = require('net-snmp');
const { notificationOid, payloadOf } = require('../build/lib/snmp/traps.js');
const { FAMILY_OIDS } = require('../build/lib/snmp/oids.generated.js');

const SNMP_TRAP_OID = '1.3.6.1.6.3.1.1.4.1.0';
const SYS_UPTIME = '1.3.6.1.2.1.1.3.0';
const SIGNAL_CHANGE = '1.3.6.1.4.1.48690.4.1.1';

describe('trap decoding', () => {
    it('takes the notification from the value of snmpTrapOID, not from its own OID', () => {
        const pdu = {
            varbinds: [
                { oid: SYS_UPTIME, type: snmp.ObjectType.TimeTicks, value: 12345 },
                { oid: SNMP_TRAP_OID, type: snmp.ObjectType.OID, value: SIGNAL_CHANGE },
            ],
        };
        expect(notificationOid(pdu)).to.equal(SIGNAL_CHANGE);
    });

    it('accepts a buffer as the trap OID value', () => {
        const pdu = { varbinds: [{ oid: SNMP_TRAP_OID, value: Buffer.from(SIGNAL_CHANGE, 'utf8') }] };
        expect(notificationOid(pdu)).to.equal(SIGNAL_CHANGE);
    });

    it('assembles the OID of a v1 trap from enterprise and specific number', () => {
        expect(notificationOid({ varbinds: [], enterprise: '1.3.6.1.4.1.48690.4.1', specificTrap: 2 })).to.equal(
            '1.3.6.1.4.1.48690.4.1.2',
        );
    });

    it('reports nothing recognisable rather than guessing', () => {
        expect(notificationOid({ varbinds: [{ oid: SYS_UPTIME, value: 1 }] })).to.equal(null);
        expect(notificationOid(null)).to.equal(null);
    });

    it('keeps only the payload varbinds, dropping the two every TrapV2 carries', () => {
        const pdu = {
            varbinds: [
                { oid: SYS_UPTIME, value: 12345 },
                { oid: SNMP_TRAP_OID, value: SIGNAL_CHANGE },
                { oid: '1.3.6.1.4.1.48690.4.1.3.1', value: Buffer.from('signal dropped', 'utf8') },
            ],
        };
        expect(payloadOf(pdu)).to.deep.equal({ '1.3.6.1.4.1.48690.4.1.3.1': 'signal dropped' });
    });

    it('yields an empty payload for the notifications that carry none', () => {
        // Six of the seven a RUTC defines declare no OBJECTS at all
        const pdu = {
            varbinds: [
                { oid: SYS_UPTIME, value: 1 },
                { oid: SNMP_TRAP_OID, value: '1.3.6.1.4.1.48690.4.2.1' },
            ],
        };
        expect(payloadOf(pdu)).to.deep.equal({});
    });
});

describe('generated notifications', () => {
    it('carries the notifications a RUTC can send', () => {
        const names = FAMILY_OIDS.RUTC.notifications;
        expect(names).to.have.property('signalChangeNotification', SIGNAL_CHANGE);
        expect(names).to.have.property('digitalInputNotification');
        expect(Object.keys(names)).to.have.lengthOf(7);
    });

    it('reports that a TSW202 defines none', () => {
        expect(FAMILY_OIDS.TSW2.notifications).to.deep.equal({});
    });
});
