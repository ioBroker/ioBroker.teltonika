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

export interface TeltonikaAdapterConfig {
    bind: string;
    port: number | string;
    timeout: number | string;
    user?: string;
    password?: string;
    ignorePings: boolean;
    routerType: RouterTypeUnion;
    retransmitInterval: number | string;
    retransmitCount: number | string;
    defaultQoS: number | string;
    pollInterval: string | number;
}
