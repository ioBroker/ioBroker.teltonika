// The devices of one instance, live: read from the object tree once, then kept current by subscriptions.
//
// The device objects are mutated in place and a counter drives the re-render, as in the devices app: copying a map
// of devices, each with its own array of ports, on every incoming value would churn hard on a switch that reports
// four counters per port.

import { useEffect, useState } from 'react';
import type { Connection } from '@iobroker/gui-components';

import { applyState, readInstance, type DeviceInfo, type PortInfo } from '@teltonika/utils';

/** Switches a port on or off; only ports the adapter may switch (write community configured) react. */
export function togglePort(socket: Connection, device: DeviceInfo, port: PortInfo): void {
    if (port.switchable) {
        void socket.setState(`${device.id}.ports.${port.id}.enabled`, { val: !port.enabled, ack: false });
    }
}

export interface DevicesResult {
    /** `null` until the object tree has been read */
    devices: DeviceInfo[] | null;
    /** Changes with every applied value, for memoised children that need to know */
    revision: number;
}

/**
 * @param socket vis-2's connection
 * @param instance adapter instance, e.g. `teltonika.0`
 * @param deviceId only this device channel is subscribed; `undefined` subscribes every device, `''` takes the
 *   first device that has ports
 */
export function useDevices(socket: Connection, instance: string, deviceId?: string): DevicesResult {
    const [devices, setDevices] = useState<DeviceInfo[] | null>(null);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let ids: string[] = [];
        let handler: ioBroker.StateChangeHandler | null = null;

        void readInstance(socket, instance)
            .then(({ devices: found, stateIds }) => {
                if (cancelled) {
                    return;
                }
                let wanted = [...found.values()];
                if (deviceId !== undefined) {
                    // Without a configured device take the first one that actually has ports, so a fresh widget
                    // shows something instead of an empty frame
                    const one = (deviceId && found.get(deviceId)) || wanted.find(device => device.ports.length);
                    wanted = one ? [one] : [];
                }
                const byId = new Map(wanted.map(device => [device.id, device]));

                ids = [...stateIds].filter(([, owner]) => byId.has(owner)).map(([id]) => id);
                handler = (id: string, state: ioBroker.State | null | undefined): void => {
                    const owner = stateIds.get(id);
                    const device = owner ? byId.get(owner) : undefined;
                    if (!device || !state) {
                        return;
                    }
                    if (applyState(device, id.slice(device.id.length + 1), state.val)) {
                        setRevision(value => value + 1);
                    }
                };
                setDevices(wanted);
                if (ids.length) {
                    void socket.subscribeState(ids, handler);
                }
            })
            .catch((error: unknown) => {
                console.error(`[teltonika] Cannot read ${instance}: ${String(error)}`);
                if (!cancelled) {
                    setDevices([]);
                }
            });

        return () => {
            cancelled = true;
            if (handler && ids.length) {
                socket.unsubscribeState(ids, handler);
            }
            setDevices(null);
        };
    }, [socket, instance, deviceId]);

    return { devices, revision };
}
