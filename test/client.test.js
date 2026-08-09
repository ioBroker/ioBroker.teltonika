'use strict';

const { expect } = require('chai');
const snmp = require('net-snmp');
const { decodeVarbind } = require('../build/lib/snmp/client.js');

const T = snmp.ObjectType;

describe('SNMP varbind decoding', () => {
    it('renders integers as strings so the topics.ts converters can take them', () => {
        expect(decodeVarbind({ type: T.Integer, value: 680 })).to.equal('680');
        expect(decodeVarbind({ type: T.Gauge, value: 0 })).to.equal('0');
        expect(decodeVarbind({ type: T.Integer, value: -67 })).to.equal('-67');
    });

    it('reads a printable OctetString as text', () => {
        expect(decodeVarbind({ type: T.OctetString, value: Buffer.from('COSMOTE', 'utf8') })).to.equal('COSMOTE');
    });

    it('falls back to hex for an unprintable OctetString', () => {
        expect(decodeVarbind({ type: T.OctetString, value: Buffer.from([0x00, 0x01, 0xfe]) })).to.equal('0001fe');
    });

    it('does not mistake an eight byte OctetString for a Counter64', () => {
        expect(decodeVarbind({ type: T.OctetString, value: Buffer.from('12345678', 'utf8') })).to.equal('12345678');
    });

    it('decodes a Counter64 sent in minimal encoding', () => {
        // Teltonika switches send small counters in as few bytes as ASN.1 allows
        expect(decodeVarbind({ type: T.Counter64, value: Buffer.from([0x1c, 0x18, 0x2c, 0x9d]) })).to.equal(
            '471346333',
        );
        expect(decodeVarbind({ type: T.Counter64, value: Buffer.from([0x01, 0, 0, 0, 0]) })).to.equal('4294967296');
    });

    it('honours the ASN.1 pad byte in front of a full width Counter64', () => {
        // The leading 0x00 marks the value as unsigned; without it 0xff... would read as a sign bit
        const maxCounter64 = Buffer.from([0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        expect(decodeVarbind({ type: T.Counter64, value: maxCounter64 })).to.equal('18446744073709551615');
    });

    it('keeps full precision past 2^53, where Number would round', () => {
        const value = Buffer.from([0x00, 0xff, 0xff, 0xff, 0xff, 0xf1, 0x37, 0x4e, 0x43]);
        const decoded = decodeVarbind({ type: T.Counter64, value });
        expect(decoded).to.equal('18446744073461517891');
        // Proof that the string form is required: Number cannot hold this
        expect(String(Number(decoded))).to.not.equal(decoded);
    });

    it('maps absent values to null instead of throwing', () => {
        expect(decodeVarbind({ type: T.NoSuchInstance, value: null })).to.equal(null);
        expect(decodeVarbind({ type: T.NoSuchObject, value: null })).to.equal(null);
        expect(decodeVarbind({ type: T.Null, value: null })).to.equal(null);
        expect(decodeVarbind(undefined)).to.equal(null);
    });
});
