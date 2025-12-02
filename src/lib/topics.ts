import type {RouterTypeUnion} from "../types";

export const SUPPORTED_TOPICS: { [topic: string]: {
    description: string;
    devices: RouterTypeUnion[];
} } = {
    id: {
        description: "Modem IMEI",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    temperature: {
        description: "Temperature of the module in 0.1 degrees Celsius",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    operator: {
        description: "Current operator’s name",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    signal: {
        description: "Signal strength in dBm",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    network: {
        description: "Network state",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    connection: {
        description: "Current connection type (2G, 3G, 4G)",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    wan: {
        description: "WAN IP address",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    uptime: {
        description: "System uptime in seconds",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    name: {
        description: "Device's device code",
        devices: ["RUT2", "RUT9", "RUTX", "RUT3", "RUT1", "TRB1", "TRB2", "TRB5", "OTD", "RUTM", "RUTC"],
    },
    digital1: {
        description: "Value of digital input no. 1",
        devices: ["RUT9"],
    },
    digital2: {
        description: "Value of digital input no. 2",
        devices: ["RUT9"],
    },
    analog: {
        description: "Value of analog",
        devices: ["RUT9", "TRB2", "TRB141"],
    },
    pin2: {
        description: "Value of 2's pin state",
        devices: ["TRB2"],
    },
    pin3: {
        description: "Value of 3's pin state",
        devices: ["RUT1", "RUT2", "RUT9", "RUTX", "RUT3", "TRB1", "TRB2", "TRB5", "RUTM"],
    },
    pin4: {
        description: "Value of 4's pin state",
        devices: ["RUT1", "RUT2", "RUT9", "RUTX", "RUT3", "TRB1", "TRB2", "TRB5", "RUTM"],
    },
};