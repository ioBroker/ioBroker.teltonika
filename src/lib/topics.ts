import type { RouterTypeUnion } from '../types';

export const SUPPORTED_TOPICS: {
    [topic: string]: {
        devices: RouterTypeUnion[];
        common: ioBroker.StateCommon;
        convert?: (value: string) => ioBroker.StateValue;
    };
} = {
    id: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Modem IMEI',
            type: 'string',
            role: 'info.identifier',
            read: true,
            write: false,
        },
    },
    temperature: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Module Temperature',
            desc: 'Temperature of the module in degrees Celsius',
            type: 'number',
            read: true,
            unit: '°C',
            role: 'value.temperature',
            write: false,
        },
        convert: (value: string) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
                return null;
            }
            return num / 10;
        },
    },
    operator: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Network Operator',
            desc: 'Current operator’s name',
            type: 'string',
            role: 'info.operator',
            read: true,
            write: false,
        },
    },
    signal: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Signal Strength',
            desc: 'Signal strength in dBm',
            type: 'number',
            read: true,
            unit: 'dBm',
            role: 'value.signal',
            write: false,
        },
        convert: (value: string) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
                return null;
            }
            return num;
        },
    },
    network: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Network State',
            desc: 'Current network state',
            type: 'string',
            role: 'info.status',
            read: true,
            write: false,
        },
    },
    connection: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Connection Type',
            desc: 'Current connection type (2G, 3G, 4G)',
            type: 'string',
            role: 'info.status',
            read: true,
            write: false,
        },
    },
    wan: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'WAN IP Address',
            desc: 'Current WAN IP address',
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false,
        },
    },
    uptime: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'System Uptime',
            type: 'number',
            role: 'value.interval',
            unit: 'sec',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
                return value;
            }
            return num;
        },
    },
    name: {
        devices: ['RUT2', 'RUT9', 'RUTX', 'RUT3', 'RUT1', 'TRB1', 'TRB2', 'TRB5', 'OTD', 'RUTM', 'RUTC'],
        common: {
            name: 'Device Code',
            type: 'string',
            role: 'info.name',
            read: true,
            write: false,
        },
    },
    digital1: {
        devices: ['RUT9'],
        common: {
            name: 'Digital Input 1',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            if (value === 'N/A') {
                return null;
            }
            return value === '1' || value.toLowerCase() === 'true';
        },
    },
    digital2: {
        devices: ['RUT9'],
        common: {
            name: 'Digital Input 2',
            type: 'boolean',
            role: 'sensor',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            if (value === 'N/A') {
                return null;
            }
            return value === '1' || value.toLowerCase() === 'true';
        },
    },
    analog: {
        devices: ['RUT9', 'TRB2', 'TRB141'],
        common: {
            name: 'Analog Input',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            if (value === 'N/A') {
                return null;
            }
            return parseFloat(value);
        },
    },
    pin2: {
        devices: ['TRB2'],
        common: {
            name: 'Pin2',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            if (value === 'N/A') {
                return null;
            }
            return value;
        },
    },
    pin3: {
        devices: ['RUT1', 'RUT2', 'RUT9', 'RUTX', 'RUT3', 'TRB1', 'TRB2', 'TRB5', 'RUTM'],
        common: {
            name: 'Pin3',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            if (value === 'N/A') {
                return null;
            }
            return value;
        },
    },
    pin4: {
        devices: ['RUT1', 'RUT2', 'RUT9', 'RUTX', 'RUT3', 'TRB1', 'TRB2', 'TRB5', 'RUTM'],
        common: {
            name: 'Pin4',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
        convert: (value: string) => {
            if (value === 'N/A') {
                return null;
            }
            return value;
        },
    },
};
