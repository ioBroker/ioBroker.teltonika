// Teltonika devices overview — every router and switch of one instance as a tile.
//
// The tile itself carries a compact strip of the port states, because that is the thing worth seeing without
// opening anything. Clicking opens a dialog with the full front panel per device plus what the device kind
// makes available: mobile operator, signal, connection type, WAN addresses and I/O for a router, throughput per
// port for a switch.
//
// Devices are discovered from the object tree rather than the instance configuration: MQTT routers announce
// themselves and SNMP devices appear on their first poll, so the configuration knows only part of them.

import WidgetGeneric, {
    React,
    MuiMaterial,
    getTileStyles,
    isNeumorphicTheme,
    type WidgetGenericProps,
    type WidgetGenericState,
    type CustomWidgetPlugin,
    AdapterReact,
} from '@iobroker/dm-widgets';
import type {
    BoxProps,
    TypographyProps,
    DialogProps,
    DialogContentProps,
    DialogTitleProps,
    IconButtonProps,
} from '@mui/material';
import type { ConfigItemPanel, ConfigItemTabs } from '@iobroker/dm-utils';
import type { I18n as I18nType } from '@iobroker/gui-components';

import DeviceDetail from './DeviceDetail';
import { DevicesSummary, sortDevices } from './DeviceTile';
import { applyState, readInstance, type DeviceInfo, type PortInfo } from './utils';

const I18n = AdapterReact.I18n as typeof I18nType;

const Box: React.ComponentType<BoxProps> = MuiMaterial?.Box;
const Typography: React.ComponentType<TypographyProps> = MuiMaterial?.Typography;
const Dialog: React.ComponentType<DialogProps> = MuiMaterial?.Dialog;
const DialogTitle: React.ComponentType<DialogTitleProps> = MuiMaterial?.DialogTitle;
const DialogContent: React.ComponentType<DialogContentProps> = MuiMaterial?.DialogContent;
const IconButton: React.ComponentType<IconButtonProps> = MuiMaterial?.IconButton;

const COLORS = {
    dialogBg: '#11161b',
} as const;

interface Settings extends CustomWidgetPlugin {
    instance?: string;
    /** Hide devices that are currently not reachable */
    onlyAlive?: boolean;
}

interface State extends WidgetGenericState {
    devices: Map<string, DeviceInfo>;
    dialogOpen: boolean;
    revision: number;
}

export class TeltonikaDevicesComponent extends WidgetGeneric<State, Settings> {
    private subscribed = new Map<string, (id: string, state: ioBroker.State | null | undefined) => void>();
    /** state id -> device channel id, filled during discovery so a change needs no parsing of the tree */
    private owners = new Map<string, string>();
    /**
     * The same device objects that sit in the state, held separately because `getState` delivers the current
     * value synchronously while subscribing — before `setState` has run. Reading `this.state` in the handler
     * would silently drop every initial value.
     */
    private devices = new Map<string, DeviceInfo>();

    constructor(props: WidgetGenericProps<Settings>) {
        super(props);
        this.state = { ...this.state, devices: new Map(), dialogOpen: false, revision: 0 };
    }

    static override getConfigSchema(): { name: string; schema: ConfigItemPanel | ConfigItemTabs } {
        return {
            name: 'TeltonikaDevices',
            schema: {
                type: 'panel',
                items: {
                    instance: {
                        type: 'instance',
                        adapter: 'teltonika',
                        label: 'telt_instance',
                        default: 'teltonika.0',
                        sm: 12,
                    },
                    onlyAlive: {
                        type: 'checkbox',
                        label: 'telt_onlyAlive',
                        default: false,
                        sm: 12,
                    },
                },
            },
        };
    }

    componentDidMount(): void {
        super.componentDidMount?.();
        void this.discover();
    }

    componentDidUpdate(prevProps: Readonly<WidgetGenericProps<Settings>>): void {
        super.componentDidUpdate?.(prevProps, this.state);
        if (prevProps.settings.instance !== this.props.settings.instance) {
            this.unsubscribeAll();
            this.setState({ devices: new Map() });
            void this.discover();
        }
    }

    componentWillUnmount(): void {
        super.componentWillUnmount?.();
        this.unsubscribeAll();
    }

    private get instance(): string {
        return this.props.settings.instance || 'teltonika.0';
    }

    private async discover(): Promise<void> {
        const ctx = this.props.stateContext;
        const { devices, stateIds } = await readInstance(ctx.getSocket(), this.instance);
        this.owners = stateIds;
        this.devices = devices;

        for (const stateId of stateIds.keys()) {
            if (this.subscribed.has(stateId)) {
                continue;
            }
            const handler = (id: string, state: ioBroker.State | null | undefined): void => {
                const deviceId = this.owners.get(id);
                if (!deviceId || !state) {
                    return;
                }
                const device = this.devices.get(deviceId);
                if (!device) {
                    return;
                }
                // The device objects are mutated in place and a counter drives the re-render: copying a map of
                // devices, each with its own array of ports, on every incoming value would churn hard on a
                // switch that reports four counters per port.
                if (applyState(device, id.slice(deviceId.length + 1), state.val)) {
                    this.setState(prev => ({ revision: prev.revision + 1 }));
                }
            };
            ctx.getState(stateId, handler);
            this.subscribed.set(stateId, handler);
        }

        this.setState({ devices });
    }

    private unsubscribeAll(): void {
        const ctx = this.props.stateContext;
        for (const [id, handler] of this.subscribed) {
            ctx.removeState(id, handler);
        }
        this.subscribed.clear();
        this.owners.clear();
        this.devices = new Map();
    }

    private togglePort(device: DeviceInfo, port: PortInfo): void {
        if (!port.switchable) {
            return;
        }
        void this.props.stateContext
            .getSocket()
            .setState(`${device.id}.ports.${port.id}.enabled`, { val: !port.enabled, ack: false });
    }

    private visibleDevices(): DeviceInfo[] {
        const all = [...this.state.devices.values()];
        return sortDevices(this.props.settings.onlyAlive ? all.filter(device => device.alive !== false) : all);
    }

    private renderDialog(): React.JSX.Element | null {
        if (!this.state.dialogOpen) {
            return null;
        }
        const devices = this.visibleDevices();
        return (
            <Dialog
                open
                onClose={() => this.setState({ dialogOpen: false })}
                maxWidth="lg"
                fullWidth
                slotProps={{ paper: { sx: { bgcolor: COLORS.dialogBg, color: '#e6ecf2' } } }}
            >
                <DialogTitle
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, pr: 1 }}
                >
                    <Box
                        component="span"
                        sx={{ fontWeight: 700 }}
                    >
                        {I18n.t('telt_dialog_title')}
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => this.setState({ dialogOpen: false })}
                        aria-label={I18n.t('telt_close')}
                        sx={{ color: 'inherit' }}
                    >
                        {/* A plain glyph rather than MuiIcons.Close, so the widget does not depend on a
                            particular icon being part of the host's MUI bridge */}
                        <Box
                            component="span"
                            sx={{ fontSize: 20, lineHeight: 1, fontWeight: 600 }}
                        >
                            ×
                        </Box>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 3 }}>
                    {devices.length ? (
                        devices.map(device => (
                            <DeviceDetail
                                key={device.id}
                                device={device}
                                onToggle={port => this.togglePort(device, port)}
                            />
                        ))
                    ) : (
                        <Typography sx={{ opacity: 0.7, p: 2 }}>{I18n.t('telt_empty')}</Typography>
                    )}
                </DialogContent>
            </Dialog>
        );
    }

    protected isTileActive(): boolean {
        for (const device of this.state.devices.values()) {
            if (device.alive === true) {
                return true;
            }
        }
        return false;
    }

    private renderTile(compact: boolean): React.JSX.Element {
        const isActive = this.isTileActive();
        const accent = this.getAccentColor();
        const indicators = this.renderIndicators(this.renderSettingsButton());
        return (
            <Box
                id={String(this.props.widget.id)}
                className={this.getWidgetClass()}
                sx={theme => (compact ? WidgetGeneric.getStyleCompact(theme) : WidgetGeneric.getStyleWideTall(theme))}
            >
                <Box
                    onClick={() => this.setState({ dialogOpen: true })}
                    sx={theme => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        aspectRatio: compact ? '1' : '2',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        ...(getTileStyles(theme, isActive, accent) as any),
                        padding: isNeumorphicTheme(theme) ? '4px' : '6px',
                    })}
                >
                    <div
                        onClick={event => event.stopPropagation()}
                        style={{ display: 'contents' }}
                    >
                        {indicators}
                    </div>
                    <DevicesSummary
                        devices={this.visibleDevices()}
                        compact={compact}
                    />
                </Box>
            </Box>
        );
    }

    renderCompact(): React.JSX.Element {
        return this.renderTile(true);
    }

    renderWideTall(): React.JSX.Element {
        return this.renderTile(false);
    }

    render(): React.JSX.Element {
        const widget = super.render();
        const dialog = this.renderDialog();
        return dialog ? (
            <>
                {widget}
                {dialog}
            </>
        ) : (
            widget
        );
    }
}

export default TeltonikaDevicesComponent;
