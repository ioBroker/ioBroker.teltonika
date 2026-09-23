const { deleteFoldersRecursive, buildReact, copyFiles, npmInstall } = require('@iobroker/build-tools');

function buildDevices() {
    return buildReact(`${__dirname}/src-devices/`, { rootDir: `${__dirname}/src-devices/`, vite: true });
}

function cleanDevices() {
    deleteFoldersRecursive(`${__dirname}/admin/dm-widgets`);
    deleteFoldersRecursive(`${__dirname}/src-devices/build`);
}

// `mf-manifest.json` is copied on purpose: admin fetches it next to the remote entry to decide from the shared
// modules which GUI API generation this component was built against.
function copyAllDevicesFiles() {
    copyFiles(['src-devices/build/**/*', '!src-devices/build/index.html'], 'admin/dm-widgets/');
    copyFiles(['src-devices/img/**/*'], 'admin/dm-widgets');
    copyFiles(['src-devices/src/i18n/*.json'], 'admin/dm-widgets/i18n');
}

// The vis-2 widget set imports the shared views from `src-devices/src`, and those resolve their packages from
// `src-devices/node_modules` - so both projects need their modules installed.
function buildWidgets() {
    return buildReact(`${__dirname}/src-widgets/`, { rootDir: `${__dirname}/src-widgets/`, vite: true });
}

function cleanWidgets() {
    deleteFoldersRecursive(`${__dirname}/widgets`);
    deleteFoldersRecursive(`${__dirname}/src-widgets/build`);
}

// `img` with the previews comes along: Vite copies `public/` into the build
function copyAllWidgetsFiles() {
    copyFiles(['src-widgets/build/**/*', '!src-widgets/build/index.html'], 'widgets/teltonika/');
}

function devices() {
    cleanDevices();
    return npmInstall(`${__dirname}/src-devices/`)
        .then(() => buildDevices())
        .then(() => copyAllDevicesFiles());
}

function widgets() {
    cleanWidgets();
    return npmInstall(`${__dirname}/src-widgets/`)
        .then(() => buildWidgets())
        .then(() => copyAllWidgetsFiles());
}

if (process.argv.includes('--devices-0-clean')) {
    cleanDevices();
} else if (process.argv.includes('--devices-1-npm')) {
    npmInstall(`${__dirname}/src-devices/`).catch(e => console.error(e));
} else if (process.argv.includes('--devices-2-compile')) {
    buildDevices().catch(e => console.error(e));
} else if (process.argv.includes('--devices-3-copy')) {
    copyAllDevicesFiles();
} else if (process.argv.includes('--widgets-0-clean')) {
    cleanWidgets();
} else if (process.argv.includes('--widgets-1-npm')) {
    npmInstall(`${__dirname}/src-widgets/`).catch(e => console.error(e));
} else if (process.argv.includes('--widgets-2-compile')) {
    buildWidgets().catch(e => console.error(e));
} else if (process.argv.includes('--widgets-3-copy')) {
    copyAllWidgetsFiles();
} else if (process.argv.includes('--devices')) {
    devices().catch(e => console.error(e));
} else if (process.argv.includes('--widgets')) {
    // The shared views need `src-devices/node_modules` too
    npmInstall(`${__dirname}/src-devices/`)
        .then(() => widgets())
        .catch(e => console.error(e));
} else {
    devices()
        .then(() => widgets())
        .catch(e => console.error(e));
}
