// Front panel of a single device, drawn straight onto the tile.
//
// The overview widget needs a click to reveal the ports; this one is meant to sit on a dashboard permanently,
// which is why it renders the panel itself rather than a summary. Best used as a wide tile — a compact square
// falls back to the port strip, because eight sockets plus their numbers do not stay legible at that size.

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
// `getConfigSchema()` declares its return through dm-utils' copy of these types, so the override signature has
// to use the same source. json-config, which actually renders the schema, has grown fields dm-utils does not
// know yet — `selectSendTo` among them — hence the richer second import to author the literal.
import type { ConfigItemPanel, ConfigItemTabs } from '@iobroker/dm-utils';
import type { ConfigItemPanel as JsonConfigItemPanel } from '@iobroker/json-config';
import type { I18n as I18nType } from '@iobroker/gui-components';

import PortPanel from './PortPanel';
import DeviceDetail from './DeviceDetail';
import { applyState, readInstance, type DeviceInfo, type PortInfo } from './utils';

const I18n = AdapterReact.I18n as typeof I18nType;
const Box: React.ComponentType<BoxProps> = MuiMaterial?.Box;
const Typography: React.ComponentType<TypographyProps> = MuiMaterial?.Typography;
const Dialog: React.ComponentType<DialogProps> = MuiMaterial?.Dialog;
const DialogTitle: React.ComponentType<DialogTitleProps> = MuiMaterial?.DialogTitle;
const DialogContent: React.ComponentType<DialogContentProps> = MuiMaterial?.DialogContent;
const IconButton: React.ComponentType<IconButtonProps> = MuiMaterial?.IconButton;

const COLORS = {
    link: '#3ecf5f',
    idle: '#9aa7b4',
    offline: '#b22d2d',
    dialogBg: '#11161b',
} as const;

interface Settings extends CustomWidgetPlugin {
    instance?: string;
    /** Channel id of the device, e.g. `teltonika.0.6007866821` */
    device?: string;
    /** Allow switching ports from the panel. Only works where a write community is configured. */
    allowSwitching?: boolean;
}

interface State extends WidgetGenericState {
    device: DeviceInfo | null;
    dialogOpen: boolean;
    revision: number;
}

export class TeltonikaPortsComponent extends WidgetGeneric<State, Settings> {
    private subscribed = new Map<string, (id: string, state: ioBroker.State | null | undefined) => void>();
    /**
     * The same object that sits in the state. `getState` hands over the current value while subscribing, before
     * `setState` has run, so a handler reading `this.state.device` would miss every initial value.
     */
    private current: DeviceInfo | null = null;

    constructor(props: WidgetGenericProps<Settings>) {
        super(props);
        this.state = { ...this.state, device: null, dialogOpen: false, revision: 0 };
    }

    static override getConfigSchema(): { name: string; schema: ConfigItemPanel | ConfigItemTabs } {
        const schema: JsonConfigItemPanel = {
            type: 'panel',
            items: {
                instance: {
                    type: 'instance',
                    adapter: 'teltonika',
                    label: 'telt_instance',
                    default: 'teltonika.0',
                    sm: 12,
                },
                device: {
                    // Asks the chosen instance for its devices, see `teltonika:getDevices` in src/main.ts.
                    // The value is the channel id, which is exactly what this widget subscribes below.
                    type: 'selectSendTo',
                    label: 'telt_device',
                    command: 'teltonika:getDevices',
                    // Re-query when the instance changes, so the list matches the selected adapter
                    alsoDependsOn: ['instance'],
                    instance: '${data.instance}',
                    sm: 12,
                },
                allowSwitching: {
                    type: 'checkbox',
                    label: 'telt_allowSwitching',
                    default: false,
                    sm: 12,
                },
            },
        };

        return { name: 'TeltonikaPorts', schema: schema as unknown as ConfigItemPanel };
    }

    componentDidMount(): void {
        super.componentDidMount?.();
        void this.discover();
    }

    componentDidUpdate(prevProps: Readonly<WidgetGenericProps<Settings>>): void {
        super.componentDidUpdate?.(prevProps, this.state);
        if (
            prevProps.settings.instance !== this.props.settings.instance ||
            prevProps.settings.device !== this.props.settings.device
        ) {
            this.unsubscribeAll();
            this.setState({ device: null });
            void this.discover();
        }
    }

    componentWillUnmount(): void {
        super.componentWillUnmount?.();
        this.unsubscribeAll();
    }

    private async discover(): Promise<void> {
        const ctx = this.props.stateContext;
        const instance = this.props.settings.instance || 'teltonika.0';
        const { devices, stateIds } = await readInstance(ctx.getSocket(), instance);

        // Without a configured device take the first one that actually has ports, so a fresh widget shows
        // something instead of an empty frame
        const wanted = this.props.settings.device;
        const device =
            (wanted ? devices.get(wanted) : undefined) || [...devices.values()].find(entry => entry.ports.length);
        if (!device) {
            this.current = null;
            this.setState({ device: null });
            return;
        }
        this.current = device;

        for (const [stateId, owner] of stateIds) {
            if (owner !== device.id || this.subscribed.has(stateId)) {
                continue;
            }
            const handler = (id: string, state: ioBroker.State | null | undefined): void => {
                if (!state || !this.current) {
                    return;
                }
                if (applyState(this.current, id.slice(device.id.length + 1), state.val)) {
                    this.setState(prev => ({ revision: prev.revision + 1 }));
                }
            };
            ctx.getState(stateId, handler);
            this.subscribed.set(stateId, handler);
        }

        this.setState({ device });
    }

    private unsubscribeAll(): void {
        const ctx = this.props.stateContext;
        for (const [id, handler] of this.subscribed) {
            ctx.removeState(id, handler);
        }
        this.subscribed.clear();
        this.current = null;
    }

    private togglePort(port: PortInfo): void {
        const device = this.state.device;
        if (!device || !port.switchable || !this.props.settings.allowSwitching) {
            return;
        }
        void this.props.stateContext
            .getSocket()
            .setState(`${device.id}.ports.${port.id}.enabled`, { val: !port.enabled, ack: false });
    }

    private renderStrip(): React.JSX.Element | null {
        const device = this.state.device;
        if (!device?.ports.length) {
            return null;
        }
        return (
            <Box sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                {device.ports.map(port => (
                    <Box
                        key={port.id}
                        title={port.label}
                        sx={{
                            width: 8,
                            height: 22,
                            borderRadius: '1px',
                            bgcolor:
                                port.enabled === false ? COLORS.offline : port.link ? COLORS.link : COLORS.idle,
                            opacity: port.link ? 1 : 0.45,
                        }}
                    />
                ))}
            </Box>
        );
    }

    private renderBody(compact: boolean): React.JSX.Element {
        const device = this.state.device;
        if (!device) {
            return (
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.7 }}
                >
                    {I18n.t('telt_empty')}
                </Typography>
            );
        }
        const up = device.ports.filter(port => port.link).length;

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                    {device.name}
                </Typography>
                {compact ? (
                    this.renderStrip()
                ) : (
                    // With switching on, a click on a socket must switch it rather than open the dialog, so the
                    // panel keeps the event to itself
                    <div onClick={event => this.props.settings.allowSwitching && event.stopPropagation()}>
                        <PortPanel
                            ports={device.ports}
                            size={28}
                            onToggle={this.props.settings.allowSwitching ? port => this.togglePort(port) : undefined}
                            labels={{
                                ethernet: I18n.t('telt_ethernet'),
                                fibre: I18n.t('telt_fibre'),
                                up: I18n.t('telt_up'),
                                down: I18n.t('telt_nolink'),
                                disabled: I18n.t('telt_disabled'),
                            }}
                        />
                    </div>
                )}
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.65 }}
                >
                    {`${up}/${device.ports.length} ${I18n.t('telt_links')}`}
                </Typography>
            </Box>
        );
    }

    protected isTileActive(): boolean {
        return !!this.state.device?.ports.some(port => port.link);
    }

    /** The same detail the overview shows, restricted to this widget's one device. */
    private renderDialog(): React.JSX.Element | null {
        const device = this.state.device;
        if (!this.state.dialogOpen || !device) {
            return null;
        }
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
                        {device.name}
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
                <DialogContent sx={{ pb: 3 }}>
                    <DeviceDetail
                        device={device}
                        onToggle={
                            this.props.settings.allowSwitching ? port => this.togglePort(port) : undefined
                        }
                    />
                </DialogContent>
            </Dialog>
        );
    }

    private renderTile(compact: boolean): React.JSX.Element {
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        aspectRatio: compact ? '1' : '2',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        ...(getTileStyles(theme, this.isTileActive(), accent) as any),
                        padding: isNeumorphicTheme(theme) ? '4px' : '8px',
                    })}
                >
                    <div
                        onClick={event => event.stopPropagation()}
                        style={{ display: 'contents' }}
                    >
                        {indicators}
                    </div>
                    {this.renderBody(compact)}
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

export default TeltonikaPortsComponent;
