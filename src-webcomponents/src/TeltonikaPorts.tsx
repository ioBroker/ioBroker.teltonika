/**
 * The front panel of one Teltonika device as a web component: `<iob-teltonika-ports>` - the web component of the
 * vis-2 widget "Teltonika ports" (`src-widgets/src/TeltonikaPorts.tsx`) and of the devices widget of the same name
 * (`src-devices/src/TeltonikaPortsComponent.tsx`).
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`teltonika-ports.json`, written by the build from `manifest.ts`), so a host loads this module only when
 * it shows the element. The host sets `socket` and `settings`, and if it has them `theme`, `editMode` and
 * `dialogs`.
 *
 * The setting `device` is the channel of the device (or a state below it); the instance comes from it. Without a
 * device the element shows the first device of the instance that has ports, as the native widgets do.
 *
 * - `panel`: name, one RJ45 symbol per port and the links up; a click shows the details of the device
 * - `detail`: the details of the device right inside the element
 *
 * Ports and PoE are switched only if the settings allow it; a click on a switchable socket switches it.
 *
 * React is not in the module: it comes from `lib/esm/react-19.js` beside `adapter/`, see `vite.config.ts`.
 */
import type { CSSProperties } from 'react';

import { defineWebComponent } from '@iobroker/web-components/element';

import { PORTS_CLICK_EVENT, PORTS_TAG, type PortsSettings } from './constants';
import { DeviceElement } from './DeviceElement';
import { DeviceDetail, linksText, panelColumns, PortPanel } from './DeviceViews';
import {
    instanceOfId,
    toDeviceChannel,
    toInstance,
    type DeviceDetailLevel,
    type DeviceInfo,
    type InstanceDevices,
} from './devices';
import { Hint } from './Hint';
import { PORTS_STYLES } from './styles';

class TeltonikaPortsElement extends DeviceElement<PortsSettings> {
    constructor() {
        super(PORTS_STYLES);
    }

    protected override getInstance(settings: PortsSettings): string | null {
        if (settings.device?.trim()) {
            return instanceOfId(toDeviceChannel(settings.device));
        }
        return toInstance(settings.instance);
    }

    /** The device of the setting, or the first one that has ports */
    protected override getShownDevices(settings: PortsSettings, found: InstanceDevices): string[] {
        const channel = toDeviceChannel(settings.device);
        if (settings.device?.trim()) {
            return channel && found.devices.has(channel) ? [channel] : [];
        }
        const first = [...found.devices.values()].find(device => device.ports.length);
        return first ? [first.id] : [];
    }

    protected override getLevel(settings: PortsSettings): DeviceDetailLevel {
        return settings.mode === 'detail' ? 'all' : 'panel';
    }

    /** The device with its values, null if there is none */
    #getDevice(): DeviceInfo | null {
        const found = this.getFound(this.settings);
        return found ? this.getDevices(this.getShownDevices(this.settings, found))[0] || null : null;
    }

    #onOpen = (): void => {
        const device = this.#getDevice();
        if (this.editMode || !device || !this.emit(PORTS_CLICK_EVENT, { device: device.id })) {
            return;
        }
        void this.openDetails(device.name, () => {
            const current = this.#getDevice();
            return current ? (
                <DeviceDetail
                    device={current}
                    word={this.word}
                    actions={this.getActions(this.settings.allowSwitching)}
                />
            ) : null;
        });
    };

    #onKeyDown = (e: { key: string; preventDefault: () => void }): void => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.#onOpen();
        }
    };

    protected override draw(): void {
        const settings = this.settings;
        const word = this.word;
        const editMode = this.editMode;

        if (!this.getInstance(settings)) {
            this.root.render(
                <Hint
                    text={word(settings.device?.trim() ? 'wc_not_device' : 'wc_choose_instance')}
                    icon="router"
                    editMode={editMode}
                />,
            );
            return;
        }
        if (!this.getFound(settings)) {
            // the devices are read
            this.root.render(<div className="root" />);
            return;
        }

        const device = this.#getDevice();
        if (!device) {
            this.root.render(
                <Hint
                    text={word(settings.device?.trim() ? 'wc_not_device' : 'no_device')}
                    icon="router"
                    editMode={editMode}
                />,
            );
            return;
        }

        const actions = this.getActions(settings.allowSwitching);
        if (settings.mode === 'detail') {
            this.root.render(
                <div className={`root${editMode ? ' edit' : ''}`}>
                    <div className="list">
                        <DeviceDetail
                            device={device}
                            word={word}
                            actions={actions}
                        />
                    </div>
                </div>,
            );
            return;
        }

        const { cols, groups } = panelColumns(device.ports);
        const clickable = !editMode;
        this.root.render(
            <div className={`root${editMode ? ' edit' : ''}`}>
                <div
                    className={`front${device.alive === false ? ' offline' : ''}${clickable ? ' clickable' : ''}`}
                    style={{ '--cols': Math.max(cols, 1), '--groups': Math.max(groups, 1) } as CSSProperties}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={clickable ? this.#onOpen : undefined}
                    onKeyDown={clickable ? this.#onKeyDown : undefined}
                >
                    <div className="front-name">{device.name}</div>
                    {device.ports.length ? (
                        <PortPanel
                            device={device}
                            word={word}
                            onToggle={actions.onToggle}
                        />
                    ) : (
                        <div className="front-links">{word('telt_no_ports')}</div>
                    )}
                    {device.ports.length ? <div className="front-links">{linksText(device.ports, word)}</div> : null}
                </div>
            </div>,
        );
    }
}

defineWebComponent(PORTS_TAG, TeltonikaPortsElement);
