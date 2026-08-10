// Live dev harness — opens a socket.io connection to a running ioBroker admin and renders the widgets against
// real adapter data, so the panel and the state subscriptions can be exercised outside the device manager.
//
// NOT part of the production bundle. Only loaded by src/index.tsx through the Vite dev server.

import React, { useEffect, useState } from 'react';
import { Connection, type ThemeType } from '@iobroker/gui-components';
import type { IStateContext, StateChangeListener, ObjectChangeListener } from '@iobroker/dm-widgets';
import TeltonikaDevicesComponent from './TeltonikaDevicesComponent';
import TeltonikaPortsComponent from './TeltonikaPortsComponent';

const IOB_HOST = 'localhost';
const IOB_PORT = 8081;
const DEFAULT_INSTANCE = 'teltonika.0';

const overlayStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#191c1d',
    color: '#d8dde0',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 18,
};

/** Routes getState/removeState to a real socket connection, fanning out per id so several widgets can share one. */
class DevStateContext implements IStateContext {
    private handlers = new Map<string, Set<StateChangeListener>>();
    private readonly socket: Connection;

    defaultHistory: string | null = null;
    instanceId = '';
    admin = false;
    language: ioBroker.Languages = 'en';
    longitude: number | null = null;
    latitude: number | null = null;
    isFloatComma = true;
    dateFormat = 'DD.MM.YYYY';
    imagePrefix = '../../files/';
    themeType: ThemeType = 'dark';

    constructor(socket: Connection) {
        this.socket = socket;
    }

    setCoordinates(latitude: number | null, longitude: number | null): void {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    getImagePath(fileName: string | null | undefined): string | null {
        if (!fileName) {
            return null;
        }
        if (/^(https?:)?\/\//.test(fileName) || fileName.startsWith('data:')) {
            return fileName;
        }
        return `${this.imagePrefix}${fileName.startsWith('/') ? fileName.slice(1) : fileName}`;
    }

    getState(id: string, handler: StateChangeListener): void {
        let set = this.handlers.get(id);
        if (!set) {
            set = new Set();
            this.handlers.set(id, set);
            void this.socket.subscribeState(id, (sid, state) => {
                const listeners = this.handlers.get(sid);
                if (!listeners || !state) {
                    return;
                }
                for (const cb of listeners) {
                    cb(sid, state);
                }
            });
            void this.socket
                .getState(id)
                .then(state => {
                    if (state) {
                        handler(id, state);
                    }
                })
                .catch(() => {});
        }
        set.add(handler);
    }

    removeState(id: string, handler: StateChangeListener): void {
        const set = this.handlers.get(id);
        if (!set) {
            return;
        }
        set.delete(handler);
        if (set.size === 0) {
            this.socket.unsubscribeState(id);
            this.handlers.delete(id);
        }
    }

    async getObject<T>(id: string): Promise<T | undefined> {
        try {
            return (await this.socket.getObject(id)) as unknown as T;
        } catch {
            return undefined;
        }
    }

    getObjectProperty(_id: string, _property: string, _cb: ObjectChangeListener): void {}
    async removeObject(_id: string, _cb: ObjectChangeListener): Promise<void> {}

    getSocket(): Connection {
        return this.socket;
    }

    destroy(): void {
        for (const id of this.handlers.keys()) {
            this.socket.unsubscribeState(id);
        }
        this.handlers.clear();
    }
}

/**
 * The real WidgetGeneric arrives from the host over Module Federation and is stubbed in the installed package,
 * so `render()` yields nothing standalone. Calling the production renderers directly exercises the same code
 * the host would run.
 */
class DevDevices extends TeltonikaDevicesComponent {
    override render(): React.JSX.Element {
        return (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={{ width: 280 }}>{this.renderCompact()}</div>
                <div style={{ width: 560 }}>{this.renderWideTall()}</div>
                {(this as any).renderDialog?.()}
            </div>
        );
    }
}

class DevPorts extends TeltonikaPortsComponent {
    override render(): React.JSX.Element {
        return (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={{ width: 280 }}>{this.renderCompact()}</div>
                <div style={{ width: 680 }}>{this.renderWideTall()}</div>
            </div>
        );
    }
}

type ConnState = 'connecting' | 'ready' | { error: string };

const baseWidget = {
    id: 'dev-teltonika',
    type: 'widget' as const,
    name: 'teltonika',
    control: { states: [], type: 'unknown', storeId: '', parentId: '', deviceId: '', channelId: '' },
};

const baseSettings = {
    size: '1x1' as const,
    name: 'Teltonika',
    favorite: false,
    color: '',
    chartHours: 0,
    icon: '',
    iconActive: '',
    text: '',
    textActive: '',
};

export default function App(): React.JSX.Element {
    const [ctx, setCtx] = useState<DevStateContext | null>(null);
    const [conn, setConn] = useState<ConnState>('connecting');
    const [tab, setTab] = useState<'devices' | 'ports'>('devices');
    const [device, setDevice] = useState('');
    const [allowSwitching, setAllowSwitching] = useState(false);

    useEffect(() => {
        let socket: Connection | null = null;
        try {
            socket = new Connection({
                host: IOB_HOST,
                port: IOB_PORT,
                protocol: 'http:',
                name: 'teltonika-dev-harness',
                admin5only: true,
                onReady: () => {
                    setCtx(new DevStateContext(socket!));
                    setConn('ready');
                },
                onError: (err: Error) => setConn({ error: String(err?.message || err) }),
            } as any);
        } catch (err) {
            setConn({ error: String(err) });
        }
        return () => {
            try {
                socket?.destroy?.();
            } catch {
                // ignore
            }
        };
    }, []);

    if (conn === 'connecting') {
        return <div style={overlayStyle}>Connecting to {`http://${IOB_HOST}:${IOB_PORT}`} …</div>;
    }
    if (typeof conn === 'object' && 'error' in conn) {
        return <div style={{ ...overlayStyle, color: '#ff6b6b' }}>Connection error: {conn.error}</div>;
    }
    if (!ctx) {
        return <div style={overlayStyle}>Initializing state context …</div>;
    }

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '6px 14px',
        borderRadius: 6,
        border: `1px solid ${active ? '#4a9eff' : '#3a3f43'}`,
        background: active ? '#1b3a5c' : '#0b0f14',
        color: active ? '#ffffff' : '#d8dde0',
        cursor: 'pointer',
        fontSize: 13,
    });

    return (
        <div
            style={{ minHeight: '100vh', background: '#191c1d', color: '#d8dde0', fontFamily: 'system-ui, sans-serif' }}
        >
            <div
                style={{
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    borderBottom: '1px solid #2a2f33',
                }}
            >
                <button
                    type="button"
                    style={tabStyle(tab === 'devices')}
                    onClick={() => setTab('devices')}
                >
                    Devices overview
                </button>
                <button
                    type="button"
                    style={tabStyle(tab === 'ports')}
                    onClick={() => setTab('ports')}
                >
                    Port panel
                </button>
                {tab === 'ports' ? (
                    <>
                        <input
                            value={device}
                            onChange={e => setDevice(e.target.value)}
                            placeholder="teltonika.0.<device> (empty = first with ports)"
                            style={{
                                padding: 6,
                                minWidth: 320,
                                background: '#0b0f14',
                                color: '#d8dde0',
                                border: '1px solid #3a3f43',
                            }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                            <input
                                type="checkbox"
                                checked={allowSwitching}
                                onChange={e => setAllowSwitching(e.target.checked)}
                            />
                            allow switching
                        </label>
                    </>
                ) : null}
                <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 13 }}>
                    {IOB_HOST}:{IOB_PORT} · {DEFAULT_INSTANCE}
                </span>
            </div>
            <div style={{ padding: 20 }}>
                {tab === 'devices' ? (
                    <DevDevices
                        key="devices"
                        widget={baseWidget as any}
                        stateContext={ctx}
                        settings={{ ...baseSettings, instance: DEFAULT_INSTANCE, onlyAlive: false } as any}
                        onHide={() => {}}
                    />
                ) : (
                    <DevPorts
                        key={`ports-${device}-${allowSwitching}`}
                        widget={baseWidget as any}
                        stateContext={ctx}
                        settings={
                            { ...baseSettings, instance: DEFAULT_INSTANCE, device, allowSwitching } as any
                        }
                        onHide={() => {}}
                    />
                )}
            </div>
        </div>
    );
}
