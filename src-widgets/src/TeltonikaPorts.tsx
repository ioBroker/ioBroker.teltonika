// The front panel of one Teltonika device as a vis-2 widget - the counterpart of the devices app's ports widget.
//
// - `panel`  - name, one RJ45 symbol per port and the links up; a click opens the device's details.
// - `detail` - the device's details right inside the widget, no dialog.

import type React from 'react';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { I18n } from '@iobroker/gui-components';
import type { Connection } from '@iobroker/gui-components';
import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import DeviceDetail, { panelLabels } from '@teltonika/DeviceDetail';
import PortPanel from '@teltonika/PortPanel';
import type { PortInfo } from '@teltonika/utils';
import DeviceDialog from './DeviceDialog';
import DeviceField from './DeviceField';
import { togglePort, useDevices } from './useDevices';

type Mode = 'panel' | 'detail';

interface TeltonikaPortsRxData {
    instance: string;
    /** Channel id of the device, e.g. `teltonika.0.6007866821`; empty takes the first device with ports */
    device: string;
    mode: Mode;
    allowSwitching: boolean;
    noCard: boolean;
    widgetTitle: string;
}

/** A widget setting as a string; a new widget's fields are simply absent. */
function stringData(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

export default class TeltonikaPorts extends (window.visRxWidget as typeof VisRxWidget)<
    TeltonikaPortsRxData,
    VisRxWidgetState
> {
    public static getI18nPrefix(): string {
        return 'telt_';
    }

    public static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplTeltonikaPorts',
            visSet: 'teltonika',
            visSetLabel: 'set_label',
            visSetColor: '#0a5ea8',
            visName: 'Teltonika ports',
            visWidgetLabel: 'TeltonikaPorts',
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
                            name: 'device',
                            label: 'device',
                            type: 'custom',
                            // A list of the devices the instance has, instead of typing a channel id
                            component: (_field, data, setData, props) => (
                                <DeviceField
                                    socket={props.context.socket as unknown as Connection}
                                    instance={stringData(data.instance) || 'teltonika.0'}
                                    value={stringData(data.device)}
                                    onChange={device => setData({ ...data, device })}
                                />
                            ),
                        },
                        {
                            name: 'mode',
                            label: 'mode',
                            type: 'select',
                            options: [
                                { value: 'panel', label: 'mode_panel' },
                                { value: 'detail', label: 'mode_detail' },
                            ],
                            default: 'panel',
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
                width: 360,
                height: 200,
                position: 'relative',
            },
            visPrev: 'widgets/teltonika/img/prev_ports.svg',
        };
    }

    public getWidgetInfo(): RxWidgetInfo {
        return TeltonikaPorts.getWidgetInfo();
    }

    public renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);
        const { instance, device, mode, allowSwitching, noCard } = this.state.rxData;

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
                <PortsBody
                    socket={this.props.context.socket as unknown as Connection}
                    instance={instance || 'teltonika.0'}
                    deviceId={device || ''}
                    mode={mode || 'panel'}
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

function PortsBody({
    socket,
    instance,
    deviceId,
    mode,
    allowSwitching,
}: {
    socket: Connection;
    instance: string;
    deviceId: string;
    mode: Mode;
    allowSwitching: boolean;
}): React.JSX.Element {
    const { devices } = useDevices(socket, instance, deviceId);
    const [open, setOpen] = useState(false);

    if (!devices) {
        return <Box />;
    }
    const device = devices[0];
    if (!device) {
        return (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                    variant="caption"
                    sx={{ opacity: 0.7 }}
                >
                    {I18n.t('telt_no_device')}
                </Typography>
            </Box>
        );
    }

    const onToggle = allowSwitching ? (port: PortInfo): void => togglePort(socket, device, port) : undefined;

    if (mode === 'detail') {
        return (
            <DeviceDetail
                device={device}
                onToggle={onToggle}
            />
        );
    }

    const up = device.ports.filter(port => port.link).length;
    return (
        <>
            <Box
                onClick={() => setOpen(true)}
                sx={{
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    overflow: 'hidden',
                }}
            >
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                    {device.name}
                </Typography>
                {device.ports.length ? (
                    // With switching on, a click on a socket must switch it rather than open the dialog
                    <div onClick={event => allowSwitching && event.stopPropagation()}>
                        <PortPanel
                            ports={device.ports}
                            size={28}
                            onToggle={onToggle}
                            labels={panelLabels()}
                        />
                    </div>
                ) : (
                    <Typography
                        variant="caption"
                        sx={{ opacity: 0.7 }}
                    >
                        {I18n.t('telt_no_ports')}
                    </Typography>
                )}
                {device.ports.length ? (
                    <Typography
                        variant="caption"
                        sx={{ opacity: 0.65 }}
                    >
                        {`${up}/${device.ports.length} ${I18n.t('telt_links')}`}
                    </Typography>
                ) : null}
            </Box>
            {open ? (
                <DeviceDialog
                    title={device.name}
                    onClose={() => setOpen(false)}
                >
                    <DeviceDetail
                        device={device}
                        onToggle={onToggle}
                    />
                </DeviceDialog>
            ) : null}
        </>
    );
}
