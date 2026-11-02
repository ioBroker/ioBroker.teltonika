// Full detail of one device: the front panel, the digital inputs and outputs, and everything the device kind
// reports. Shared by both widgets so the overview dialog and the single-device dialog stay identical — the same
// device must not look different depending on which tile it was opened from.

import { React, MuiMaterial, AdapterReact } from '@iobroker/dm-widgets';
import type { BoxProps, SwitchProps, TypographyProps } from '@mui/material';
import type { I18n as I18nType } from '@iobroker/gui-components';

import PortPanel from './PortPanel';
import { formatUptime, type DeviceInfo, type PortInfo, type WanInfo } from './utils';

const I18n = AdapterReact.I18n as typeof I18nType;
const Box: React.ComponentType<BoxProps> = MuiMaterial?.Box;
const Typography: React.ComponentType<TypographyProps> = MuiMaterial?.Typography;
const Switch: React.ComponentType<SwitchProps> = MuiMaterial?.Switch;

const COLORS = {
    online: '#1f8a3a',
    offline: '#b22d2d',
    unknown: '#6c7a86',
    link: '#3ecf5f',
    idle: '#9aa7b4',
    tile: '#1c232a',
    border: 'rgba(255,255,255,0.08)',
    poe: '#f5c518',
} as const;

/**
 * One port of the PoE list. The switch is drawn only where the port may be switched from here; otherwise the
 * bolt shows the state, so a control that would be refused is never offered.
 */
function PoeRow({ port, onToggle }: { port: PortInfo; onToggle?: (port: PortInfo) => void }): React.JSX.Element {
    const clickable = !!onToggle && port.poeSwitchable;
    const state = !port.poe
        ? I18n.t('telt_poe_off')
        : port.poeActive === false
          ? I18n.t('telt_poe_idle')
          : port.poePower !== null
            ? `${port.poePower} W`
            : I18n.t('telt_poe_on');

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                pl: clickable ? 0 : 1,
                pr: 1,
                py: clickable ? 0 : 0.5,
                borderRadius: 1,
                boxShadow: `inset 0 0 0 1px ${COLORS.border}`,
                minWidth: 0,
            }}
        >
            {clickable ? (
                <Switch
                    size="small"
                    checked={!!port.poe}
                    onChange={() => onToggle?.(port)}
                    slotProps={{ input: { 'aria-label': `PoE ${port.label}` } }}
                />
            ) : (
                <Box
                    component="span"
                    sx={{ color: COLORS.poe, fontSize: 13, lineHeight: 1, opacity: port.poe ? 1 : 0.25 }}
                >
                    ⚡
                </Box>
            )}
            <Typography
                variant="caption"
                sx={{ fontWeight: 700, flexShrink: 0 }}
            >
                {port.label}
            </Typography>
            <Typography
                variant="caption"
                sx={{ opacity: 0.75, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
                {port.description || ''}
            </Typography>
            <Typography
                variant="caption"
                sx={{
                    ml: 'auto',
                    pl: 1,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    color: port.poe && port.poeActive !== false ? COLORS.poe : undefined,
                    opacity: port.poe && port.poeActive !== false ? 1 : 0.55,
                }}
            >
                {state}
            </Typography>
        </Box>
    );
}

export function panelLabels(): {
    ethernet: string;
    fibre: string;
    up: string;
    down: string;
    disabled: string;
    poeOn: string;
    poeOff: string;
} {
    return {
        ethernet: I18n.t('telt_ethernet'),
        fibre: I18n.t('telt_fibre'),
        up: I18n.t('telt_up'),
        down: I18n.t('telt_nolink'),
        disabled: I18n.t('telt_disabled'),
        poeOn: I18n.t('telt_poe_on'),
        poeOff: I18n.t('telt_poe_off'),
    };
}

/** mwan3 statuses, in the wording the device uses. Anything unknown is drawn neutral rather than guessed at. */
const WAN_COLORS: { [status: string]: string } = {
    online: COLORS.online,
    standby: '#b8860b',
    offline: COLORS.offline,
    notracking: COLORS.unknown,
};

export function wanStatusColor(status: string | null): string {
    return (status && WAN_COLORS[status]) || COLORS.unknown;
}

function WanRow({ wan, address }: { wan: WanInfo; address?: string }): React.JSX.Element {
    const color = wanStatusColor(wan.status);
    const details = [
        address || null,
        wan.uptime ? formatUptime(wan.uptime) : null,
        // Named for what it is: mwan3 reports its ping targets here, not the address of the interface
        wan.trackingHosts ? `${I18n.t('telt_tracking')} ${wan.trackingHosts}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                // A disabled interface is dimmed rather than hidden: that it exists but is off is information
                opacity: wan.enabled === false ? 0.5 : 1,
                boxShadow: `inset 0 0 0 1px ${COLORS.border}`,
            }}
        >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography
                variant="caption"
                sx={{ fontWeight: 700, minWidth: 90 }}
            >
                {wan.label}
            </Typography>
            <Typography
                variant="caption"
                sx={{ color, minWidth: 74 }}
            >
                {wan.status || '–'}
            </Typography>
            <Typography
                variant="caption"
                sx={{ opacity: 0.65, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
                {details}
            </Typography>
        </Box>
    );
}

export default function DeviceDetail({
    device,
    onToggle,
    onTogglePoe,
}: {
    device: DeviceInfo;
    /** Absent leaves the panel display only, which is what an unconfigured write community means */
    onToggle?: (port: PortInfo) => void;
    /** Absent shows PoE without switches */
    onTogglePoe?: (port: PortInfo) => void;
}): React.JSX.Element {
    const poePorts = device.ports.filter(port => port.poe !== null);
    const edge = device.alive === null ? COLORS.unknown : device.alive ? COLORS.online : COLORS.offline;

    const facts: [string, string][] = [];
    if (device.model) {
        facts.push([I18n.t('telt_model'), device.model]);
    }
    if (device.isRouter) {
        if (device.operator) {
            facts.push([I18n.t('telt_operator'), device.operator]);
        }
        if (device.connection) {
            facts.push([I18n.t('telt_connection'), device.connection]);
        }
        if (device.network) {
            facts.push([I18n.t('telt_network'), device.network]);
        }
        if (device.signal !== null) {
            facts.push([I18n.t('telt_signal'), `${device.signal} dBm`]);
        }
    }
    // Next to the WAN address on a router, and the only address a switch has
    if (device.lan) {
        facts.push([I18n.t('telt_lan'), device.lan]);
    }
    if (device.isRouter) {
        if (device.wan) {
            facts.push([I18n.t('telt_wan'), device.wan]);
        }
        if (device.wanIPv6) {
            facts.push(['IPv6', device.wanIPv6]);
        }
        if (device.temperature !== null) {
            facts.push([I18n.t('telt_temperature'), `${device.temperature} °C`]);
        }
    }
    if (device.uptime !== null) {
        facts.push([I18n.t('telt_uptime'), formatUptime(device.uptime) || '']);
    }
    if (device.cpu !== null) {
        facts.push(['CPU', `${Math.round(device.cpu)} %`]);
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: COLORS.tile,
                borderLeft: `4px solid ${edge}`,
                boxShadow: `inset 0 0 0 1px ${COLORS.border}`,
                width: '100%',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{device.name}</Typography>
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.6 }}
                >
                    {device.isRouter ? I18n.t('telt_router') : I18n.t('telt_switch')}
                </Typography>
            </Box>

            {device.ports.length ? (
                <PortPanel
                    ports={device.ports}
                    onToggle={onToggle}
                    labels={panelLabels()}
                />
            ) : (
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.6 }}
                >
                    {I18n.t('telt_no_ports')}
                </Typography>
            )}

            {poePorts.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}
                    >
                        PoE
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                            gap: 0.5,
                        }}
                    >
                        {poePorts.map(port => (
                            <PoeRow
                                key={port.id}
                                port={port}
                                onToggle={onTogglePoe}
                            />
                        ))}
                    </Box>
                </Box>
            ) : null}

            {device.wanInterfaces.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}
                    >
                        {I18n.t('telt_wan_interfaces')}
                    </Typography>
                    {device.wanInterfaces.map(wan => (
                        <WanRow
                            key={wan.id}
                            wan={wan}
                            address={device.addresses[wan.id]}
                        />
                    ))}
                </Box>
            ) : null}

            {device.io.length ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {device.io.map(io => (
                        <Box
                            key={io.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                boxShadow: `inset 0 0 0 1px ${COLORS.border}`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: io.state ? COLORS.link : COLORS.idle,
                                }}
                            />
                            <Typography variant="caption">{`${io.label}${io.type ? ` · ${io.type}` : ''}`}</Typography>
                        </Box>
                    ))}
                </Box>
            ) : null}

            {facts.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {facts.map(([label, value]) => (
                        <Typography
                            key={label}
                            variant="caption"
                            sx={{ opacity: 0.8 }}
                        >
                            <Box
                                component="span"
                                sx={{ opacity: 0.6 }}
                            >
                                {`${label}: `}
                            </Box>
                            {value}
                        </Typography>
                    ))}
                </Box>
            ) : null}
        </Box>
    );
}
