/**
 * What `<iob-teltonika-devices>` and `<iob-teltonika-ports>` share: the devices of an instance, discovered once per
 * instance and socket, the subscription of the states the view shows, switching ports and PoE, and the details in
 * a dialog of the host.
 *
 * The states depend on what the discovery finds, so the element asks the base class to subscribe again once it is
 * there - and again while a dialog is open, which shows every value of a device.
 */
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { WebComponentSettings, WebComponentSocket } from '@iobroker/web-components';
import { getThemeCssVariables, IobWebComponent } from '@iobroker/web-components/element';

import type { DeviceActions } from './DeviceViews';
import {
    discoverDevices,
    getDeviceStateIds,
    withValues,
    type DeviceDetailLevel,
    type DeviceInfo,
    type InstanceDevices,
} from './devices';
import { DEVICE_DIALOG_STYLES } from './styles';
import { getWord, type Word } from './words';

/** The width the details ask the host for, in px */
const DIALOG_WIDTH = 900;

export abstract class DeviceElement<TSettings extends WebComponentSettings> extends IobWebComponent<TSettings> {
    protected readonly root: Root;

    /** What the discovery found, for `#foundFor` */
    #found: InstanceDevices | null = null;

    /** The instance and the socket of `#found`, or of the discovery under way */
    #foundFor: { instance: string; socket: WebComponentSocket } | null = null;

    /** Draws the open dialog again; null while none is open */
    #drawDialog: (() => void) | null = null;

    protected constructor(styles: string) {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = styles;
        const mount = document.createElement('div');
        mount.className = 'mount';
        shadow.append(style, mount);
        this.root = createRoot(mount);
    }

    /** The instance whose devices the settings show, null if they name none */
    protected abstract getInstance(settings: TSettings): string | null;

    /** The channels of the devices the settings show, of those found */
    protected abstract getShownDevices(settings: TSettings, found: InstanceDevices): string[];

    /** What the view of the settings shows of a device */
    protected abstract getLevel(settings: TSettings): DeviceDetailLevel;

    /** Draw the element */
    protected abstract draw(): void;

    protected override getStateIds(settings: TSettings): string[] {
        const found = this.getFound(settings);
        if (!found) {
            return [];
        }
        // a dialog shows everything of a device
        const level = this.#drawDialog ? 'all' : this.getLevel(settings);
        return getDeviceStateIds(found, this.getShownDevices(settings, found), level);
    }

    protected override render(): void {
        this.#discover();
        this.draw();
        this.#drawDialog?.();
    }

    /** The words in the language of the system */
    protected get word(): Word {
        return getWord(this.systemLang);
    }

    /** What the discovery found for the instance of the settings; null while it is under way or without instance */
    protected getFound(settings: TSettings): InstanceDevices | null {
        const instance = this.getInstance(settings);
        const found = this.#found;
        return found && instance && found.instance === instance && this.#foundFor?.socket === this.socket
            ? found
            : null;
    }

    /**
     * The devices with their values
     *
     * @param ids the channels of the devices
     */
    protected getDevices(ids: string[]): DeviceInfo[] {
        const found = this.getFound(this.settings);
        return found ? withValues(found, ids, this.states) : [];
    }

    /** Ask the base class for the states again: setting the same settings is what makes it ask */
    protected resubscribe(): void {
        // eslint-disable-next-line no-self-assign
        this.settings = this.settings;
    }

    /**
     * Switching ports and PoE - nothing in edit mode or if the settings do not allow it
     *
     * @param allowed the setting `allowSwitching`
     */
    protected getActions(allowed: boolean | undefined): DeviceActions {
        if (!allowed || this.editMode) {
            return {};
        }
        return {
            onToggle: (device, port) => {
                if (port.switchable) {
                    void this.setState(`${device.id}.ports.${port.id}.enabled`, !port.enabled);
                }
            },
            onTogglePoe: (device, port) => {
                if (port.poeSwitchable) {
                    void this.setState(`${device.id}.ports.${port.id}.poe`, !port.poe);
                }
            },
        };
    }

    /** Read the devices of the instance once - again only when the instance or the socket changes */
    #discover(): void {
        const socket = this.socket;
        const instance = socket ? this.getInstance(this.settings) : null;
        if (!socket || !instance) {
            return;
        }
        if (this.#foundFor?.instance === instance && this.#foundFor.socket === socket) {
            return;
        }
        const wanted = { instance, socket };
        this.#foundFor = wanted;
        this.#found = null;
        discoverDevices(socket, instance)
            .catch((error: unknown): InstanceDevices => {
                console.warn(`<${this.localName}>: cannot read the devices of ${instance}: ${String(error)}`);
                return { instance, devices: new Map(), owners: new Map() };
            })
            .then(found => {
                if (this.#foundFor === wanted) {
                    this.#found = found;
                    // draws again once subscribed
                    this.resubscribe();
                }
            })
            .catch(() => undefined);
    }

    /**
     * Show the details in an element dialog of the host. They are drawn again with the element, so they follow the
     * states; while the dialog is open, every state of the devices is subscribed.
     *
     * @param title the title of the dialog
     * @param content what to draw, asked again on every drawing
     */
    protected async openDetails(title: string, content: () => ReactNode): Promise<void> {
        if (this.editMode || this.#drawDialog) {
            return;
        }
        const element = document.createElement('div');
        const shadow = element.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = DEVICE_DIALOG_STYLES;
        const mount = document.createElement('div');
        shadow.append(style, mount);
        const dialogRoot = createRoot(mount);
        this.#drawDialog = () => {
            // the host moves the content into its dialog, out of this element: it takes the theme along
            for (const [name, value] of Object.entries(getThemeCssVariables(this.theme))) {
                element.style.setProperty(name, value);
            }
            dialogRoot.render(<div className="dialog">{content()}</div>);
        };
        this.#drawDialog();
        this.resubscribe();
        try {
            await this.openDialog({ title, element, width: DIALOG_WIDTH });
        } finally {
            this.#drawDialog = null;
            dialogRoot.unmount();
            this.resubscribe();
        }
    }
}
