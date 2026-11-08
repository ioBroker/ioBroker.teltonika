/**
 * The words each element shows. The build compiles only these into its module (`__TELT_WORDS__`, see
 * `vite.config.ts`), in every language, from three dictionaries:
 *
 * - `telt_...`: the devices widgets, `src-devices/src/i18n/<lang>.json`
 * - `wc_...`: words only the web components have, `ownWords.ts`
 * - the rest: the vis-2 widgets, `src-widgets/src/i18n/<lang>.json` (keys without the prefix `telt_` of vis-2)
 *
 * This file is read by the build too: type imports only, nothing but plain TypeScript.
 */
import type { ComponentName } from './constants.ts';

/** The words of a device: tile, front panel and details - `<iob-teltonika-devices>` and `<iob-teltonika-ports>` */
const DEVICE_WORDS = [
    'telt_uptime',
    'telt_lan',
    'telt_wan',
    'telt_router',
    'telt_switch',
    'telt_links',
    'telt_model',
    'telt_operator',
    'telt_connection',
    'telt_network',
    'telt_signal',
    'telt_temperature',
    'telt_no_ports',
    'telt_poe_off',
    'telt_poe_idle',
    'telt_poe_on',
    'telt_wan_interfaces',
    'telt_tracking',
    'telt_ethernet',
    'telt_fibre',
    'telt_up',
    'telt_nolink',
    'telt_disabled',
    'wc_full_duplex',
    'wc_click_to_switch',
    'wc_choose_instance',
    'wc_not_device',
] as const;

const DEVICES_WORDS = [...DEVICE_WORDS, 'telt_devices', 'telt_empty', 'telt_dialog_title'] as const;

const PORTS_WORDS = [...DEVICE_WORDS, 'no_device'] as const;

const PERSON_WORDS = [
    'telt_present',
    'telt_absent',
    'telt_lastArrival',
    'telt_lastDeparture',
    'telt_came',
    'telt_left',
    'telt_presentToday',
    'telt_absentToday',
    'telt_historyTitle',
    'telt_historyFrom',
    'telt_historyFromAdapter',
    'telt_noHistory',
    'telt_sinceDuration',
    'telt_stayed',
    'telt_wasAway',
    'telt_lastSeen',
    'telt_router',
    'telt_devicesSeen',
    'telt_refresh',
    'telt_showHistoryOf',
    'telt_personNotFoundIn',
    'macs',
    'select_person',
    'wc_not_person',
] as const;

const PRESENCE_WORDS = [
    'is_present',
    'is_away',
    'present_count',
    'guests_count',
    'nobody_present',
    'no_persons',
    'wc_choose_instance',
] as const;

/** A word an element shows */
export type WordKey =
    | (typeof DEVICES_WORDS)[number]
    | (typeof PORTS_WORDS)[number]
    | (typeof PERSON_WORDS)[number]
    | (typeof PRESENCE_WORDS)[number];

/** The words compiled into the module of each component */
export const COMPONENT_WORDS: Record<ComponentName, readonly WordKey[]> = {
    'teltonika-devices': DEVICES_WORDS,
    'teltonika-ports': PORTS_WORDS,
    'teltonika-person': PERSON_WORDS,
    'teltonika-presence': PRESENCE_WORDS,
};
