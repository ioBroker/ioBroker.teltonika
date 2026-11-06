/**
 * What the presence elements (`<iob-teltonika-person>`, `<iob-teltonika-presence>`) share: the IDs of the tree below
 * `<instance>.presence`, the values of the states and the texts of times.
 *
 * Loading the persons and their comings and goings is `src-devices/src/presenceApi.ts`, compiled in - the copy of
 * the helper of ioBroker.tr-064, which writes the same tree.
 */
import { intlLang } from './words';

export {
    findPerson,
    formatDuration,
    formatEventTime,
    loadPersons,
    loadPresenceHistory,
    parseHistoryJson,
    PERSON_STATES,
    type PersonRef,
    type PresenceEvent,
    type PresenceHistory,
    type PresenceSocket,
} from '../../src-devices/src/presenceApi';

/**
 * The channel of a person for what a `person` setting holds: the channel itself or a state below it
 *
 * @param id e.g. `teltonika.0.presence.persons.Anna` or `teltonika.0.presence.persons.Anna.present`
 * @returns `teltonika.0.presence.persons.Anna`, or null if the ID is no person of the adapter
 */
export function toPersonChannel(id: string | undefined | null): string | null {
    const match = String(id ?? '')
        .trim()
        .match(/^(teltonika\.\d+\.presence\.persons\.[^.]+)(\.|$)/);
    return match ? match[1] : null;
}

/** `true`/`false` of a state value, `undefined` if the state has no value */
export function toBool(value: ioBroker.StateValue | undefined): boolean | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === 'string') {
        return value === 'true' || value === '1' || value === 'on';
    }
    return !!value;
}

/** A number of a state value, `undefined` if the state has none */
export function toNumber(value: ioBroker.StateValue | undefined): number | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

/** A text of a state value, `''` if the state has none */
export function toText(value: ioBroker.StateValue | undefined): string {
    return value === undefined || value === null ? '' : String(value).trim();
}

/**
 * `info.connection` of teltonika is the comma separated list of the connected devices: a list with at least one
 * ID means connected. `null` while unknown.
 *
 * @param value the value of the state
 */
export function connectionOf(value: ioBroker.StateValue | undefined): boolean | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'string') {
        return value.split(',').some(id => id.trim() !== '');
    }
    return !!value;
}

/** `Anna` -> `A`, `Anna Maria Schmidt` -> `AS` */
export function initialsOf(name: string): string {
    const words = name
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .split(/[\s-]+/)
        .filter(Boolean);
    if (!words.length) {
        return '';
    }
    const first = Array.from(words[0])[0] || '';
    const last = words.length > 1 ? Array.from(words[words.length - 1])[0] || '' : '';
    return (first + last).toUpperCase();
}

/**
 * `Today`, `Yesterday` or `Monday, 05.10.` in the language of the system
 *
 * @param ts the time, in ms
 * @param lang the language of the system
 */
export function dayLabel(ts: number, lang: string): string {
    const locale = intlLang(lang);
    const date = new Date(ts);
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const startOfDay = new Date(ts).setHours(0, 0, 0, 0);
    const days = Math.round((startOfToday - startOfDay) / 86_400_000);
    if (days === 0 || days === 1) {
        try {
            const text = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-days, 'day');
            return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
        } catch {
            // falls through to the date
        }
    }
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        ...(date.getFullYear() === new Date().getFullYear() ? {} : { year: 'numeric' }),
    });
}

/**
 * `common.name` of an object as one text
 *
 * @param name the name
 * @param lang the language of the system
 */
export function nameOf(name: ioBroker.StringOrTranslated | undefined, lang: string): string {
    if (typeof name === 'string') {
        return name;
    }
    if (name && typeof name === 'object') {
        return name[lang as ioBroker.Languages] || name.en || Object.values(name)[0] || '';
    }
    return '';
}

/** A present person: `Person` of `@mui/icons-material` */
export const PERSON_ICON =
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4';

/** An absent person: `PersonOff` of `@mui/icons-material` */
export const AWAY_ICON =
    'M8.65 5.82C9.36 4.72 10.6 4 12 4c2.21 0 4 1.79 4 4 0 1.4-.72 2.64-1.82 3.35zM20 17.17c-.02-1.1-.63-2.11-1.61-2.62-.54-.28-1.13-.54-1.77-.76zm1.19 4.02L2.81 2.81 1.39 4.22l8.89 8.89c-1.81.23-3.39.79-4.67 1.45-1 .51-1.61 1.54-1.61 2.66V20h13.17l2.61 2.61z';

/** Coming: `Login` of `@mui/icons-material` */
export const ARRIVAL_ICON =
    'M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8z';

/** Going: `Logout` of `@mui/icons-material` */
export const DEPARTURE_ICON =
    'm17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z';

/** The comings and goings: `History` of `@mui/icons-material` */
export const HISTORY_ICON =
    'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z';

/** Read again: `Refresh` of `@mui/icons-material` */
export const REFRESH_ICON =
    'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z';

/** The router of the last sighting: `Router` of `@mui/icons-material` */
export const ROUTER_ICON =
    'M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z';

/** The Wi-Fi of the last sighting: `Wifi` of `@mui/icons-material` */
export const WIFI_ICON =
    'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8 3 3 3-3c-1.65-1.66-4.34-1.66-6 0m-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13';

/** The devices of the person: `Smartphone` of `@mui/icons-material` */
export const PHONE_ICON =
    'M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99M17 19H7V5h10z';
