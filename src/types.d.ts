export enum RouterType {
    RUT1 = 'RUT1',
    RUT2 = 'RUT2',
    RUT3 = 'RUT3',
    RUT9 = 'RUT9',
    RUTX = 'RUTX',
    RUTM = 'RUTM',
    RUTC = 'RUTC',
    TRB1 = 'TRB1',
    TRB2 = 'TRB2',
    TRB5 = 'TRB5',
    TRB141 = 'TRB141',
    OTD = 'OTD',
}

export type RouterTypeUnion = keyof typeof RouterType;

export interface SnmpDeviceEntry {
    enabled?: boolean;
    host: string;
    port?: number;
    version: 'v1' | 'v2c' | 'v3';
    /** v1 and v2c */
    community?: string;
    /** v3 */
    user?: string;
    authProtocol?: 'md5' | 'sha';
    authKey?: string;
    privProtocol?: 'des' | 'aes';
    privKey?: string;
    pollInterval?: number;
    /**
     * Community with write rights. Leave empty to keep the adapter read-only — without it the port states are
     * created without the write flag, because the adapter would have no way to honour a change.
     */
    writeCommunity?: string;
}

export interface TeltonikaAdapterConfig {
    bind: string;
    port: number | string;
    /** Devices polled over SNMP, alongside the routers that connect themselves over MQTT */
    snmpDevices?: SnmpDeviceEntry[];
    /**
     * Optional SNMP branches, off by default. GPS exposes the device location, hotspot the sessions of
     * identifiable clients, and the wireless tables change on every poll.
     */
    snmpGps?: boolean;
    snmpHotspot?: boolean;
    snmpWireless?: boolean;
    /** Receive SNMP traps. Port 162 is privileged on Linux, so a higher port may be needed. */
    trapsEnabled?: boolean;
    trapPort?: number;
    trapCommunity?: string;
    timeout: number | string;
    user?: string;
    password?: string;
    ignorePings: boolean;
    retransmitInterval: number | string;
    retransmitCount: number | string;
    defaultQoS: number | string;
    pollInterval: string | number;
}
