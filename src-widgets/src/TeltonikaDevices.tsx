// Every Teltonika device of one instance as a vis-2 widget - the counterpart of the devices app's overview.
//
// Three ways to show them, chosen in the widget's settings:
//
// - `summary` - devices online / total and the port strips; a click opens the details of all devices.
// - `tiles`   - one tile per device; a click opens the details.
// - `detail`  - the details of every device right inside the widget, no dialog.
//
// The class is what vis-2 requires. Everything inside the card is a function component, because the data comes
// from a hook (`useDevices`).

import type React from 'react';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { I18n } from '@iobroker/gui-components';
import type { Connection } from '@iobroker/gui-components';
import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import DeviceDetail from '@teltonika/DeviceDetail';
import { DeviceTile, DevicesSummary, sortDevices } from '@teltonika/DeviceTile';
import type { DeviceInfo, PortInfo } from '@teltonika/utils';
import DeviceDialog from './DeviceDialog';
import { togglePort, useDevices } from './useDevices';

type Mode = 'summary' | 'tiles' | 'detail';

interface TeltonikaDevicesRxData {
    instance: string;
    onlyAlive: boolean;
    mode: Mode;
    allowSwitching: boolean;
    noCard: boolean;
    widgetTitle: string;
}

export default class TeltonikaDevices extends (window.visRxWidget as typeof VisRxWidget)<
    TeltonikaDevicesRxData,
    VisRxWidgetState
> {
    public static getI18nPrefix(): string {
        return 'telt_';
    }

    public static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplTeltonikaDevices',
            visSet: 'teltonika',
            visSetLabel: 'set_label',
            visSetColor: '#0a5ea8',
            visName: 'Teltonika devices',
            visWidgetLabel: 'TeltonikaDevices',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'instance',
                            label: 'instance',
                            type: 'instance',
                            adapter: 'teltonika',
                            default: 'teltonika.0',
                        },
                        {
                            name: 'mode',
                            label: 'mode',
                            type: 'select',
                            options: [
                                { value: 'summary', label: 'mode_summary' },
                                { value: 'tiles', label: 'mode_tiles' },
                                { value: 'detail', label: 'mode_detail' },
                            ],
                            default: 'summary',
                        },
                        {
                            name: 'onlyAlive',
                            label: 'onlyAlive',
                            type: 'checkbox',
                        },
                        {
                            name: 'allowSwitching',
                            label: 'allowSwitching',
                            type: 'checkbox',
                        },
                        {
                            name: 'noCard',
                            label: 'noCard',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'name',
                            hidden: 'data.noCard === true',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 320,
                height: 220,
                position: 'relative',
            },
            visPrev: 'widgets/teltonika/img/prev_devices.svg',
        };
    }

    public getWidgetInfo(): RxWidgetInfo {
        return TeltonikaDevices.getWidgetInfo();
    }

    public renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);
        const { instance, onlyAlive, mode, allowSwitching, noCard } = this.state.rxData;

        const content = (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflow: 'auto',
                    // In the editor the widget is dragged and resized, not used: a click must select it
                    pointerEvents: this.props.editMode ? 'none' : undefined,
                }}
            >
                <DevicesBody
                    socket={this.props.context.socket as unknown as Connection}
                    instance={instance || 'teltonika.0'}
                    onlyAlive={!!onlyAlive}
                    mode={mode || 'summary'}
                    allowSwitching={!!allowSwitching}
                />
            </div>
        );

        if (noCard || props.widget.usedInWidget) {
            return content;
        }
        return this.wrapContent(content, null, { boxSizing: 'border-box', height: '100%', paddingBottom: 8 });
    }
}

function DevicesBody({
    socket,
    instance,
    onlyAlive,
    mode,
    allowSwitching,
}: {
    socket: Connection;
    instance: string;
    onlyAlive: boolean;
    mode: Mode;
    allowSwitching: boolean;
}): React.JSX.Element {
    const { devices: all } = useDevices(socket, instance);
    const [open, setOpen] = useState(false);

    if (!all) {
        return <Box />;
    }
    const devices = sortDevices(onlyAlive ? all.filter(device => device.alive !== false) : all);
    const onToggle = (device: DeviceInfo): ((port: PortInfo) => void) | undefined =>
        allowSwitching ? port => togglePort(socket, device, port) : undefined;

    const details = devices.length ? (
        devices.map(device => (
            <DeviceDetail
                key={device.id}
                device={device}
                onToggle={onToggle(device)}
            />
        ))
    ) : (
        <Typography sx={{ opacity: 0.7, p: 2 }}>{I18n.t('telt_empty')}</Typography>
    );

    if (mode === 'detail') {
        return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>{details}</Box>;
    }

    return (
        <>
            <Box
                onClick={() => setOpen(true)}
                sx={{
                    width: '100%',
                    minHeight: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: mode === 'tiles' ? 'flex-start' : 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                {mode === 'tiles' ? (
                    devices.map(device => (
                        <DeviceTile
                            key={device.id}
                            device={device}
                        />
                    ))
                ) : (
                    <DevicesSummary
                        devices={devices}
                        compact={false}
                    />
                )}
            </Box>
            {open ? (
                <DeviceDialog
                    title={I18n.t('telt_dialog_title')}
                    onClose={() => setOpen(false)}
                >
                    {details}
                </DeviceDialog>
            ) : null}
        </>
    );
}
