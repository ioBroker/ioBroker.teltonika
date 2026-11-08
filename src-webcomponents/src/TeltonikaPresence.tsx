/**
 * The persons of the presence detection as a list: `<iob-teltonika-presence>` - the web component of the vis-2
 * widget "Teltonika presence" (`src-widgets/src/TeltonikaPresence.tsx`). There is no devices widget of it.
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`teltonika-presence.json`, written by the build from `manifest.ts`), so a host loads this module only
 * when it shows the element. The host sets `socket` and `settings`, and if it has them `theme` and `editMode`.
 *
 * `x of y present` and the guests on top, below it one row per person: present or away, for how long, and when the
 * person came or left. The persons are read once per instance (`loadPersons()`); the element then subscribes their
 * states. Nothing is written and nothing is clicked.
 *
 * React is not in the module: it comes from `lib/esm/react-19.js` beside `adapter/`, see `vite.config.ts`.
 */
import type { JSX } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { WebComponentSocket } from '@iobroker/web-components';
import { defineWebComponent, IobWebComponent } from '@iobroker/web-components/element';

import { PRESENCE_TAG, type PresenceSettings } from './constants';
import { Hint } from './Hint';
import { toInstance } from './instance';
import {
    AWAY_ICON,
    formatDuration,
    formatEventTime,
    loadPersons,
    PERSON_ICON,
    PERSON_STATES,
    toBool,
    toNumber,
    type PersonRef,
} from './presence';
import { PRESENCE_STYLES } from './styles';
import { getWord, type Word } from './words';

/** The states of a person a row shows */
const ROW_STATES = [
    PERSON_STATES.present,
    PERSON_STATES.lastArrival,
    PERSON_STATES.lastDeparture,
    PERSON_STATES.presentSince,
    PERSON_STATES.absentSince,
];

/** The durations are drawn again this often, in ms */
const TICK = 60_000;

/** One row: a person with what is shown of it */
interface PresenceRow {
    id: string;
    name: string;
    present: boolean | undefined;
    info: string;
    time: string;
}

class TeltonikaPresenceElement extends IobWebComponent<PresenceSettings> {
    readonly #root: Root;

    #ticker: ReturnType<typeof setInterval> | null = null;

    /** The persons of `#personsFor`; null while they are read */
    #persons: PersonRef[] | null = null;

    /** The instance and the socket of `#persons`, or of the reading under way */
    #personsFor: { instance: string; socket: WebComponentSocket } | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = PRESENCE_STYLES;
        const mount = document.createElement('div');
        mount.className = 'mount';
        shadow.append(style, mount);
        this.#root = createRoot(mount);
    }

    override connectedCallback(): void {
        super.connectedCallback();
        // the durations go on while nothing changes
        this.#ticker ??= setInterval(() => this.render(), TICK);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.#ticker) {
            clearInterval(this.#ticker);
            this.#ticker = null;
        }
    }

    protected override getStateIds(settings: PresenceSettings): string[] {
        const instance = toInstance(settings.instance);
        const persons = this.#getPersons(settings);
        if (!instance || !persons) {
            return [];
        }
        const ids = persons.flatMap(person => ROW_STATES.map(name => `${person.id}.${name}`));
        if (settings.showGuests !== false) {
            ids.push(`${instance}.presence.guests.count`);
        }
        return ids;
    }

    get #word(): Word {
        return getWord(this.systemLang);
    }

    /** The persons of the instance of the settings, only those of the group if one is set; null while read */
    #getPersons(settings: PresenceSettings): PersonRef[] | null {
        const instance = toInstance(settings.instance);
        if (
            !instance ||
            !this.#persons ||
            this.#personsFor?.instance !== instance ||
            this.#personsFor.socket !== this.socket
        ) {
            return null;
        }
        const group = (settings.group || '').trim().toLowerCase();
        return group ? this.#persons.filter(person => person.group.toLowerCase() === group) : this.#persons;
    }

    /** Read the persons of the instance once - again only when the instance or the socket changes */
    #load(): void {
        const socket = this.socket;
        const instance = socket ? toInstance(this.settings.instance) : null;
        if (!socket || !instance) {
            return;
        }
        if (this.#personsFor?.instance === instance && this.#personsFor.socket === socket) {
            return;
        }
        const wanted = { instance, socket };
        this.#personsFor = wanted;
        this.#persons = null;
        loadPersons(socket, instance)
            .then(persons => {
                if (this.#personsFor === wanted) {
                    this.#persons = persons;
                    // ask the base class for the states again: setting the same settings is what makes it ask
                    // eslint-disable-next-line no-self-assign
                    this.settings = this.settings;
                }
            })
            .catch(() => undefined);
    }

    #value(id: string): ioBroker.StateValue | undefined {
        return this.states[id]?.val;
    }

    /** A person: present or away and for how long, and when it came or left */
    #getRows(persons: PersonRef[]): PresenceRow[] {
        const word = this.#word;
        const lang = this.systemLang;
        const now = Date.now();
        return persons.map(person => {
            const present = toBool(this.#value(`${person.id}.${PERSON_STATES.present}`));
            if (present === undefined) {
                return { id: person.id, name: person.name, present, info: '…', time: '' };
            }
            const since = toNumber(
                this.#value(`${person.id}.${present ? PERSON_STATES.lastArrival : PERSON_STATES.lastDeparture}`),
            );
            const minutes = toNumber(
                this.#value(`${person.id}.${present ? PERSON_STATES.presentSince : PERSON_STATES.absentSince}`),
            );
            let duration = 0;
            if (since && since <= now) {
                duration = now - since;
            } else if (minutes) {
                duration = minutes * 60_000;
            }
            const state = word(present ? 'is_present' : 'is_away');
            return {
                id: person.id,
                name: person.name,
                present,
                info: duration ? `${state} · ${formatDuration(duration, lang)}` : state,
                time: since ? formatEventTime(since, lang) : '',
            };
        });
    }

    protected override render(): void {
        this.#load();
        this.#draw();
    }

    #draw(): void {
        const settings = this.settings;
        const word = this.#word;
        const editMode = this.editMode;
        const instance = toInstance(settings.instance);

        if (!instance) {
            this.#root.render(
                <Hint
                    text={word('wc_choose_instance')}
                    icon="person"
                    editMode={editMode}
                />,
            );
            return;
        }
        const persons = this.#getPersons(settings);
        if (!persons) {
            // the persons are read
            this.#root.render(<div className="root" />);
            return;
        }

        let rows = this.#getRows(persons);
        const presentCount = rows.filter(row => row.present).length;
        const guests =
            settings.showGuests !== false ? toNumber(this.#value(`${instance}.presence.guests.count`)) : undefined;
        const summary = word('present_count', presentCount, persons.length);
        if (settings.onlyActive) {
            rows = rows.filter(row => row.present);
        }
        if (settings.activeFirst !== false) {
            rows.sort((a, b) => Number(!!b.present) - Number(!!a.present) || a.name.localeCompare(b.name));
        }

        let content: JSX.Element | null = null;
        if (!rows.length) {
            content = <div className="empty">{word(persons.length ? 'nobody_present' : 'no_persons')}</div>;
        }
        this.#root.render(
            <div className={`root${editMode ? ' edit' : ''}`}>
                <div className="presence">
                    <div className="summary-line">
                        {guests === undefined ? summary : `${summary} · ${word('guests_count', guests)}`}
                    </div>
                    {content}
                    <div className="rows">
                        {rows.map(row => (
                            <div
                                key={row.id}
                                className={`row ${row.present === undefined ? 'unknown' : row.present ? 'present' : 'absent'}`}
                            >
                                <span className="avatar">
                                    <span className="disc">
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d={row.present === false ? AWAY_ICON : PERSON_ICON} />
                                        </svg>
                                    </span>
                                </span>
                                <div className="row-texts">
                                    <div className="row-name">{row.name}</div>
                                    <div className="row-info">{row.info}</div>
                                </div>
                                {row.time ? <span className="row-time">{row.time}</span> : null}
                            </div>
                        ))}
                    </div>
                </div>
            </div>,
        );
    }
}

defineWebComponent(PRESENCE_TAG, TeltonikaPresenceElement);
