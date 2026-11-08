/**
 * The web components of the Teltonika adapter. Each one is built on its own (`vite build --mode <name>`, see
 * `vite.config.ts`), so that each is ONE module file: a host imports exactly one URL per component.
 *
 * This file is read by the build too: no imports, nothing but plain TypeScript.
 */

/** Name of a component: the mode of its build and the base name of its files */
export type ComponentName = 'teltonika-devices' | 'teltonika-ports' | 'teltonika-person' | 'teltonika-presence';

export const COMPONENT_NAMES: ComponentName[] = [
    'teltonika-devices',
    'teltonika-ports',
    'teltonika-person',
    'teltonika-presence',
];

/** `<iob-teltonika-devices>`: every device of an instance - summary, tiles or details */
export const DEVICES_TAG = 'iob-teltonika-devices';

/** `<iob-teltonika-ports>`: the front panel of one device */
export const PORTS_TAG = 'iob-teltonika-ports';

/** `<iob-teltonika-person>`: one person of the presence detection */
export const PERSON_TAG = 'iob-teltonika-person';

/** `<iob-teltonika-presence>`: the persons of the presence detection as a list */
export const PRESENCE_TAG = 'iob-teltonika-presence';

/**
 * Events of a click, dispatched before the element opens its dialog: a host that answers one itself calls
 * `preventDefault()`, and the element opens nothing
 */
export const DEVICES_CLICK_EVENT = 'teltonika-devices-click';
export const PORTS_CLICK_EVENT = 'teltonika-ports-click';
export const PERSON_CLICK_EVENT = 'teltonika-person-click';

/** The tag of each component */
export const TAGS: Record<ComponentName, string> = {
    'teltonika-devices': DEVICES_TAG,
    'teltonika-ports': PORTS_TAG,
    'teltonika-person': PERSON_TAG,
    'teltonika-presence': PRESENCE_TAG,
};

/** The built module, next to its manifest */
export function getModuleFile(name: ComponentName): string {
    return `${name}.js`;
}

/** The manifest the build writes next to the module; `common.webComponents` names this one */
export function getManifestFile(name: ComponentName): string {
    return `${name}.json`;
}

/** Where `tasks.js` puts the module in the admin folder; the React import is relative to it */
export function getModulePath(name: ComponentName): string {
    return `webcomponents/${getModuleFile(name)}`;
}

/** The instance the settings start with */
export const DEFAULT_INSTANCE = 'teltonika.0';

/** The values of the settings of `<iob-teltonika-devices>`; a setting without a value is missing */
export type DevicesSettings = {
    /** e.g. `teltonika.0` */
    instance?: string;
    mode?: 'summary' | 'tiles' | 'detail';
    /** Hide the devices that do not answer */
    onlyAlive?: boolean;
    /** Ports and PoE may be switched in the details */
    allowSwitching?: boolean;
};

/** The values of the settings of `<iob-teltonika-ports>`; a setting without a value is missing */
export type PortsSettings = {
    /** e.g. `teltonika.0`: its first device with ports, if `device` is empty */
    instance?: string;
    /** The channel of the device, e.g. `teltonika.0.6007866821`, or a state below it */
    device?: string;
    mode?: 'panel' | 'detail';
    allowSwitching?: boolean;
};

/** The values of the settings of `<iob-teltonika-person>`; a setting without a value is missing */
export type PersonSettings = {
    /** The channel of the person, e.g. `teltonika.0.presence.persons.Anna`, or a state below it */
    person?: string;
    /** Shown instead of the name of the person */
    nameText?: string;
    showName?: boolean;
    /** URL of a picture, e.g. a photo of the person */
    image?: string;
    grayAbsent?: boolean;
    presentText?: string;
    absentText?: string;
    presentColor?: string;
    absentColor?: string;
    showDuration?: boolean;
    showArrival?: boolean;
    showDeparture?: boolean;
    showToday?: boolean;
    /** The MAC addresses seen */
    showDevices?: boolean;
    /** Router, SSID and time of the last sighting */
    showSeen?: boolean;
    /** The comings and goings: in the element where there is room, in a dialog on a click */
    showHistory?: boolean;
    historyCount?: number;
    historyDays?: number;
};

/** The values of the settings of `<iob-teltonika-presence>`; a setting without a value is missing */
export type PresenceSettings = {
    instance?: string;
    /** Only the persons of this group, empty for all */
    group?: string;
    onlyActive?: boolean;
    activeFirst?: boolean;
    /** The number of stations in the guest networks */
    showGuests?: boolean;
};
