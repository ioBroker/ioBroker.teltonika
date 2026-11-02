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
    /**
     * WebUI login, used for nothing but switching PoE: SNMP cannot reach it. Empty leaves the Web API alone and
     * creates no PoE states.
     */
    apiUser?: string;
    apiPassword?: string;
}

/** A person whose presence is derived from the MAC addresses the routers report as associated */
export interface PresenceDeviceEntry {
    enabled?: boolean;
    name: string;
    /** Optional group, summarised below `presence.groups.<group>` */
    group?: string;
    /** One or more MAC addresses, separated by comma or semicolon */
    mac: string;
    /** Seconds without a sighting before the device counts as away. Empty uses `presenceGrace`. */
    grace?: number | string;
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
    /** Write the MAC address of every associated Wi-Fi station into the tree. Presence works without it. */
    snmpWifiClients?: boolean;
    /** Persons to watch, each becoming `presence.persons.<name>` */
    presenceDevices?: PresenceDeviceEntry[];
    /** Number of comings and goings kept in `history` of a person */
    presenceHistory?: number | string;
    /** SSIDs of the guest networks, separated by comma: their stations are counted in `presence.guests` */
    presenceGuestSsids?: string;
    /** Count the stations nobody watches in `presence.unknown` */
    presenceUnknown?: boolean;
    /** Seconds without a sighting before a device counts as away, unless its row overrides it */
    presenceGrace?: number | string;
    /** Receive SNMP traps. Port 162 is privileged on Linux, so a higher port may be needed. */
    trapsEnabled?: boolean;
    trapPort?: number;
    trapCommunity?: string;
    timeout: number | string;
    user?: string;
    password?: string;
    ignorePings: boolean;
    defaultQoS: number | string;
    pollInterval: string | number;
}
