/**
 * Every Teltonika device of one instance as a web component: `<iob-teltonika-devices>` - the web component of the
 * vis-2 widget "Teltonika devices" (`src-widgets/src/TeltonikaDevices.tsx`) and of the devices widget of the same
 * name (`src-devices/src/TeltonikaDevicesComponent.tsx`).
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`teltonika-devices.json`, written by the build from `manifest.ts`), so a host loads this module only
 * when it shows the element. The host sets `socket` and `settings`, and if it has them `theme`, `editMode` and
 * `dialogs`.
 *
 * Three ways to show the devices, as in the vis-2 widget:
 * - `summary`: devices online / total, links up, the port strips; a click shows the details of all devices
 * - `tiles`: one tile per device; a click shows the details
 * - `detail`: the details of every device right inside the element
 *
 * The details are an element dialog of the host. Ports and PoE are switched there only if the settings allow it.
 *
 * React is not in the module: it comes from `lib/esm/react-19.js` beside `adapter/`, see `vite.config.ts`.
 */
import type { JSX } from 'react';

import { defineWebComponent } from '@iobroker/web-components/element';

import { DEVICES_CLICK_EVENT, DEVICES_TAG, type DevicesSettings } from './constants';
import { DeviceElement } from './DeviceElement';
import { DeviceDetail, DevicesSummary, DeviceTile, type DeviceActions } from './DeviceViews';
import { sortDevices, toInstance, type DeviceDetailLevel, type DeviceInfo, type InstanceDevices } from './devices';
import { Hint } from './Hint';
import { DEVICES_STYLES } from './styles';
import type { Word } from './words';

function DetailList({
    devices,
    word,
    actions,
}: {
    devices: DeviceInfo[];
    word: Word;
    actions: DeviceActions;
}): JSX.Element {
    if (!devices.length) {
        return <div className="empty">{word('telt_empty')}</div>;
    }
    return (
        <>
            {devices.map(device => (
                <DeviceDetail
                    key={device.id}
                    device={device}
                    word={word}
                    actions={actions}
                />
            ))}
        </>
    );
}

class TeltonikaDevicesElement extends DeviceElement<DevicesSettings> {
    constructor() {
        super(DEVICES_STYLES);
    }

    protected override getInstance(settings: DevicesSettings): string | null {
        return toInstance(settings.instance);
    }

    /** All of them: which ones answer is known only from their values */
    protected override getShownDevices(_settings: DevicesSettings, found: InstanceDevices): string[] {
        return [...found.devices.keys()];
    }

    protected override getLevel(settings: DevicesSettings): DeviceDetailLevel {
        switch (settings.mode) {
            case 'tiles':
                return 'tile';
            case 'detail':
                return 'all';
            default:
                return 'summary';
        }
    }

    /** The devices to show, with their values - unreachable first */
    #getVisible(): DeviceInfo[] {
        const found = this.getFound(this.settings);
        if (!found) {
            return [];
        }
        const devices = sortDevices(this.getDevices(this.getShownDevices(this.settings, found)));
        return this.settings.onlyAlive ? devices.filter(device => device.alive !== false) : devices;
    }

    #onOpen = (): void => {
        if (this.editMode || !this.emit(DEVICES_CLICK_EVENT, { instance: this.getInstance(this.settings) })) {
            return;
        }
        const word = this.word;
        void this.openDetails(word('telt_dialog_title'), () => (
            <DetailList
                devices={this.#getVisible()}
                word={this.word}
                actions={this.getActions(this.settings.allowSwitching)}
            />
        ));
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
                    text={word('wc_choose_instance')}
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

        const devices = this.#getVisible();
        const clickable = !editMode;
        const click = clickable
            ? { role: 'button', tabIndex: 0, onClick: this.#onOpen, onKeyDown: this.#onKeyDown }
            : {};
        let content: JSX.Element;
        switch (settings.mode) {
            case 'tiles':
                content = devices.length ? (
                    <div
                        className={`tiles${clickable ? ' clickable' : ''}`}
                        {...click}
                    >
                        {devices.map(device => (
                            <DeviceTile
                                key={device.id}
                                device={device}
                                word={word}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty">{word('telt_empty')}</div>
                );
                break;
            case 'detail':
                content = (
                    <div className="list">
                        <DetailList
                            devices={devices}
                            word={word}
                            actions={this.getActions(settings.allowSwitching)}
                        />
                    </div>
                );
                break;
            default:
                content = (
                    <div
                        className={`summary${clickable ? ' clickable' : ''}`}
                        {...click}
                    >
                        <DevicesSummary
                            devices={devices}
                            word={word}
                        />
                    </div>
                );
                break;
        }
        this.root.render(<div className={`root${editMode ? ' edit' : ''}`}>{content}</div>);
    }
}

defineWebComponent(DEVICES_TAG, TeltonikaDevicesElement);
