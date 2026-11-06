/**
 * One person of the presence detection as a web component: `<iob-teltonika-person>` - the web component of the
 * vis-2 widget "Teltonika person" (`src-widgets/src/TeltonikaPerson.tsx`) and of the devices widget of the same name
 * (`src-devices/src/TeltonikaPersonComponent.tsx`).
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`teltonika-person.json`, written by the build from `manifest.ts`), so a host loads this module only when
 * it shows the element. The host sets `socket` and `settings`, and if it has them `theme`, `editMode` and
 * `dialogs`.
 *
 * The setting `person` is the channel of the person (`teltonika.0.presence.persons.Anna`) or a state below it.
 * The size of the box decides what is shown, with container queries: picture, name and status in a small box; the
 * arrival and departure beside them in a flat one; boxes with the times and the last comings and goings in a large
 * one. A click shows the comings and goings in a dialog of the host.
 *
 * Teltonika knows no host names: the devices of a person are the MAC addresses seen, and `router`, `ssid` and
 * `lastSeen` tell where the person was seen last. `info.connection` of the instance says whether the values are
 * current - they are faded while no router is connected.
 *
 * React is not in the module: it comes from `lib/esm/react-19.js` beside `adapter/`, see `vite.config.ts`.
 */
import { Fragment, type CSSProperties, type JSX } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { WebComponentSocket } from '@iobroker/web-components';
import { defineWebComponent, getThemeCssVariables, IobWebComponent } from '@iobroker/web-components/element';

import { PERSON_CLICK_EVENT, PERSON_TAG, type PersonSettings } from './constants';
import { Hint } from './Hint';
import {
    ARRIVAL_ICON,
    AWAY_ICON,
    connectionOf,
    dayLabel,
    DEPARTURE_ICON,
    formatDuration,
    formatEventTime,
    HISTORY_ICON,
    initialsOf,
    loadPresenceHistory,
    nameOf,
    parseHistoryJson,
    PERSON_ICON,
    PHONE_ICON,
    REFRESH_ICON,
    ROUTER_ICON,
    toBool,
    toNumber,
    toPersonChannel,
    toText,
    WIFI_ICON,
    type PresenceEvent,
    type PresenceHistory,
} from './presence';
import { PERSON_DIALOG_STYLES, PERSON_STYLES } from './styles';
import { getWord, intlLang, type Word } from './words';

/** The states of a person the element shows, below its channel */
const VALUE_KEYS = [
    'present',
    'lastArrival',
    'lastDeparture',
    'presentSince',
    'absentSince',
    'presentToday',
    'absentToday',
    'devices',
    'lastSeen',
    'router',
    'ssid',
] as const;

type ValueKey = (typeof VALUE_KEYS)[number] | 'history';

/** The durations are drawn again this often, in ms */
const TICK = 30_000;

/** The comings and goings are read again this long after `present` or `history` changed, in ms */
const RELOAD_DELAY = 1_000;

/** Events read at least: the dialog shows more than the element */
const DIALOG_EVENTS = 50;

/** The width the dialog asks the host for, in px */
const DIALOG_WIDTH = 440;

/** The comings and goings as read for one person, number and days */
interface HistoryLoad {
    key: string;
    socket: WebComponentSocket;
    loading: boolean;
    history: PresenceHistory | null;
}

/** One box of the details */
interface Detail {
    key: string;
    label: string;
    value: string;
    wide?: boolean;
}

/** `teltonika.0` of `teltonika.0.presence.persons.Anna` */
function instanceOf(channel: string): string {
    return channel.split('.').slice(0, 2).join('.');
}

function clampInt(value: number | undefined, min: number, max: number, def: number): number {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? Math.min(max, Math.max(min, Math.round(num))) : def;
}

function Icon({ path }: { path: string }): JSX.Element {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d={path} />
        </svg>
    );
}

/**
 * The picture of the person: the image of the settings, the initials or a symbol - in a circle of the color of the
 * state, with a dot of that color
 *
 * @param props what to show
 * @param props.name the name, for the initials
 * @param props.image URL of a picture
 * @param props.present the state, `undefined` while unknown
 * @param props.gray an absent person is shown in gray
 * @param props.dot with the dot of the state
 */
function Avatar({
    name,
    image,
    present,
    gray,
    dot,
}: {
    name: string;
    image: string;
    present: boolean | undefined;
    gray: boolean;
    dot: boolean;
}): JSX.Element {
    const initials = initialsOf(name);
    let content: JSX.Element;
    if (image) {
        content = (
            <img
                className={gray ? 'gray' : undefined}
                src={image}
                alt=""
            />
        );
    } else if (initials) {
        content = <span className="initials">{initials}</span>;
    } else {
        content = <Icon path={present === false ? AWAY_ICON : PERSON_ICON} />;
    }
    return (
        <span className="avatar">
            <span className="disc">{content}</span>
            {dot && present !== undefined ? <span className="avatar-dot" /> : null}
        </span>
    );
}

class TeltonikaPersonElement extends IobWebComponent<PersonSettings> {
    readonly #root: Root;

    #ticker: ReturnType<typeof setInterval> | null = null;

    #reload: ReturnType<typeof setTimeout> | null = null;

    /** The comings and goings read last */
    #history: HistoryLoad | null = null;

    /** `present` and `history` when the comings and goings were read: a change reads them again */
    #historyTrigger = '';

    /** The names of the routers by the ID of their channel, `''` while read */
    #routerNames = new Map<string, string>();

    #routerSocket: WebComponentSocket | null = null;

    /** Draws the open dialog again; null while none is open */
    #drawDialog: (() => void) | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = PERSON_STYLES;
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
        if (this.#reload) {
            clearTimeout(this.#reload);
            this.#reload = null;
        }
    }

    protected override getObjectIds(settings: PersonSettings): string[] {
        const channel = toPersonChannel(settings.person);
        return channel ? [channel] : [];
    }

    protected override getStateIds(settings: PersonSettings): string[] {
        const channel = toPersonChannel(settings.person);
        if (!channel) {
            return [];
        }
        const ids: string[] = VALUE_KEYS.map(key => `${channel}.${key}`);
        if (settings.showHistory !== false) {
            ids.push(`${channel}.history`);
        }
        ids.push(`${instanceOf(channel)}.info.connection`);
        return ids;
    }

    get #word(): Word {
        return getWord(this.systemLang);
    }

    get #channel(): string | null {
        return toPersonChannel(this.settings.person);
    }

    #value(key: ValueKey): ioBroker.StateValue | undefined {
        const channel = this.#channel;
        return channel ? this.states[`${channel}.${key}`]?.val : undefined;
    }

    get #present(): boolean | undefined {
        return toBool(this.#value('present'));
    }

    get #historyCount(): number {
        return clampInt(this.settings.historyCount, 1, 100, 10);
    }

    get #historyDays(): number {
        return clampInt(this.settings.historyDays, 1, 365, 7);
    }

    /** `nameText` of the settings, the configured name of the person, the name of the channel or its last part */
    get #displayName(): string {
        const own = (this.settings.nameText || '').trim();
        if (own) {
            return own;
        }
        const channel = this.#channel;
        const obj = channel ? this.objects[channel] : null;
        const person = (obj?.native as { person?: string } | undefined)?.person;
        return person || nameOf(obj?.common?.name, this.systemLang) || channel?.split('.').pop() || '';
    }

    /** The colors of the settings as CSS variables */
    get #colors(): CSSProperties {
        const present = (this.settings.presentColor || '').trim();
        const absent = (this.settings.absentColor || '').trim();
        return {
            ...(present ? { '--present-color': present } : {}),
            ...(absent ? { '--absent-color': absent } : {}),
        } as CSSProperties;
    }

    /** `present`, `absent` or `unknown` */
    get #stateClass(): string {
        const present = this.#present;
        return present === undefined ? 'unknown' : present ? 'present' : 'absent';
    }

    /** The configured text of the state, otherwise `Present` / `Away`; `…` while unknown */
    get #statusText(): string {
        const present = this.#present;
        if (present === undefined) {
            return '…';
        }
        const own = ((present ? this.settings.presentText : this.settings.absentText) || '').trim();
        return own || this.#word(present ? 'telt_present' : 'telt_absent');
    }

    /** `for 2 h 15 min` since the last change; empty if unknown */
    get #durationText(): string {
        const present = this.#present;
        if (present === undefined) {
            return '';
        }
        const now = Date.now();
        let duration = 0;
        const since = toNumber(this.#value(present ? 'lastArrival' : 'lastDeparture'));
        if (since && since <= now) {
            duration = now - since;
        } else {
            const minutes = toNumber(this.#value(present ? 'presentSince' : 'absentSince'));
            duration = minutes ? minutes * 60_000 : 0;
        }
        return duration ? this.#word('telt_sinceDuration', formatDuration(duration, this.systemLang)) : '';
    }

    /** No router of the instance is connected: the values are old */
    get #stale(): boolean {
        const channel = this.#channel;
        return !!channel && connectionOf(this.states[`${instanceOf(channel)}.info.connection`]?.val) === false;
    }

    /** The image of the settings */
    get #image(): string {
        return (this.settings.image || '').trim();
    }

    get #gray(): boolean {
        return this.#present === false && this.settings.grayAbsent !== false;
    }

    /** The name of the router that saw the person last; its ID while the name is read */
    #routerName(router: string): string {
        const channel = this.#channel;
        const socket = this.socket;
        if (!router || !channel || !socket) {
            return router;
        }
        if (this.#routerSocket !== socket) {
            this.#routerSocket = socket;
            this.#routerNames.clear();
        }
        const id = `${instanceOf(channel)}.${router}`;
        const known = this.#routerNames.get(id);
        if (known === undefined) {
            this.#routerNames.set(id, '');
            socket
                .getObject(id)
                .then(obj => {
                    if (this.#routerSocket === socket) {
                        this.#routerNames.set(id, nameOf(obj?.common?.name, this.systemLang));
                        this.render();
                    }
                })
                .catch(() => undefined);
        }
        return known || router;
    }

    /** Where and when the person was seen last: `router · SSID · time` */
    get #seenText(): string {
        const lastSeen = toNumber(this.#value('lastSeen'));
        return [
            this.#routerName(toText(this.#value('router'))),
            toText(this.#value('ssid')),
            lastSeen ? formatEventTime(lastSeen, this.systemLang) : '',
        ]
            .filter(Boolean)
            .join(' · ');
    }

    /** The detail boxes the settings switch on */
    #getDetails(): Detail[] {
        const settings = this.settings;
        const word = this.#word;
        const lang = this.systemLang;
        const time = (key: 'lastArrival' | 'lastDeparture'): string =>
            formatEventTime(toNumber(this.#value(key)) || 0, lang);
        const minutes = (key: 'presentToday' | 'absentToday'): string => {
            const value = toNumber(this.#value(key));
            return value === undefined ? '—' : formatDuration(value * 60_000, lang);
        };
        const details: Detail[] = [];
        if (settings.showArrival !== false) {
            details.push({ key: 'arrival', label: word('telt_lastArrival'), value: time('lastArrival') });
        }
        if (settings.showDeparture !== false) {
            details.push({ key: 'departure', label: word('telt_lastDeparture'), value: time('lastDeparture') });
        }
        if (settings.showToday) {
            details.push({ key: 'presentToday', label: word('telt_presentToday'), value: minutes('presentToday') });
            details.push({ key: 'absentToday', label: word('telt_absentToday'), value: minutes('absentToday') });
        }
        if (settings.showDevices) {
            details.push({
                key: 'devices',
                label: word('macs'),
                value: toText(this.#value('devices')) || '—',
                wide: true,
            });
        }
        if (settings.showSeen) {
            details.push({ key: 'seen', label: word('telt_lastSeen'), value: this.#seenText || '—', wide: true });
        }
        return details;
    }

    /** The comings and goings, newest first: as read, or from the state `history` until they are */
    get #events(): PresenceEvent[] {
        return this.#history?.history?.events ?? parseHistoryJson(this.#value('history'));
    }

    /**
     * Read the comings and goings - again only for another person, number or socket, or if `force`
     *
     * @param force read them again, e.g. after a change
     */
    #loadHistory(force: boolean): void {
        const socket = this.socket;
        const channel = this.#channel;
        if (!socket || !channel) {
            return;
        }
        const count = Math.max(this.#historyCount, DIALOG_EVENTS);
        const days = this.#historyDays;
        const key = `${channel}|${count}|${days}`;
        const previous = this.#history;
        const same = previous?.key === key && previous.socket === socket;
        if (same && !force) {
            return;
        }
        const load: HistoryLoad = { key, socket, loading: true, history: same ? previous.history : null };
        this.#history = load;
        loadPresenceHistory(socket, channel, { count, days })
            .then(history => {
                if (this.#history === load) {
                    load.history = history;
                    load.loading = false;
                    this.render();
                }
            })
            .catch(() => undefined);
    }

    /** Read the comings and goings when they are shown, and again shortly after `present` or `history` changed */
    #watchHistory(): void {
        const channel = this.#channel;
        if (!this.socket || !channel || this.settings.showHistory === false) {
            return;
        }
        const present = this.states[`${channel}.present`];
        const history = this.states[`${channel}.history`];
        if (present === undefined || history === undefined) {
            // not read yet
            return;
        }
        const trigger = `${String(present?.val)}|${String(history?.val ?? '')}`;
        const count = Math.max(this.#historyCount, DIALOG_EVENTS);
        const key = `${channel}|${count}|${this.#historyDays}`;
        if (this.#history?.key !== key || this.#history.socket !== this.socket) {
            this.#historyTrigger = trigger;
            this.#loadHistory(false);
        } else if (trigger !== this.#historyTrigger) {
            this.#historyTrigger = trigger;
            if (this.#reload) {
                clearTimeout(this.#reload);
            }
            // a history instance stores the change a moment later
            this.#reload = setTimeout(() => {
                this.#reload = null;
                this.#loadHistory(true);
            }, RELOAD_DELAY);
        }
    }

    get #clickable(): boolean {
        const channel = this.#channel;
        return !this.editMode && !!channel && !!this.objects[channel] && this.settings.showHistory !== false;
    }

    #onOpen = (): void => {
        const channel = this.#channel;
        if (!this.#clickable || this.#drawDialog || !this.emit(PERSON_CLICK_EVENT, { person: channel })) {
            return;
        }
        void this.#openDialog();
    };

    #onKeyDown = (e: { key: string; preventDefault: () => void }): void => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.#onOpen();
        }
    };

    /** The comings and goings in an element dialog of the host, drawn again with the element */
    async #openDialog(): Promise<void> {
        const element = document.createElement('div');
        const shadow = element.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = PERSON_DIALOG_STYLES;
        const mount = document.createElement('div');
        shadow.append(style, mount);
        const dialogRoot = createRoot(mount);
        this.#drawDialog = () => {
            // the host moves the content into its dialog, out of this element: it takes the theme along
            for (const [name, value] of Object.entries(getThemeCssVariables(this.theme))) {
                element.style.setProperty(name, value);
            }
            dialogRoot.render(this.#renderDialog());
        };
        this.#drawDialog();
        this.#loadHistory(true);
        try {
            await this.openDialog({ title: this.#displayName, element, width: DIALOG_WIDTH });
        } finally {
            this.#drawDialog = null;
            dialogRoot.unmount();
        }
    }

    #renderEventRow(event: PresenceEvent, until: number, ongoing: boolean): JSX.Element {
        const word = this.#word;
        const lang = this.systemLang;
        const duration = formatDuration(Math.max(0, until - event.ts), lang);
        return (
            <div
                key={`${event.ts}_${String(event.present)}`}
                className={`dlg-event ${event.present ? 'present' : 'absent'}`}
            >
                <span className="icon">
                    <Icon path={event.present ? ARRIVAL_ICON : DEPARTURE_ICON} />
                </span>
                <div className="ev-main">
                    <div className="ev-label">{word(event.present ? 'telt_came' : 'telt_left')}</div>
                    <div className={`ev-sub${ongoing ? ' ongoing' : ''}`}>
                        {ongoing
                            ? word('telt_sinceDuration', duration)
                            : word(event.present ? 'telt_stayed' : 'telt_wasAway', duration)}
                    </div>
                </div>
                <span
                    className="ev-time"
                    title={new Date(event.ts).toLocaleString(intlLang(lang))}
                >
                    {new Date(event.ts).toLocaleTimeString(intlLang(lang), { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        );
    }

    /** The events of the dialog, grouped by day */
    #renderDays(): JSX.Element {
        const word = this.#word;
        const load = this.#history;
        const events = load?.history?.events ?? [];
        if (!events.length) {
            return <div className="empty">{load && !load.history ? '…' : word('telt_noHistory')}</div>;
        }
        const now = Date.now();
        const present = this.#present;
        const days: { day: string; rows: JSX.Element[] }[] = [];
        events.forEach((event, i) => {
            const day = dayLabel(event.ts, this.systemLang);
            // the newest event lasts until now, every other one until the next newer one
            const row = this.#renderEventRow(
                event,
                i === 0 ? now : events[i - 1].ts,
                i === 0 && present === event.present,
            );
            const last = days[days.length - 1];
            if (last?.day === day) {
                last.rows.push(row);
            } else {
                days.push({ day, rows: [row] });
            }
        });
        return (
            <div className={`days${load?.loading ? ' loading' : ''}`}>
                {days.map(group => (
                    <div
                        key={group.day}
                        className="day"
                    >
                        <div className="day-label">{group.day}</div>
                        {group.rows}
                    </div>
                ))}
            </div>
        );
    }

    /** Present and away today as a bar */
    #renderToday(): JSX.Element | null {
        const word = this.#word;
        const presentMin = toNumber(this.#value('presentToday')) || 0;
        const absentMin = toNumber(this.#value('absentToday')) || 0;
        if (presentMin + absentMin <= 0) {
            return null;
        }
        const presentText = formatDuration(presentMin * 60_000, this.systemLang);
        const absentText = formatDuration(absentMin * 60_000, this.systemLang);
        const share = (presentMin / (presentMin + absentMin)) * 100;
        return (
            <div
                className="today"
                title={`${word('telt_presentToday')}: ${presentText} · ${word('telt_absentToday')}: ${absentText}`}
            >
                <div className="today-text">
                    <span className="text">
                        {`${word('telt_presentToday')}: `}
                        <span className="value">{presentText}</span>
                    </span>
                    <span>{absentText}</span>
                </div>
                <div className="bar">
                    <span style={{ width: `${share}%` }} />
                </div>
            </div>
        );
    }

    /** The last sighting: router, Wi-Fi and time */
    #renderSighting(): JSX.Element | null {
        const word = this.#word;
        const lastSeen = toNumber(this.#value('lastSeen'));
        if (!lastSeen) {
            return null;
        }
        const router = this.#routerName(toText(this.#value('router')));
        const ssid = toText(this.#value('ssid'));
        const title = [
            `${word('telt_lastSeen')}: ${new Date(lastSeen).toLocaleString(intlLang(this.systemLang))}`,
            router ? `${word('telt_router')}: ${router}` : '',
            ssid ? `SSID: ${ssid}` : '',
        ]
            .filter(Boolean)
            .join('\n');
        return (
            <div
                className="info-line"
                title={title}
            >
                <Icon path={ROUTER_ICON} />
                <span>{`${word('telt_lastSeen')}:`}</span>
                <span className="value">{formatEventTime(lastSeen, this.systemLang)}</span>
                {router ? <span className="text">{`· ${router}`}</span> : null}
                {ssid ? (
                    <>
                        <Icon path={WIFI_ICON} />
                        <span className="text">{ssid}</span>
                    </>
                ) : null}
            </div>
        );
    }

    #renderDialog(): JSX.Element {
        const word = this.#word;
        const load = this.#history;
        const present = this.#present;
        const devices = toText(this.#value('devices'));
        const duration = this.settings.showDuration !== false ? this.#durationText : '';
        const history = load?.history;
        const source =
            history?.source === 'history'
                ? word('telt_historyFrom', history.instance || 'history')
                : history?.source === 'adapter'
                  ? word('telt_historyFromAdapter')
                  : '';
        return (
            <div
                className={`dialog ${this.#stateClass}`}
                style={this.#colors}
            >
                <div className="dlg-status">
                    <Avatar
                        name={this.#displayName}
                        image={this.#image}
                        present={present}
                        gray={this.#gray}
                        dot={false}
                    />
                    <div className="texts">
                        <div className="status">
                            <span className="dot" />
                            <span className="status-text">{this.#statusText}</span>
                        </div>
                        {duration ? <div className="duration">{duration}</div> : null}
                    </div>
                </div>
                {this.#renderToday()}
                {devices && present ? (
                    <div
                        className="info-line"
                        title={`${word('telt_devicesSeen')}: ${devices}`}
                    >
                        <Icon path={PHONE_ICON} />
                        <span className="text mono">{devices}</span>
                    </div>
                ) : null}
                {this.#renderSighting()}
                <div className="dlg-title">
                    <Icon path={HISTORY_ICON} />
                    <span>{word('telt_historyTitle')}</span>
                    <button
                        type="button"
                        className="refresh"
                        title={word('telt_refresh')}
                        aria-label={word('telt_refresh')}
                        disabled={!!load?.loading}
                        onClick={() => this.#loadHistory(true)}
                    >
                        <Icon path={REFRESH_ICON} />
                    </button>
                </div>
                {this.#renderDays()}
                {source && history?.events.length ? <div className="source">{source}</div> : null}
            </div>
        );
    }

    /** The last comings and goings, as many as the settings say */
    #renderHistory(): JSX.Element {
        const word = this.#word;
        const events = this.#events.slice(0, this.#historyCount);
        const now = Date.now();
        const present = this.#present;
        const lang = this.systemLang;
        return (
            <div className="history">
                <div className="history-head">
                    <span>{word('telt_historyTitle')}</span>
                </div>
                {events.length ? (
                    <div className="history-list">
                        {events.map((event, i) => {
                            const duration = formatDuration(
                                Math.max(0, (i === 0 ? now : events[i - 1].ts) - event.ts),
                                lang,
                            );
                            const ongoing = i === 0 && present === event.present;
                            return (
                                <div
                                    key={`${event.ts}_${String(event.present)}`}
                                    className="event"
                                >
                                    <span className={`dot event-dot ${event.present ? 'present' : 'absent'}`} />
                                    <span className="event-label">
                                        {word(event.present ? 'telt_came' : 'telt_left')}
                                    </span>
                                    <span className="event-duration">
                                        {ongoing
                                            ? word('telt_sinceDuration', duration)
                                            : word(event.present ? 'telt_stayed' : 'telt_wasAway', duration)}
                                    </span>
                                    <span className="event-time">{formatEventTime(event.ts, lang)}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="history-empty">{word('telt_noHistory')}</div>
                )}
            </div>
        );
    }

    protected override render(): void {
        this.#watchHistory();
        this.#draw();
        this.#drawDialog?.();
    }

    #draw(): void {
        const settings = this.settings;
        const word = this.#word;
        const editMode = this.editMode;
        const wanted = (settings.person || '').trim();
        const channel = this.#channel;

        if (!wanted || !channel) {
            this.#root.render(
                <Hint
                    text={word(wanted ? 'wc_not_person' : 'select_person')}
                    icon="person"
                    editMode={editMode}
                />,
            );
            return;
        }
        if (this.objects[channel] === null) {
            this.#root.render(
                <Hint
                    text={word('telt_personNotFoundIn', channel.split('.').pop() || channel, instanceOf(channel))}
                    icon="person"
                    editMode={editMode}
                />,
            );
            return;
        }

        const present = this.#present;
        const name = this.#displayName;
        const duration = settings.showDuration !== false ? this.#durationText : '';
        const details = this.#getDetails();
        const times = details.filter(detail => detail.key === 'arrival' || detail.key === 'departure');
        const clickable = this.#clickable;
        const classes = ['person', this.#stateClass, this.#stale ? 'stale' : '', clickable ? 'clickable' : ''].filter(
            Boolean,
        );

        this.#root.render(
            <div className={`root${editMode ? ' edit' : ''}`}>
                <div
                    className={classes.join(' ')}
                    style={this.#colors}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    title={clickable ? `${name} - ${word('telt_showHistoryOf')}` : undefined}
                    onClick={clickable ? this.#onOpen : undefined}
                    onKeyDown={clickable ? this.#onKeyDown : undefined}
                >
                    <div className="head">
                        <Avatar
                            name={name}
                            image={this.#image}
                            present={present}
                            gray={this.#gray}
                            dot
                        />
                        <div className="texts">
                            {settings.showName !== false ? <div className="name">{name}</div> : null}
                            <div className="status">
                                <span className="dot" />
                                <span className="status-text">{this.#statusText}</span>
                            </div>
                            {duration ? <div className="duration">{duration}</div> : null}
                        </div>
                        {times.length ? (
                            <div className="times">
                                {times.map(detail => (
                                    <Fragment key={detail.key}>
                                        <span>{detail.label}</span>
                                        <span className="value">{detail.value}</span>
                                    </Fragment>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    {details.length ? (
                        <div className="details">
                            {details.map(detail => (
                                <div
                                    key={detail.key}
                                    className={`box${detail.wide ? ' wide' : ''}`}
                                    title={`${detail.label}: ${detail.value}`}
                                >
                                    <div className="box-label">{detail.label}</div>
                                    <div className="box-value">{detail.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    {settings.showHistory !== false ? this.#renderHistory() : null}
                </div>
            </div>,
        );
    }
}

defineWebComponent(PERSON_TAG, TeltonikaPersonElement);
