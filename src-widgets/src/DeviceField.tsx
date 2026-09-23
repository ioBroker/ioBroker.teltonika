// The device setting of the ports widget in the vis-2 editor: a list of the devices the chosen instance has.
//
// Read from the object tree like the widget itself does, so it works while the adapter is stopped too - the
// devices app asks the running instance (`teltonika:getDevices`) instead.

import type React from 'react';
import { useEffect, useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import { I18n } from '@iobroker/gui-components';
import type { Connection } from '@iobroker/gui-components';

import { readInstance } from '@teltonika/utils';

export default function DeviceField({
    socket,
    instance,
    value,
    onChange,
}: {
    socket: Connection;
    instance: string;
    value: string;
    onChange: (value: string) => void;
}): React.JSX.Element {
    const [options, setOptions] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        let cancelled = false;
        void readInstance(socket, instance)
            .then(({ devices }) => {
                if (!cancelled) {
                    setOptions(
                        [...devices.values()]
                            .map(device => ({ id: device.id, name: device.name }))
                            .sort((a, b) => a.name.localeCompare(b.name)),
                    );
                }
            })
            .catch(() => !cancelled && setOptions([]));
        return () => {
            cancelled = true;
        };
    }, [socket, instance]);

    // A device that is gone stays selectable, so the setting is not silently lost
    const known = !value || options.some(option => option.id === value);

    return (
        <Select
            variant="standard"
            fullWidth
            value={value}
            displayEmpty
            onChange={event => onChange(event.target.value)}
        >
            <MenuItem value="">
                <em>{I18n.t('telt_device_auto')}</em>
            </MenuItem>
            {options.map(option => (
                <MenuItem
                    key={option.id}
                    value={option.id}
                >
                    {`${option.name} (${option.id.split('.').pop()})`}
                </MenuItem>
            ))}
            {known ? null : <MenuItem value={value}>{value}</MenuItem>}
        </Select>
    );
}
