/**
 * The views of a device: the port strip, the front panel, the tile, the summary of all devices and the details.
 *
 * Plain React and the CSS of `styles.ts` - the same views as `src-devices/src/DeviceTile.tsx`, `PortPanel.tsx` and
 * `DeviceDetail.tsx`, which need MUI. The colors come from the theme of the host (`--iob-*`), so they look right
 * on a light and on a dark page.
 */
import type { CSSProperties, JSX, KeyboardEvent } from 'react';

import {
    formatBytes,
    formatUptime,
    speedLabel,
    splitRows,
    type DeviceInfo,
    type PortInfo,
    type WanInfo,
} from './devices';
import type { Word } from './words';

/** What the views do on a click; missing: display only (edit mode, switching not allowed) */
export interface DeviceActions {
    /** Switch a port on or off - only ports the adapter may switch call it */
    onToggle?: (device: DeviceInfo, port: PortInfo) => void;
    /** Switch the PoE output of a port - only ports with a writable PoE state call it */
    onTogglePoe?: (device: DeviceInfo, port: PortInfo) => void;
}

function stateClass(alive: boolean | null): string {
    return alive === null ? 'unknown' : alive ? 'online' : 'offline';
}

function portClass(port: PortInfo): string {
    if (port.enabled === false) {
        return 'disabled';
    }
    return port.link ? 'up' : 'idle';
}

/** Enter and space act like a click - on this part only, not on the element around it */
function onKey(action: () => void): (e: KeyboardEvent) => void {
    return e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            action();
        }
    };
}

/** A single row of small bars, one per port - enough to see at tile size which links are up */
export function PortStrip({ device }: { device: DeviceInfo }): JSX.Element | null {
    if (!device.ports.length) {
        return null;
    }
    return (
        <span className="strip">
            {device.ports.map(port => (
                <span
                    key={port.id}
                    className={portClass(port)}
                    title={port.description ? `${port.label} · ${port.description}` : port.label}
                />
            ))}
        </span>
    );
}

/** The columns of the front panel: two rows of ports per group, copper and fibre side by side */
export function panelColumns(ports: PortInfo[]): { cols: number; groups: number } {
    const copper = ports.filter(port => !port.fibre).length;
    const fibre = ports.length - copper;
    return {
        cols: Math.ceil(copper / 2) + Math.ceil(fibre / 2),
        groups: (copper ? 1 : 0) + (fibre ? 1 : 0),
    };
}

/**
 * An RJ45 socket. The latch points away from the numbers, so the upper row reads as plugs going down and the lower
 * row as plugs going up, as the sockets face on the hardware
 */
function Rj45(): JSX.Element {
    return (
        <svg
            viewBox="0 0 24 20"
            aria-hidden="true"
        >
            <path d="M2 1 H22 V13 H15.5 V19 H8.5 V13 H2 Z" />
        </svg>
    );
}

function PortCell({
    device,
    port,
    flipped,
    word,
    onToggle,
}: {
    device: DeviceInfo;
    port: PortInfo;
    flipped: boolean;
    word: Word;
    onToggle?: DeviceActions['onToggle'];
}): JSX.Element {
    const speed = speedLabel(port.speed, port.link);
    const clickable = !!onToggle && port.switchable;
    const status = port.enabled === false ? word('telt_disabled') : port.link ? word('telt_up') : word('telt_nolink');
    const lines = [`${port.label}${port.description ? ` · ${port.description}` : ''} - ${status}`];
    if (speed) {
        lines.push(`${speed}${port.duplex ? ` · ${word('wc_full_duplex')}` : ''}`);
    }
    if (port.link && (port.rxBytes !== null || port.txBytes !== null)) {
        lines.push(`↓ ${formatBytes(port.rxBytes) ?? '-'}   ↑ ${formatBytes(port.txBytes) ?? '-'}`);
    }
    if (port.poe !== null) {
        lines.push(
            `${port.poe ? word('telt_poe_on') : word('telt_poe_off')}${port.poe && port.poePower ? ` · ${port.poePower} W` : ''}`,
        );
    }
    if (clickable) {
        lines.push(word('wc_click_to_switch'));
    }
    const toggle = (): void => onToggle?.(device, port);

    const badge = (
        <span className="badge">
            {port.poe ? <span className={`bolt${port.poeActive === false ? ' idle' : ''}`}>⚡</span> : null}
            {speed ? <span className="speed">{speed}</span> : null}
        </span>
    );

    return (
        <span
            className={`cell ${portClass(port)}${flipped ? ' flipped' : ''}${clickable ? ' switchable' : ''}`}
            title={lines.join('\n')}
            role={clickable ? 'switch' : undefined}
            aria-checked={clickable ? port.enabled !== false : undefined}
            aria-label={clickable ? port.label : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={
                clickable
                    ? e => {
                          // a click on a socket switches it and does not open the details
                          e.stopPropagation();
                          toggle();
                      }
                    : undefined
            }
            onKeyDown={clickable ? onKey(toggle) : undefined}
        >
            {flipped ? null : badge}
            <Rj45 />
            {flipped ? badge : null}
        </span>
    );
}

/** One group with its frame and caption: the copper ports or the fibre cages */
function PortGroup({
    device,
    ports,
    caption,
    word,
    onToggle,
}: {
    device: DeviceInfo;
    ports: PortInfo[];
    caption: string;
    word: Word;
    onToggle?: DeviceActions['onToggle'];
}): JSX.Element | null {
    if (!ports.length) {
        return null;
    }
    const { top, bottom } = splitRows(ports);
    const numbers = (row: PortInfo[]): JSX.Element => (
        <span className="row">
            {row.map(port => (
                <span
                    key={port.id}
                    className="num"
                >
                    {port.label}
                </span>
            ))}
        </span>
    );
    const cells = (row: PortInfo[], flipped: boolean): JSX.Element => (
        <span className="row">
            {row.map(port => (
                <PortCell
                    key={port.id}
                    device={device}
                    port={port}
                    flipped={flipped}
                    word={word}
                    onToggle={onToggle}
                />
            ))}
        </span>
    );

    return (
        <span className="group">
            {numbers(top)}
            {cells(top, false)}
            {bottom.length ? cells(bottom, true) : null}
            {bottom.length ? numbers(bottom) : null}
            <span className="caption">{caption}</span>
        </span>
    );
}

/**
 * The front panel: one RJ45 symbol per port, laid out the way the numbers are printed on the device - odd ports
 * on the upper row, even below, fibre ports in their own group on the right. The size of a socket is `--s`.
 */
export function PortPanel({
    device,
    word,
    onToggle,
}: {
    device: DeviceInfo;
    word: Word;
    onToggle?: DeviceActions['onToggle'];
}): JSX.Element {
    return (
        <span className="panel">
            <PortGroup
                device={device}
                ports={device.ports.filter(port => !port.fibre)}
                caption={word('telt_ethernet')}
                word={word}
                onToggle={onToggle}
            />
            <PortGroup
                device={device}
                ports={device.ports.filter(port => port.fibre)}
                caption={word('telt_fibre')}
                word={word}
                onToggle={onToggle}
            />
        </span>
    );
}

/** `2/8 links up` */
export function linksText(ports: PortInfo[], word: Word): string {
    return `${ports.filter(port => port.link).length}/${ports.length} ${word('telt_links')}`;
}

/** mwan3 statuses, in the wording the device uses; anything unknown is drawn neutral rather than guessed at */
function wanClass(status: string | null): string {
    return status === 'online' || status === 'standby' || status === 'offline' ? status : 'unknown';
}

/** The tile of one device: name, model, mobile values, port strip, WAN interfaces, addresses */
export function DeviceTile({ device, word }: { device: DeviceInfo; word: Word }): JSX.Element {
    const details: string[] = [];
    if (device.uptime !== null) {
        details.push(`${word('telt_uptime')} ${formatUptime(device.uptime)}`);
    }
    if (device.temperature !== null) {
        details.push(`${device.temperature} °C`);
    }
    if (device.cpu !== null) {
        details.push(`CPU ${Math.round(device.cpu)} %`);
    }
    // labelled: a router shows two addresses on the one line, which could not be told apart otherwise
    const addresses = [
        device.lan ? `${word('telt_lan')} ${device.lan}` : null,
        device.wan ? `${word('telt_wan')} ${device.wan}` : null,
    ]
        .filter(Boolean)
        .join(' · ');
    const mobile = device.isRouter
        ? [device.operator, device.connection, device.signal !== null ? `${device.signal} dBm` : null]
              .filter(Boolean)
              .join(' · ')
        : '';

    return (
        <div className={`card ${stateClass(device.alive)}`}>
            <div className="card-head">
                <span className="card-name">{device.name}</span>
                <span className="muted nowrap">
                    {device.model || (device.isRouter ? word('telt_router') : word('telt_switch'))}
                </span>
            </div>
            {mobile ? <div className="small muted ellipsis">{mobile}</div> : null}
            {device.ports.length ? (
                <div className="line">
                    <PortStrip device={device} />
                    <span className="small muted nowrap">{linksText(device.ports, word)}</span>
                </div>
            ) : null}
            {device.wanInterfaces.length ? (
                <div className="line wrap">
                    {device.wanInterfaces.map(wan => (
                        <span
                            key={wan.id}
                            className={`wan-chip small${wan.enabled === false ? ' off' : ''}`}
                            title={`${wan.label}: ${wan.status || '-'}`}
                        >
                            <span className={`dot ${wanClass(wan.status)}`} />
                            <span className="muted">{wan.label}</span>
                        </span>
                    ))}
                </div>
            ) : null}
            {addresses ? <div className="small muted mono ellipsis">{addresses}</div> : null}
            {details.length ? <div className="small faint">{details.join(' · ')}</div> : null}
        </div>
    );
}

/** All devices at a glance: how many answer, how many links are up, the port strips of the first four */
export function DevicesSummary({ devices, word }: { devices: DeviceInfo[]; word: Word }): JSX.Element {
    const online = devices.filter(device => device.alive === true).length;
    const ports = devices.flatMap(device => device.ports);

    return (
        <>
            <span className="count">
                <span className="online">{online}</span>
                <span className="slash">/</span>
                <span>{devices.length}</span>
            </span>
            <span className="count-label">{word('telt_devices')}</span>
            {ports.length ? <span className="count-links">{linksText(ports, word)}</span> : null}
            {devices.length ? (
                <span className="strips">
                    {devices.slice(0, 4).map(device => (
                        <PortStrip
                            key={device.id}
                            device={device}
                        />
                    ))}
                </span>
            ) : null}
        </>
    );
}

/**
 * One port of the PoE list. The switch is drawn only where the port may be switched from here; otherwise the bolt
 * shows the state, so a control that would be refused is never offered.
 */
function PoeRow({
    device,
    port,
    word,
    onTogglePoe,
}: {
    device: DeviceInfo;
    port: PortInfo;
    word: Word;
    onTogglePoe?: DeviceActions['onTogglePoe'];
}): JSX.Element {
    const clickable = !!onTogglePoe && port.poeSwitchable;
    const on = !!port.poe && port.poeActive !== false;
    let state = word('telt_poe_on');
    if (!port.poe) {
        state = word('telt_poe_off');
    } else if (port.poeActive === false) {
        state = word('telt_poe_idle');
    } else if (port.poePower !== null) {
        state = `${port.poePower} W`;
    }

    return (
        <div className="item poe">
            {clickable ? (
                <button
                    type="button"
                    role="switch"
                    className={`toggle${port.poe ? ' checked' : ''}`}
                    aria-checked={!!port.poe}
                    aria-label={`PoE ${port.label}`}
                    onClick={() => onTogglePoe?.(device, port)}
                />
            ) : (
                <span className={`bolt${port.poe ? '' : ' idle'}`}>⚡</span>
            )}
            <span className="strong nowrap">{port.label}</span>
            <span className="muted ellipsis">{port.description || ''}</span>
            <span className={`poe-state nowrap${on ? ' on' : ''}`}>{state}</span>
        </div>
    );
}

function WanRow({ wan, address, word }: { wan: WanInfo; address?: string; word: Word }): JSX.Element {
    const details = [
        address || null,
        wan.uptime ? formatUptime(wan.uptime) : null,
        // named for what it is: mwan3 reports its ping targets here, not the address of the interface
        wan.trackingHosts ? `${word('telt_tracking')} ${wan.trackingHosts}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className={`item wan${wan.enabled === false ? ' off' : ''}`}>
            <span className={`dot ${wanClass(wan.status)}`} />
            <span className="strong wan-label">{wan.label}</span>
            <span className={`wan-status ${wanClass(wan.status)}`}>{wan.status || '-'}</span>
            <span className="muted ellipsis">{details}</span>
        </div>
    );
}

/** Everything of one device: the front panel, PoE, WAN interfaces, inputs and outputs, and what the device reports */
export function DeviceDetail({
    device,
    word,
    actions,
}: {
    device: DeviceInfo;
    word: Word;
    actions: DeviceActions;
}): JSX.Element {
    const poePorts = device.ports.filter(port => port.poe !== null);
    const facts: [string, string][] = [];
    if (device.model) {
        facts.push([word('telt_model'), device.model]);
    }
    if (device.isRouter) {
        if (device.operator) {
            facts.push([word('telt_operator'), device.operator]);
        }
        if (device.connection) {
            facts.push([word('telt_connection'), device.connection]);
        }
        if (device.network) {
            facts.push([word('telt_network'), device.network]);
        }
        if (device.signal !== null) {
            facts.push([word('telt_signal'), `${device.signal} dBm`]);
        }
    }
    // next to the WAN address on a router, and the only address a switch has
    if (device.lan) {
        facts.push([word('telt_lan'), device.lan]);
    }
    if (device.isRouter) {
        if (device.wan) {
            facts.push([word('telt_wan'), device.wan]);
        }
        if (device.wanIPv6) {
            facts.push(['IPv6', device.wanIPv6]);
        }
        if (device.temperature !== null) {
            facts.push([word('telt_temperature'), `${device.temperature} °C`]);
        }
    }
    if (device.uptime !== null) {
        facts.push([word('telt_uptime'), formatUptime(device.uptime) || '']);
    }
    if (device.cpu !== null) {
        facts.push(['CPU', `${Math.round(device.cpu)} %`]);
    }
    const { cols, groups } = panelColumns(device.ports);

    return (
        <div className={`card detail ${stateClass(device.alive)}`}>
            <div className="card-head">
                <span className="card-name">{device.name}</span>
                <span className="muted nowrap">{device.isRouter ? word('telt_router') : word('telt_switch')}</span>
            </div>

            {device.ports.length ? (
                <div
                    className="panel-box"
                    style={{ '--cols': cols, '--groups': groups } as CSSProperties}
                >
                    <PortPanel
                        device={device}
                        word={word}
                        onToggle={actions.onToggle}
                    />
                </div>
            ) : (
                <div className="small muted">{word('telt_no_ports')}</div>
            )}

            {poePorts.length ? (
                <div className="section">
                    <div className="section-title">PoE</div>
                    <div className="poe-grid">
                        {poePorts.map(port => (
                            <PoeRow
                                key={port.id}
                                device={device}
                                port={port}
                                word={word}
                                onTogglePoe={actions.onTogglePoe}
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {device.wanInterfaces.length ? (
                <div className="section">
                    <div className="section-title">{word('telt_wan_interfaces')}</div>
                    {device.wanInterfaces.map(wan => (
                        <WanRow
                            key={wan.id}
                            wan={wan}
                            address={device.addresses[wan.id]}
                            word={word}
                        />
                    ))}
                </div>
            ) : null}

            {device.io.length ? (
                <div className="line wrap">
                    {device.io.map(io => (
                        <span
                            key={io.id}
                            className="item small"
                        >
                            <span className={`dot ${io.state ? 'online' : 'unknown'}`} />
                            {`${io.label}${io.type ? ` · ${io.type}` : ''}`}
                        </span>
                    ))}
                </div>
            ) : null}

            {facts.length ? (
                <div className="facts small">
                    {facts.map(([label, value]) => (
                        <span key={label}>
                            <span className="faint">{`${label}: `}</span>
                            {value}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
