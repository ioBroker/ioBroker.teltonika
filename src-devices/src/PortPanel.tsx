// The front panel view: one RJ45 symbol per port, laid out the way the numbers are printed on the device —
// odd ports on the upper row, even below, fibre ports in their own group on the right.
//
// There is deliberately no PoE indicator. These devices expose no POWER-ETHERNET-MIB at all, so any bolt icon
// would be decoration standing in for data the adapter cannot obtain.

import { React, MuiMaterial } from '@iobroker/dm-widgets';
import type { BoxProps, TooltipProps, TypographyProps } from '@mui/material';
import { formatBytes, speedLabel, splitRows, type PortInfo } from './utils';

const Box: React.ComponentType<BoxProps> = MuiMaterial?.Box;
const Typography: React.ComponentType<TypographyProps> = MuiMaterial?.Typography;
const Tooltip: React.ComponentType<TooltipProps> = MuiMaterial?.Tooltip;

const COLORS = {
    link: '#3ecf5f',
    idle: '#9aa7b4',
    disabled: '#5b4a4a',
    frame: 'rgba(255,255,255,0.14)',
    badge: 'rgba(255,255,255,0.10)',
} as const;

export interface PortPanelProps {
    ports: PortInfo[];
    /** Called when a switchable port is clicked. Absent means the panel is display only. */
    onToggle?: (port: PortInfo) => void;
    size?: number;
    labels?: { ethernet: string; fibre: string; up: string; down: string; disabled: string };
}

/**
 * An RJ45 outline. The latch points away from the row's label, so the upper row reads as plugs going down and
 * the lower row as plugs going up, matching how the sockets face on the hardware.
 */
function Rj45({ color, flipped, size }: { color: string; flipped: boolean; size: number }): React.JSX.Element {
    return (
        <svg
            width={size}
            height={size * 0.82}
            viewBox="0 0 24 20"
            style={{ transform: flipped ? 'rotate(180deg)' : undefined, display: 'block' }}
            aria-hidden="true"
        >
            <path
                d="M2 1 H22 V13 H15.5 V19 H8.5 V13 H2 Z"
                fill={color}
            />
        </svg>
    );
}

function portColor(port: PortInfo): string {
    if (port.enabled === false) {
        return COLORS.disabled;
    }
    return port.link ? COLORS.link : COLORS.idle;
}

function PortCell({
    port,
    flipped,
    size,
    onToggle,
    labels,
}: {
    port: PortInfo;
    flipped: boolean;
    size: number;
    onToggle?: (port: PortInfo) => void;
    labels: NonNullable<PortPanelProps['labels']>;
}): React.JSX.Element {
    const speed = speedLabel(port.speed, port.link);
    const clickable = !!onToggle && port.switchable;
    const status = port.enabled === false ? labels.disabled : port.link ? labels.up : labels.down;
    const throughput =
        port.link && (port.rxBytes !== null || port.txBytes !== null)
            ? `↓ ${formatBytes(port.rxBytes) ?? '–'}   ↑ ${formatBytes(port.txBytes) ?? '–'}`
            : null;

    const label = (
        <Typography sx={{ fontSize: size * 0.32, fontWeight: 600, lineHeight: 1.4, textAlign: 'center' }}>
            {port.label}
        </Typography>
    );

    const badge = (
        <Box sx={{ height: size * 0.42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {speed ? (
                <Box
                    sx={{
                        px: 0.6,
                        borderRadius: 999,
                        bgcolor: COLORS.badge,
                        fontSize: size * 0.26,
                        lineHeight: 1.6,
                        opacity: 0.9,
                    }}
                >
                    {speed}
                </Box>
            ) : null}
        </Box>
    );

    return (
        <Tooltip
            title={
                <Box sx={{ whiteSpace: 'pre-line' }}>
                    {`${port.label} — ${status}`}
                    {speed ? `\n${speed}${port.duplex ? ' · full duplex' : ''}` : ''}
                    {throughput ? `\n${throughput}` : ''}
                    {clickable ? '\n⬜' : ''}
                </Box>
            }
            arrow
        >
            <Box
                onClick={clickable ? () => onToggle?.(port) : undefined}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.75,
                    py: 0.5,
                    border: `1px solid ${COLORS.frame}`,
                    cursor: clickable ? 'pointer' : 'default',
                    // Only a port the adapter can actually switch reacts to the pointer, so the panel never
                    // suggests a control that would be refused
                    '&:hover': clickable ? { bgcolor: 'rgba(255,255,255,0.06)' } : undefined,
                }}
            >
                {flipped ? null : badge}
                {flipped ? null : (
                    <Rj45
                        color={portColor(port)}
                        flipped={false}
                        size={size}
                    />
                )}
                {flipped ? (
                    <Rj45
                        color={portColor(port)}
                        flipped
                        size={size}
                    />
                ) : null}
                {flipped ? badge : null}
                <Box sx={{ display: 'none' }}>{label}</Box>
            </Box>
        </Tooltip>
    );
}

/** One group with its own frame and caption, e.g. the eight copper ports or the two fibre cages. */
function PortGroup({
    ports,
    caption,
    size,
    onToggle,
    labels,
}: {
    ports: PortInfo[];
    caption: string;
    size: number;
    onToggle?: (port: PortInfo) => void;
    labels: NonNullable<PortPanelProps['labels']>;
}): React.JSX.Element | null {
    if (!ports.length) {
        return null;
    }
    const { top, bottom } = splitRows(ports);
    const numberRow = (row: PortInfo[]): React.JSX.Element => (
        <Box sx={{ display: 'flex' }}>
            {row.map(port => (
                <Box
                    key={port.id}
                    sx={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: size * 0.34,
                        fontWeight: 600,
                        opacity: 0.85,
                        px: 0.75,
                        minWidth: size + 12,
                    }}
                >
                    {port.label}
                </Box>
            ))}
        </Box>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                p: 1,
                borderRadius: 1.5,
                border: `1px solid ${COLORS.frame}`,
            }}
        >
            {numberRow(top)}
            <Box sx={{ display: 'flex' }}>
                {top.map(port => (
                    <PortCell
                        key={port.id}
                        port={port}
                        flipped={false}
                        size={size}
                        onToggle={onToggle}
                        labels={labels}
                    />
                ))}
            </Box>
            {bottom.length ? (
                <Box sx={{ display: 'flex' }}>
                    {bottom.map(port => (
                        <PortCell
                            key={port.id}
                            port={port}
                            flipped
                            size={size}
                            onToggle={onToggle}
                            labels={labels}
                        />
                    ))}
                </Box>
            ) : null}
            {bottom.length ? numberRow(bottom) : null}
            <Typography sx={{ fontSize: size * 0.34, fontWeight: 700, opacity: 0.85, mt: 0.25 }}>
                {caption}
            </Typography>
        </Box>
    );
}

export default function PortPanel(props: PortPanelProps): React.JSX.Element {
    const size = props.size ?? 34;
    const labels = props.labels ?? {
        ethernet: 'Ethernet',
        fibre: 'SFP',
        up: 'up',
        down: 'no link',
        disabled: 'disabled',
    };
    const copper = props.ports.filter(port => !port.fibre);
    const fibre = props.ports.filter(port => port.fibre);

    return (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <PortGroup
                ports={copper}
                caption={labels.ethernet}
                size={size}
                onToggle={props.onToggle}
                labels={labels}
            />
            <PortGroup
                ports={fibre}
                caption={labels.fibre}
                size={size}
                onToggle={props.onToggle}
                labels={labels}
            />
        </Box>
    );
}
