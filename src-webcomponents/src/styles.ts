/**
 * The styles of the shadow roots. An element fills the box of the host, has a transparent background and inherits
 * `color` and `font`, so it follows the theme of the host; the colors of a state come from the theme as well
 * (`--iob-success`, `--iob-error`, ...). Sizes follow the box with container queries, never measured.
 *
 * The content of a dialog has a shadow root of its own: `DIALOG_BASE` instead of `BASE`.
 */

/** Colors and helpers every element and dialog shares */
const COMMON = `
* {
    box-sizing: border-box;
}
.root, .dialog {
    --link: var(--iob-success);
    --idle: color-mix(in srgb, currentColor 38%, transparent);
    --off: color-mix(in srgb, var(--iob-error) 70%, currentColor);
    --tint: color-mix(in srgb, currentColor 6%, transparent);
    --hover: color-mix(in srgb, currentColor 10%, transparent);
    --frame: color-mix(in srgb, currentColor 18%, transparent);
    --muted: color-mix(in srgb, currentColor 66%, transparent);
    --faint: color-mix(in srgb, currentColor 45%, transparent);
    -webkit-tap-highlight-color: transparent;
}
.muted {
    color: var(--muted);
}
.faint {
    color: var(--faint);
}
.small {
    font-size: 0.8em;
}
.strong {
    font-weight: 700;
}
.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.nowrap {
    white-space: nowrap;
}
.ellipsis {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.clickable {
    cursor: pointer;
}
.clickable:focus-visible,
[role='switch']:focus-visible {
    outline: 2px solid var(--iob-primary);
    outline-offset: -2px;
}
.edit {
    pointer-events: none;
}
.dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--faint);
}
.dot.online {
    background: var(--iob-success);
}
.dot.standby {
    background: var(--iob-warning);
}
.dot.offline {
    background: var(--iob-error);
}
button {
    font: inherit;
    color: inherit;
}
`;

/** The element: fills the box of the host, which is the container of the container queries */
const BASE = `
:host {
    display: block;
    width: 100%;
    height: 100%;
}
.mount {
    width: 100%;
    height: 100%;
    /* the size of the box does not depend on what is in it - no loop between measuring and laying out */
    container-type: size;
}
.root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
}
.hint {
    width: 100%;
    height: 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    color: var(--muted, inherit);
    opacity: 0.8;
    font-size: clamp(11px, 5cqmin, 15px);
}
.hint svg {
    width: clamp(18px, 12cqmin, 36px);
    height: clamp(18px, 12cqmin, 36px);
    fill: currentColor;
}
`;

/** The content of a dialog of the host: it flows, the dialog scrolls */
export const DIALOG_BASE = `
:host {
    display: block;
}
.dialog {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: inherit;
    font: inherit;
    min-width: min(320px, 80vw);
}
`;

/** A device: port strip, front panel, tile and details - in the elements and in their dialogs */
export const DEVICE = `
.strip {
    display: inline-flex;
    gap: 2px;
    align-items: flex-end;
}
.strip span {
    width: 6px;
    height: var(--strip, 14px);
    border-radius: 1px;
    background: var(--idle);
    opacity: 0.6;
}
.strip span.up {
    background: var(--link);
    opacity: 1;
}
.strip span.disabled {
    background: var(--off);
}
.panel {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: calc(var(--s, 28px) * 0.4);
    font-size: calc(var(--s, 28px) * 0.34);
    line-height: 1.4;
}
.group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--s, 28px) * 0.12);
    padding: calc(var(--s, 28px) * 0.2);
    border: 1px solid var(--frame);
    border-radius: calc(var(--iob-border-radius, 4px) * 1.5);
}
.group .row {
    display: flex;
}
.num {
    width: calc(var(--s, 28px) * 1.3 + 2px);
    text-align: center;
    font-weight: 600;
    opacity: 0.85;
}
.cell {
    width: calc(var(--s, 28px) * 1.3 + 2px);
    padding: calc(var(--s, 28px) * 0.1) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--frame);
    color: var(--idle);
}
.cell.up {
    color: var(--link);
}
.cell.disabled {
    color: var(--off);
}
.cell.switchable {
    cursor: pointer;
}
.cell.switchable:hover {
    background: var(--hover);
}
.cell svg {
    width: var(--s, 28px);
    height: calc(var(--s, 28px) * 0.82);
    display: block;
    fill: currentColor;
}
.cell.flipped svg {
    transform: rotate(180deg);
}
.badge {
    height: calc(var(--s, 28px) * 0.42);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--iob-text, currentColor);
}
.speed {
    padding: 0 0.45em;
    border-radius: 999px;
    background: var(--hover);
    font-size: calc(var(--s, 28px) * 0.26);
    line-height: 1.6;
}
.bolt {
    color: var(--iob-warning);
    font-size: calc(var(--s, 28px) * 0.3);
    line-height: 1;
}
.bolt.idle {
    opacity: 0.3;
}
.caption {
    font-weight: 700;
    opacity: 0.85;
}
.card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 10px 12px;
    border-radius: calc(var(--iob-border-radius, 4px) * 2);
    border-left: 4px solid var(--faint);
    background: var(--tint);
    box-shadow: inset 0 0 0 1px var(--frame);
}
.card.online {
    border-left-color: var(--iob-success);
}
.card.offline {
    border-left-color: var(--iob-error);
}
.card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
}
.card-name {
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.card-head .muted {
    font-size: 0.8em;
}
.line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.line.wrap {
    flex-wrap: wrap;
}
.wan-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.wan-chip.off,
.item.off {
    opacity: 0.5;
}
.panel-box {
    --s: 28px;
    overflow-x: auto;
    padding-bottom: 2px;
}
.section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.section-title {
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
}
.item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 4px 8px;
    border-radius: var(--iob-border-radius, 4px);
    box-shadow: inset 0 0 0 1px var(--frame);
    font-size: 0.85em;
}
.poe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(230px, 100%), 1fr));
    gap: 4px;
}
.item.poe .bolt {
    font-size: 1em;
}
.poe-state {
    margin-left: auto;
    padding-left: 8px;
    color: var(--muted);
}
.poe-state.on {
    color: var(--iob-warning);
}
.wan-label {
    min-width: 6em;
}
.wan-status {
    min-width: 5.5em;
    color: var(--muted);
}
.wan-status.online {
    color: var(--iob-success);
}
.wan-status.standby {
    color: var(--iob-warning);
}
.wan-status.offline {
    color: var(--iob-error);
}
.facts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
}
.toggle {
    position: relative;
    flex: none;
    width: 30px;
    height: 16px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: var(--idle);
    cursor: pointer;
    transition: background 0.2s;
}
.toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--iob-paper, #fff);
    transition: transform 0.2s;
}
.toggle.checked {
    background: var(--iob-primary);
}
.toggle.checked::after {
    transform: translateX(14px);
}
`;

/** `<iob-teltonika-devices>`: summary, tiles, or the details of every device */
export const DEVICES_STYLES = `${COMMON}${BASE}${DEVICE}
.summary {
    height: 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, 2.5cqmin, 10px);
    text-align: center;
}
.summary.clickable:hover {
    background: var(--tint);
}
.count {
    display: flex;
    align-items: baseline;
    gap: 0.2em;
    font-size: clamp(20px, 20cqmin, 72px);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}
.count .online {
    color: var(--iob-success);
}
.count .slash {
    font-size: 0.7em;
    font-weight: 400;
    opacity: 0.4;
}
.count-label {
    font-size: clamp(10px, 6cqmin, 16px);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
}
.count-links {
    font-size: clamp(10px, 5.5cqmin, 15px);
    color: var(--muted);
}
.strips {
    --strip: clamp(8px, 6cqmin, 18px);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 2px;
}
@container (max-height: 140px) {
    .strips {
        display: none;
    }
}
@container (max-height: 90px) {
    .count-label {
        display: none;
    }
}
.tiles {
    height: 100%;
    overflow: auto;
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px;
}
.tiles .card {
    flex: 1 1 220px;
}
.tiles.clickable .card:hover {
    background: var(--hover);
}
.list {
    height: 100%;
    overflow: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    user-select: text;
}
.empty {
    padding: 12px;
    color: var(--muted);
}
`;

/** `<iob-teltonika-ports>`: the front panel of one device, or its details */
export const PORTS_STYLES = `${COMMON}${BASE}${DEVICE}
.front {
    /* the socket: as big as the box allows for the number of columns, see panelColumns() */
    --s: clamp(10px, min(calc((100cqw - 20px) / (var(--cols, 4) * 1.35 + var(--groups, 1) * 0.7)), calc((100cqh - 56px) / 5.3)), 40px);
    height: 100%;
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    text-align: center;
}
.front.clickable:hover {
    background: var(--tint);
}
.front-name {
    max-width: 100%;
    font-weight: 700;
    font-size: clamp(11px, 6cqmin, 18px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.front-links {
    font-size: clamp(10px, 5cqmin, 14px);
    color: var(--muted);
}
.front.offline .panel {
    opacity: 0.55;
}
.list {
    height: 100%;
    overflow: auto;
    padding: 4px;
    user-select: text;
}
`;

/** The details of devices in a dialog of the host */
export const DEVICE_DIALOG_STYLES = `${COMMON}${DIALOG_BASE}${DEVICE}`;

/** A person: the avatar in the color of the state, and the comings and goings - in the element and in its dialog */
const PERSON = `
.person,
.presence,
.dialog {
    --state: var(--faint);
    --present: var(--present-color, var(--iob-success));
    --absent: var(--absent-color, var(--muted));
}
.present {
    --state: var(--present);
}
.absent {
    --state: var(--absent);
}
.avatar {
    position: relative;
    flex: none;
    display: inline-flex;
    width: var(--avatar);
    height: var(--avatar);
}
.disc {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--state);
    background: color-mix(in srgb, var(--state) 16%, transparent);
    border: max(2px, calc(var(--avatar) * 0.04)) solid color-mix(in srgb, var(--state) 70%, transparent);
    transition: all 0.3s ease;
}
.disc img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition:
        filter 0.3s ease,
        opacity 0.3s ease;
}
.disc img.gray {
    filter: grayscale(1);
    opacity: 0.6;
}
.disc svg {
    width: 60%;
    height: 60%;
    fill: currentColor;
}
.initials {
    font-size: calc(var(--avatar) * 0.38);
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1;
}
.avatar-dot {
    position: absolute;
    right: 1%;
    bottom: 1%;
    width: 26%;
    height: 26%;
    min-width: 8px;
    min-height: 8px;
    border-radius: 50%;
    background: var(--state);
    border: 2px solid var(--iob-paper, #fff);
}
.status {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-weight: 600;
    color: var(--state);
}
.status .dot {
    background: var(--state);
}
.present .status .dot {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--state) 18%, transparent);
}
.event-dot.present {
    background: var(--present);
}
.event-dot.absent {
    background: var(--absent);
}
`;

/** `<iob-teltonika-person>`: compact, a row or everything - by the size of the box */
export const PERSON_STYLES = `${COMMON}${BASE}${PERSON}
.person {
    --avatar: clamp(40px, 24cqmin, 72px);
    height: 100%;
    padding: clamp(6px, 4cqmin, 14px);
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 3cqmin, 12px);
}
.person.clickable:hover {
    background: var(--tint);
}
.head {
    flex: none;
    display: flex;
    align-items: center;
    gap: clamp(8px, 4cqmin, 14px);
    min-width: 0;
}
.texts {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.name {
    max-width: 100%;
    font-weight: 600;
    font-size: clamp(13px, 7cqmin, 20px);
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.person .status {
    font-size: clamp(11px, 5.5cqmin, 15px);
    line-height: 1.3;
}
.status-text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.duration {
    font-size: clamp(10px, 5cqmin, 13px);
    line-height: 1.35;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.stale .texts,
.stale .times,
.stale .details,
.stale .history {
    opacity: 0.55;
}
.times {
    display: none;
    flex: none;
    grid-template-columns: auto auto;
    column-gap: 8px;
    row-gap: 2px;
    font-size: 12px;
    line-height: 1.35;
    color: var(--muted);
}
.times .value {
    color: var(--iob-text, currentColor);
    font-weight: 600;
    text-align: right;
}
.details {
    flex: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    grid-auto-rows: 40px;
    gap: 8px;
    overflow: hidden;
}
.box {
    min-width: 0;
    height: 40px;
    padding: 4px 10px;
    border-radius: calc(var(--iob-border-radius, 4px) * 2.5);
    background: var(--tint);
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}
.box.wide {
    grid-column: 1 / -1;
}
.box-label {
    font-size: 11px;
    line-height: 1.3;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.box-value {
    font-size: 14px;
    line-height: 1.3;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.history {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.history-head {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 3px;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    border-bottom: 1px solid var(--frame);
}
.history-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}
.history-empty {
    padding: 6px 0;
    font-size: 12px;
    color: var(--muted);
}
.event {
    height: 28px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
}
.event-label {
    flex: 0 1 auto;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.event-duration {
    flex: 0 1 auto;
    font-size: 12px;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.event-time {
    flex: none;
    margin-left: auto;
    font-size: 12px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
}
/* the detail boxes the height has room for, the history below them only in a tall box */
@container (max-height: 179px) {
    .details {
        max-height: 40px;
    }
}
@container (min-height: 180px) and (max-height: 229px) {
    .details {
        max-height: 88px;
    }
}
@container (max-height: 229px) {
    .history {
        display: none;
    }
}
/* wide and flat: picture left, name and status right of it, the times right of them */
@container (min-width: 200px) and (max-height: 109px) {
    .person {
        --avatar: clamp(28px, calc(100cqh - 16px), 72px);
        justify-content: center;
        padding: 6px 10px;
    }
    .details {
        display: none;
    }
}
@container (min-width: 300px) and (max-height: 109px) {
    .times {
        display: grid;
    }
}
/* narrow: picture, name and status below each other, centered */
@container (max-width: 199px) {
    .person {
        --avatar: clamp(28px, min(55cqw, calc(100cqh - 76px)), 120px);
        justify-content: center;
        padding: 6px;
    }
    .head {
        flex-direction: column;
        gap: 4px;
        text-align: center;
    }
    .texts {
        width: 100%;
        align-items: center;
    }
    .status,
    .duration {
        max-width: 100%;
    }
    .details,
    .history,
    .times {
        display: none;
    }
}
@container (max-width: 199px) and (max-height: 119px) {
    .person {
        --avatar: clamp(24px, calc(100cqh - 56px), 120px);
    }
    .duration {
        display: none;
    }
}
`;

/** The comings and goings of a person in a dialog of the host */
export const PERSON_DIALOG_STYLES = `${COMMON}${DIALOG_BASE}${PERSON}
.dialog {
    min-width: min(360px, 80vw);
}
.dlg-status {
    --avatar: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}
.dlg-status .texts {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.dlg-status .duration {
    font-size: 0.85em;
    color: var(--muted);
}
.today {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.85em;
}
.today-text {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--muted);
}
.value {
    font-weight: 600;
    color: var(--iob-text, currentColor);
}
.bar {
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    background: var(--frame);
}
.bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--present);
}
.info-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 0.85em;
    color: var(--muted);
}
.info-line .text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.info-line svg,
.dlg-title svg {
    flex: none;
    width: 1.25em;
    height: 1.25em;
    fill: currentColor;
}
.dlg-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-weight: 700;
}
.refresh {
    margin-left: auto;
    width: 32px;
    height: 32px;
    padding: 6px;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--muted);
    cursor: pointer;
}
.refresh:hover:not(:disabled) {
    background: var(--hover);
}
.refresh:disabled {
    opacity: 0.4;
    cursor: default;
}
.dlg-title .refresh svg {
    width: 20px;
    height: 20px;
}
.days.loading {
    opacity: 0.6;
}
.day {
    margin-bottom: 10px;
}
.day-label {
    padding: 4px 0;
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--frame);
}
.dlg-event {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    min-width: 0;
}
.dlg-event .icon {
    flex: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ev);
    background: color-mix(in srgb, var(--ev) 14%, transparent);
}
.dlg-event.present {
    --ev: var(--present);
}
.dlg-event.absent {
    --ev: var(--muted);
}
.dlg-event .icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
}
.ev-main {
    flex: 1;
    min-width: 0;
}
.ev-label {
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.ev-sub {
    font-size: 0.8em;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.ev-sub.ongoing {
    font-style: italic;
}
.ev-time {
    flex: none;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}
.empty {
    padding: 16px 0;
    text-align: center;
    color: var(--muted);
}
.source {
    text-align: right;
    font-size: 0.75em;
    color: var(--faint);
}
`;

/** `<iob-teltonika-presence>`: the summary line and one row per person */
export const PRESENCE_STYLES = `${COMMON}${BASE}${PERSON}
.presence {
    height: 100%;
    padding: clamp(6px, 3cqmin, 12px);
    display: flex;
    flex-direction: column;
    min-height: 0;
}
.summary-line {
    flex: none;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.rows {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}
.empty {
    padding: 8px 0;
    font-size: 13px;
    color: var(--muted);
}
.row {
    --avatar: 32px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    min-width: 0;
}
.row .disc {
    border: none;
}
.row-texts {
    flex: 1 1 auto;
    min-width: 0;
}
.row-name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.row-info {
    font-size: 12px;
    line-height: 1.35;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.row-time {
    flex: none;
    font-size: 12px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
}
@container (max-width: 220px) {
    .row-time {
        display: none;
    }
}
@container (max-width: 160px) {
    .row {
        --avatar: 24px;
        gap: 6px;
    }
}
`;
