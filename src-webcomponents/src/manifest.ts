/**
 * The manifests of the four components. Read by the build only (`vite.config.ts`), which writes each one as
 * `<name>.json` next to its module - a host reads that file for its palette and its settings without loading the
 * module.
 *
 * The words come from the native widgets: the name from the dictionary of the vis-2 widget set (the label the vis-2
 * palette shows; the label of the devices widget in `io-package.json` is the same, the build checks that), the
 * description from the devices widget in `io-package.json`, the labels from `src-devices/src/i18n/` and
 * `src-widgets/src/i18n/`. Only a few words are new, see `ownWords.ts`.
 */
import type { WebComponentManifest, WebComponentText } from '@iobroker/web-components';

// with the extension: `vite.config.ts` imports this file, and Vite may load its config natively
import { DEFAULT_INSTANCE, getModuleFile, TAGS, type ComponentName } from './constants.ts';

/** The words of the native widgets, read by the build */
export interface ManifestTexts {
    /** The label of the native widget, the same in vis-2 and devices */
    name: WebComponentText;
    description: WebComponentText;
    /** A word of the devices widgets (`src-devices/src/i18n/`) in every language */
    devices: (key: string) => WebComponentText;
    /** A word of the vis-2 widgets (`src-widgets/src/i18n/`, without the prefix `telt_`) in every language */
    vis: (key: string) => WebComponentText;
    /** A word of `ownWords.ts` in every language */
    own: (key: string) => WebComponentText;
}

/** The icon of the presence list: the preview of the vis-2 widget, emitted next to the manifest by the build */
export const PRESENCE_ICON = 'teltonika-presence.svg';

function settings(name: ComponentName, texts: ManifestTexts): WebComponentManifest['settings'] {
    const { devices, vis, own } = texts;
    const instance = {
        type: 'instance',
        adapter: 'teltonika',
        default: DEFAULT_INSTANCE,
        label: devices('telt_instance'),
    } as const;
    const allowSwitching = {
        type: 'checkbox',
        default: false,
        label: devices('telt_allowSwitching'),
    } as const;

    switch (name) {
        case 'teltonika-devices':
            return {
                type: 'panel',
                items: {
                    instance,
                    mode: {
                        type: 'select',
                        default: 'summary',
                        label: vis('mode'),
                        options: [
                            { value: 'summary', label: vis('mode_summary') },
                            { value: 'tiles', label: vis('mode_tiles') },
                            { value: 'detail', label: vis('mode_detail') },
                        ],
                    },
                    onlyAlive: { type: 'checkbox', default: false, label: devices('telt_onlyAlive') },
                    allowSwitching,
                },
            };

        case 'teltonika-ports':
            return {
                type: 'panel',
                items: {
                    // the device channel; the element takes the instance from it
                    device: {
                        type: 'objectId',
                        types: 'channel',
                        root: 'teltonika',
                        label: devices('telt_device'),
                        help: devices('telt_device_help'),
                    },
                    // only for "the first device that has ports"
                    instance: { ...instance, hidden: '!!data.device' },
                    mode: {
                        type: 'select',
                        default: 'panel',
                        label: vis('mode'),
                        options: [
                            { value: 'panel', label: vis('mode_panel') },
                            { value: 'detail', label: vis('mode_detail') },
                        ],
                    },
                    allowSwitching,
                },
            };

        case 'teltonika-person':
            return {
                type: 'panel',
                items: {
                    // the channel of the person; the element takes the instance from it
                    person: {
                        type: 'objectId',
                        types: 'channel',
                        root: 'teltonika',
                        label: devices('telt_person'),
                        help: own('wc_person_help'),
                    },
                    _appearance: { type: 'header', text: devices('telt_appearance') },
                    nameText: {
                        type: 'text',
                        label: devices('telt_nameOverride'),
                        help: devices('telt_nameOverrideHelp'),
                    },
                    showName: { type: 'checkbox', default: true, label: devices('telt_showName') },
                    image: { type: 'text', label: vis('image'), help: own('wc_image_help') },
                    grayAbsent: { type: 'checkbox', default: true, label: devices('telt_dimAbsent') },
                    presentText: { type: 'text', label: devices('telt_textPresent') },
                    absentText: { type: 'text', label: devices('telt_textAbsent') },
                    presentColor: { type: 'color', label: devices('telt_colorPresent') },
                    absentColor: { type: 'color', label: devices('telt_colorAbsent') },
                    _display: { type: 'header', text: devices('telt_display') },
                    showDuration: { type: 'checkbox', default: true, label: devices('telt_showSince') },
                    showArrival: { type: 'checkbox', default: true, label: vis('show_arrival') },
                    showDeparture: { type: 'checkbox', default: true, label: vis('show_departure') },
                    showToday: { type: 'checkbox', default: false, label: vis('show_today') },
                    showDevices: { type: 'checkbox', default: false, label: vis('show_macs') },
                    showSeen: {
                        type: 'checkbox',
                        default: false,
                        label: vis('show_seen'),
                        help: vis('show_seen_tooltip'),
                    },
                    _history: { type: 'header', text: vis('history') },
                    showHistory: {
                        type: 'checkbox',
                        default: true,
                        label: devices('telt_showHistory'),
                        help: vis('show_history_tooltip'),
                    },
                    historyCount: {
                        type: 'number',
                        default: 10,
                        min: 1,
                        max: 100,
                        label: vis('history_count'),
                        hidden: 'data.showHistory === false',
                    },
                    historyDays: {
                        type: 'number',
                        default: 7,
                        min: 1,
                        max: 365,
                        label: vis('history_days'),
                        help: vis('history_days_tooltip'),
                        hidden: 'data.showHistory === false',
                    },
                },
            };

        case 'teltonika-presence':
            return {
                type: 'panel',
                items: {
                    instance,
                    group: { type: 'text', label: vis('group'), help: vis('group_tooltip') },
                    onlyActive: { type: 'checkbox', default: false, label: vis('only_present') },
                    activeFirst: { type: 'checkbox', default: true, label: vis('present_first') },
                    showGuests: {
                        type: 'checkbox',
                        default: true,
                        label: vis('show_guests'),
                        help: vis('show_guests_tooltip'),
                    },
                },
            };
    }
}

/** The picture of each component, relative to its manifest in `admin/webcomponents/` */
const ICONS: Record<ComponentName, string> = {
    // the icons of the devices widgets
    'teltonika-devices': '../dm-widgets/devices.svg',
    'teltonika-ports': '../dm-widgets/ports.svg',
    'teltonika-person': '../dm-widgets/person.svg',
    'teltonika-presence': PRESENCE_ICON,
};

/** The size each one looks good in as a tile of a dashboard */
const SIZES: Record<ComponentName, { width: number; height: number }> = {
    'teltonika-devices': { width: 320, height: 220 },
    'teltonika-ports': { width: 400, height: 200 },
    'teltonika-person': { width: 300, height: 220 },
    'teltonika-presence': { width: 320, height: 300 },
};

/**
 * The manifest of one component with the words of the native widgets
 *
 * @param name the component
 * @param texts what the build read from `io-package.json` and the dictionaries
 */
export function buildManifest(name: ComponentName, texts: ManifestTexts): WebComponentManifest {
    return {
        $schema: 'https://raw.githubusercontent.com/ioBroker/web-components/main/schemas/manifest.json',
        manifestVersion: 1,
        tag: TAGS[name],
        name: texts.name,
        description: texts.description,
        icon: ICONS[name],
        module: getModuleFile(name),
        size: SIZES[name],
        settings: settings(name, texts),
    };
}
