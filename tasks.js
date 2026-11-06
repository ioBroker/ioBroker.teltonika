const { exec } = require('node:child_process');
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

// The web components (`common.webComponents`): one `vite build` per component, so that each one is ONE module
// file - see src-webcomponents/vite.config.ts. `npm run build` there runs all of them; the build writes the
// manifests and fails if one does not pass `checkManifest()`.
function buildWebComponents() {
    return new Promise((resolve, reject) => {
        const child = exec('npm run build', { cwd: `${__dirname}/src-webcomponents/` }, error =>
            error ? reject(new Error(`Cannot build the web components: ${error.message}`)) : resolve(),
        );
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
    });
}

function cleanWebComponents() {
    deleteFoldersRecursive(`${__dirname}/admin/webcomponents`);
    deleteFoldersRecursive(`${__dirname}/src-webcomponents/build`);
}

// the modules, their manifests (`<name>.json`) and the icon of `teltonika-presence` - the other icons are those of
// the devices widgets in `admin/dm-widgets`
function copyAllWebComponentsFiles() {
    copyFiles(
        ['src-webcomponents/build/*.js', 'src-webcomponents/build/*.json', 'src-webcomponents/build/*.svg'],
        'admin/webcomponents/',
    );
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

function webComponents() {
    cleanWebComponents();
    return npmInstall(`${__dirname}/src-webcomponents/`)
        .then(() => buildWebComponents())
        .then(() => copyAllWebComponentsFiles());
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
} else if (process.argv.includes('--wc')) {
    webComponents().catch(e => {
        console.error(e);
        process.exit(2);
    });
} else {
    devices()
        .then(() => widgets())
        .catch(e => console.error(e))
        // a web component whose manifest does not pass the check fails the build
        .then(() => webComponents())
        .catch(e => {
            console.error(e);
            process.exit(2);
        });
}
