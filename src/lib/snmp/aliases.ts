import type { StateDefinition } from '../states';

/**
 * Which MIB object carries which adapter datapoint.
 *
 * Teltonika renamed most objects between MIB generations (`Signal` became `mSignal` and moved into a table), so
 * each datapoint lists every name it has been known by, newest first. The generator picks the first name a given
 * MIB actually defines.
 *
 * Deliberately no OIDs and no placement here: the same name sits at different OIDs on different device families,
 * and whether an object is a scalar or a table column is derived from the MIB structure by the generator. Every
 * fact that varies per device stays out of this file.
 */
export const TOPIC_ALIASES: { [topic: string]: string[] } = {
    id: ['mImei', 'ModemImei'],
    temperature: ['mTemperature', 'Temperature'],
    signal: ['mSignal', 'Signal'],
    operator: ['mOperator', 'Operator'],
    network: ['mNetState', 'NetState'],
    connection: ['mNetworkType', 'ConnectionType'],
    wan: ['mIP', 'MobileIP'],
    uptime: ['deviceUptime', 'RouterUptime'],
    name: ['productCode', 'ProductCode'],
};

export interface TableAlias {
    /** Channel the rows appear under, for example `ports` */
    channel: string;
    /** Only read when the user switched this branch on. Absent means always read. */
    branch?: OptionalBranch;
    /**
     * Column whose value names the row. Rows are addressed by that value rather than by the SNMP index, because
     * the index is a position that shifts when the device is reconfigured while the name stays put.
     *
     * Stable is not the same as unique: a RUTC reports its ports as WAN, LAN, LAN, LAN, LAN. Callers must
     * disambiguate colliding names with the row index before using them as object ids.
     */
    rowName: string;
    /** Column shown as `common.name`. Usually the user editable label, which is why it must not name the state. */
    label?: string;
    /**
     * Column to state name. MIB column names are not a naming scheme anyone wants in an object tree, so every
     * exposed column is renamed here. Columns left out become no state at all, which keeps addressing and
     * bookkeeping columns such as `pIndex` out of the tree.
     */
    columns: { [column: string]: string };
}

export const TABLE_ALIASES: { [table: string]: TableAlias } = {
    ioTable: {
        channel: 'io',
        rowName: 'ioSystemName',
        label: 'ioName',
        columns: {
            ioStateNumeric: 'state',
            ioType: 'type',
            ioCurrent: 'current',
            ioPercentage: 'percentage',
        },
    },
    radioTable: {
        channel: 'radios',
        branch: 'wireless',
        rowName: 'radioName',
        columns: {
            radioUpState: 'up',
            radioChannel: 'channel',
        },
    },
    wIfaceTable: {
        channel: 'wifi',
        branch: 'wireless',
        rowName: 'wIfaceSSID',
        columns: {
            wIfaceClientCount: 'clients',
            wIfaceEncryption: 'encryption',
            wIfaceMode: 'mode',
            wIfaceHidden: 'hidden',
        },
    },
    // Deliberately not wIfaceClientTable: it is one row per connected device, changing on every poll, and its
    // only content is a MAC address. `wifi.<ssid>.clients` carries the useful part without keeping a rolling
    // list of everyone's hardware addresses in the object tree.
    hsSessionTable: {
        channel: 'hotspot',
        branch: 'hotspot',
        rowName: 'hssMAC',
        columns: {
            hssIP: 'ip',
            hssUsername: 'user',
            hssState: 'authorized',
        },
    },
    portTable: {
        channel: 'ports',
        rowName: 'pName',
        columns: {
            pState: 'state',
            pSpeed: 'speed',
            pDuplex: 'duplex',
            pRxBytes: 'rxBytes',
            pTxBytes: 'txBytes',
            pRxRate: 'rxRate',
            pTxRate: 'txRate',
        },
    },
};

/**
 * Branches that are off unless the user asks for them. They either expose subscriber identifiers and location,
 * or churn on every poll, and neither belongs in an object tree by default.
 */
export const OPTIONAL_BRANCHES = ['gps', 'hotspot', 'wireless'] as const;

export type OptionalBranch = (typeof OPTIONAL_BRANCHES)[number];

/**
 * Scalar datapoints of an optional branch: state name to the MIB objects that may carry it, newest name first.
 * Resolved by the generator exactly like TOPIC_ALIASES.
 */
export const BRANCH_SCALARS: { [branch: string]: { [state: string]: string[] } } = {
    gps: {
        latitude: ['latitude', 'Latitude'],
        longitude: ['longitude', 'Longtitude'],
        accuracy: ['accuracy', 'Accuracy'],
        satellites: ['numSatellites', 'NumSatellites'],
        fixTime: ['datetime', 'Datetime'],
    },
};

function optionalNumber(raw: string): ioBroker.StateValue {
    if (raw === 'N/A' || raw === '') {
        return null;
    }
    const value = parseFloat(raw);
    return isNaN(value) ? null : value;
}

/**
 * Byte counters, guarded against a firmware defect: the TSW202 lets its 32 bit counters go negative and sign
 * extends them into the unsigned Counter64 field, which arrives as a value just below 2^64. No port on this
 * hardware moves exabytes, so anything in the top half of the range is reported as unknown rather than written
 * as a number that would wreck every chart built on it.
 */
/** The MIB uses plain INTEGER rather than TruthValue for these, so 1 is on and 0 is off */
function flag(raw: string): ioBroker.StateValue {
    return raw === '1' ? true : raw === '0' ? false : null;
}

function counter(raw: string): ioBroker.StateValue {
    if (!/^\d+$/.test(raw)) {
        return null;
    }
    const value = BigInt(raw);
    if (value >= 0x8000000000000000n) {
        return null;
    }
    return Number(value);
}

/** Datapoints of the optional scalar branches, keyed the same way as BRANCH_SCALARS */
export const BRANCH_STATES: { [branch: string]: { [state: string]: StateDefinition } } = {
    gps: {
        latitude: {
            common: { name: 'Latitude', type: 'number', role: 'value.gps.latitude', read: true, write: false },
            convert: optionalNumber,
        },
        longitude: {
            common: { name: 'Longitude', type: 'number', role: 'value.gps.longitude', read: true, write: false },
            convert: optionalNumber,
        },
        accuracy: {
            common: { name: 'Accuracy', type: 'number', role: 'value', unit: 'm', read: true, write: false },
            convert: optionalNumber,
        },
        satellites: {
            common: { name: 'Satellites', type: 'number', role: 'value', read: true, write: false },
            convert: optionalNumber,
        },
        fixTime: {
            common: { name: 'Fix time', type: 'string', role: 'date', read: true, write: false },
        },
    },
};

/**
 * Datapoints of the exposed tables, the table equivalent of SUPPORTED_TOPICS.
 *
 * Keyed per table rather than per state name on purpose: `state` means the level of a digital input in one and
 * the link status of a port in the other, so a single map keyed by state name would collide.
 */
export const TABLE_STATES: { [table: string]: { [state: string]: StateDefinition } } = {
    ioTable: {
        state: {
            // ioStateNumeric, an INTEGER enum of na(-1), low(0), high(1)
            common: { name: 'State', type: 'boolean', role: 'sensor', read: true, write: false },
            convert: raw => (raw === '0' ? false : raw === '1' ? true : null),
        },
        type: {
            common: { name: 'Type', type: 'string', role: 'info', read: true, write: false },
        },
        current: {
            common: { name: 'Current', type: 'number', role: 'value.current', unit: 'mA', read: true, write: false },
            convert: optionalNumber,
        },
        percentage: {
            common: { name: 'Percentage', type: 'number', role: 'value', unit: '%', read: true, write: false },
            convert: optionalNumber,
        },
    },
    radioTable: {
        up: {
            common: { name: 'Up', type: 'boolean', role: 'indicator', read: true, write: false },
            convert: flag,
        },
        channel: {
            common: { name: 'Channel', type: 'string', role: 'info', read: true, write: false },
        },
    },
    wIfaceTable: {
        clients: {
            common: { name: 'Connected clients', type: 'number', role: 'value', read: true, write: false },
            convert: optionalNumber,
        },
        encryption: {
            common: { name: 'Encryption', type: 'string', role: 'info', read: true, write: false },
        },
        mode: {
            common: { name: 'Mode', type: 'string', role: 'info', read: true, write: false },
        },
        hidden: {
            common: { name: 'Hidden', type: 'boolean', role: 'indicator', read: true, write: false },
            convert: flag,
        },
    },
    hsSessionTable: {
        ip: {
            common: { name: 'IP address', type: 'string', role: 'info.ip', read: true, write: false },
        },
        user: {
            common: { name: 'User', type: 'string', role: 'info.name', read: true, write: false },
        },
        authorized: {
            // hssState, an INTEGER enum of notAuthorized(0), authorized(1)
            common: { name: 'Authorized', type: 'boolean', role: 'indicator', read: true, write: false },
            convert: flag,
        },
    },
    portTable: {
        state: {
            // pState, reported as the strings `up` and `down`
            common: { name: 'Link', type: 'boolean', role: 'indicator.connected', read: true, write: false },
            convert: raw => (raw === 'up' ? true : raw === 'down' ? false : null),
        },
        speed: {
            common: { name: 'Speed', type: 'number', role: 'value', unit: 'Mbit/s', read: true, write: false },
            convert: optionalNumber,
        },
        duplex: {
            // pDuplex, reported as `true` or `N/A`
            common: { name: 'Full duplex', type: 'boolean', role: 'indicator', read: true, write: false },
            convert: raw => (raw === 'true' ? true : raw === 'false' ? false : null),
        },
        rxBytes: {
            common: { name: 'Received', type: 'number', role: 'value', unit: 'B', read: true, write: false },
            convert: counter,
        },
        txBytes: {
            common: { name: 'Sent', type: 'number', role: 'value', unit: 'B', read: true, write: false },
            convert: counter,
        },
        rxRate: {
            common: { name: 'Receive rate', type: 'number', role: 'value', unit: 'B/s', read: true, write: false },
            convert: counter,
        },
        txRate: {
            common: { name: 'Send rate', type: 'number', role: 'value', unit: 'B/s', read: true, write: false },
            convert: counter,
        },
    },
};
