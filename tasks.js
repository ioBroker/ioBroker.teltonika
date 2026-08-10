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

if (process.argv.includes('--devices-0-clean')) {
    cleanDevices();
} else if (process.argv.includes('--devices-1-npm')) {
    npmInstall(`${__dirname}/src-devices/`).catch(e => console.error(e));
} else if (process.argv.includes('--devices-2-compile')) {
    buildDevices().catch(e => console.error(e));
} else if (process.argv.includes('--devices-3-copy')) {
    copyAllDevicesFiles();
} else {
    cleanDevices();
    npmInstall(`${__dirname}/src-devices/`)
        .then(() => buildDevices())
        .then(() => copyAllDevicesFiles())
        .catch(e => console.error(e));
}
