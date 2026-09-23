import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';
import pack from './package.json';

// vis-2 widget set of the Teltonika adapter.
//
// The views (front panel, device detail, discovery of the object tree) are not in this project: they live in
// `../src-devices/src` and are reached through the `@teltonika` alias, so a device looks the same in the devices
// app and in vis-2. Those files import React, MUI and I18n from `@iobroker/dm-widgets`, the bridge the devices
// app provides; here that name points at `./src/dmWidgets.ts`, which hands over the modules vis-2 shares.
//
// `dedupe` matters for the same reason: a file in `../src-devices/src` would otherwise resolve `react` (and the
// JSX runtime the compiler injects) next to itself, from `src-devices/node_modules`, and the federation runtime
// would see a second React.
const dir = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));

const config = {
    plugins: [
        federation({
            manifest: true,
            name: 'vis2TeltonikaWidgets',
            filename: 'customWidgets.js',
            exposes: {
                './TeltonikaDevices': './src/TeltonikaDevices.tsx',
                './TeltonikaPorts': './src/TeltonikaPorts.tsx',
                './translations': './src/translations',
            },
            remotes: {},
            shared: moduleFederationShared(pack),
            // The default 'version-first' may take react from one container and react-dom from another when
            // their versions differ (React error #527). Use what vis-2 has already loaded.
            shareStrategy: 'loaded-first',
            dts: false,
        }),
        react(),
    ],
    resolve: {
        alias: [
            { find: '@teltonika', replacement: dir('../src-devices/src') },
            // Only the bare package names: the shims reach the real modules through sub-paths
            { find: /^@iobroker\/dm-widgets$/, replacement: dir('./src/dmWidgets.ts') },
            { find: /^@iobroker\/gui-components$/, replacement: dir('./src/guiComponents.ts') },
        ],
        dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material'],
    },
    server: {
        fs: {
            allow: [dir('..')],
        },
    },
    base: './',
    build: {
        // Top-level await, emitted by the federation plugin, needs chrome89+
        target: 'chrome89',
        outDir: './build',
        rollupOptions: {
            onwarn(warning: { code: string }, warn: (warning: { code: string }) => void): void {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            },
        },
    },
};

export default config;
