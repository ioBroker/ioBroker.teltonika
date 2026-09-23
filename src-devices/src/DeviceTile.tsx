// The tile of one device and the summary of all of them — shared by the devices app's overview widget and the
// vis-2 widget set, so a device looks the same wherever it is shown.

import { React, MuiMaterial, AdapterReact } from '@iobroker/dm-widgets';
import type { BoxProps, TypographyProps } from '@mui/material';
import type { I18n as I18nType } from '@iobroker/gui-components';

import { wanStatusColor } from './DeviceDetail';
import { formatUptime, type DeviceInfo } from './utils';

const I18n = AdapterReact.I18n as typeof I18nType;
const Box: React.ComponentType<BoxProps> = MuiMaterial?.Box;
const Typography: React.ComponentType<TypographyProps> = MuiMaterial?.Typography;

const COLORS = {
    online: '#1f8a3a',
    offline: '#b22d2d',
    unknown: '#6c7a86',
    link: '#3ecf5f',
    idle: '#9aa7b4',
    tile: '#1c232a',
    border: 'rgba(255,255,255,0.08)',
} as const;

/** Unreachable first, since that is the one that needs attention, then by name. */
export function sortDevices(devices: DeviceInfo[]): DeviceInfo[] {
    const rank = (d: DeviceInfo): number => (d.alive === false ? 0 : d.alive === true ? 1 : 2);
    return [...devices].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** A single row of small bars, one per port — enough to see at tile size which links are up. */
export function PortStrip({ device, height }: { device: DeviceInfo; height: number }): React.JSX.Element | null {
    if (!device.ports.length) {
        return null;
    }
    return (
        <Box sx={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
            {device.ports.map(port => (
                <Box
                    key={port.id}
                    title={port.label}
                    sx={{
                        width: 6,
                        height,
                        borderRadius: '1px',
                        bgcolor: port.enabled === false ? COLORS.offline : port.link ? COLORS.link : COLORS.idle,
                        opacity: port.link ? 1 : 0.45,
                    }}
                />
            ))}
        </Box>
    );
}

function MobileLine({ device }: { device: DeviceInfo }): React.JSX.Element | null {
    if (!device.isRouter) {
        return null;
    }
    const parts = [device.operator, device.connection, device.signal !== null ? `${device.signal} dBm` : null]
        .filter(Boolean)
        .join(' · ');
    if (!parts) {
        return null;
    }
    return (
        <Typography
            variant="caption"
            sx={{ opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
            {parts}
        </Typography>
    );
}

export function DeviceTile({ device }: { device: DeviceInfo }): React.JSX.Element {
    const edge = device.alive === null ? COLORS.unknown : device.alive ? COLORS.online : COLORS.offline;
    const up = device.ports.filter(port => port.link).length;
    const details: string[] = [];
    if (device.uptime !== null) {
        details.push(`${I18n.t('telt_uptime')} ${formatUptime(device.uptime)}`);
    }
    if (device.temperature !== null) {
        details.push(`${device.temperature} °C`);
    }
    if (device.cpu !== null) {
        details.push(`CPU ${Math.round(device.cpu)} %`);
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                p: 1.25,
                borderRadius: 1.5,
                minWidth: 260,
                flex: '1 1 260px',
                bgcolor: COLORS.tile,
                borderLeft: `4px solid ${edge}`,
                boxShadow: `inset 0 0 0 1px ${COLORS.border}`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                    {device.name}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.6, whiteSpace: 'nowrap' }}
                >
                    {device.model || (device.isRouter ? I18n.t('telt_router') : I18n.t('telt_switch'))}
                </Typography>
            </Box>

            <MobileLine device={device} />

            {device.ports.length ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PortStrip
                        device={device}
                        height={14}
                    />
                    <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, whiteSpace: 'nowrap' }}
                    >
                        {`${up}/${device.ports.length} ${I18n.t('telt_links')}`}
                    </Typography>
                </Box>
            ) : null}

            {device.wanInterfaces.length ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {device.wanInterfaces.map(wan => (
                        <Box
                            key={wan.id}
                            title={`${wan.label}: ${wan.status || '–'}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.4,
                                // A disabled interface stays visible but dimmed, since its existence matters
                                opacity: wan.enabled === false ? 0.45 : 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: wanStatusColor(wan.status),
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ opacity: 0.75 }}
                            >
                                {wan.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            ) : null}

            {device.wan ? (
                <Typography
                    variant="caption"
                    sx={{
                        opacity: 0.7,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {device.wan}
                </Typography>
            ) : null}

            {details.length ? (
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.55 }}
                >
                    {details.join(' · ')}
                </Typography>
            ) : null}
        </Box>
    );
}

export function DevicesSummary({ devices, compact }: { devices: DeviceInfo[]; compact: boolean }): React.JSX.Element {
    const online = devices.filter(device => device.alive === true).length;
    const ports = devices.flatMap(device => device.ports);
    const linksUp = ports.filter(port => port.link).length;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: compact ? 0.5 : 1,
                width: '100%',
                px: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, fontVariantNumeric: 'tabular-nums' }}>
                <Typography
                    component="span"
                    sx={{
                        color: COLORS.online,
                        fontSize: compact ? '1.6rem' : '2.2rem',
                        fontWeight: 800,
                        lineHeight: 1,
                    }}
                >
                    {online}
                </Typography>
                <Typography
                    component="span"
                    sx={{ opacity: 0.4, fontSize: compact ? '1.2rem' : '1.6rem' }}
                >
                    /
                </Typography>
                <Typography
                    component="span"
                    sx={{ fontSize: compact ? '1.6rem' : '2.2rem', fontWeight: 800, lineHeight: 1 }}
                >
                    {devices.length}
                </Typography>
            </Box>
            <Typography
                variant="caption"
                sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
                {I18n.t('telt_devices')}
            </Typography>
            {ports.length ? (
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.6 }}
                >
                    {`${linksUp}/${ports.length} ${I18n.t('telt_links')}`}
                </Typography>
            ) : null}
            {!compact && devices.length ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 0.5 }}>
                    {devices.slice(0, 4).map(device => (
                        <PortStrip
                            key={device.id}
                            device={device}
                            height={12}
                        />
                    ))}
                </Box>
            ) : null}
        </Box>
    );
}
