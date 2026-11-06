import react from '@vitejs/plugin-react';
import { checkManifest, getReactImportPath, REACT_SPECIFIERS, type WebComponentText } from '@iobroker/web-components';
import { readFileSync } from 'node:fs';
import type { Plugin, UserConfig } from 'vite';

// with the extension: Vite may load its config natively, without a bundler that would add it
import { COMPONENT_NAMES, getManifestFile, getModuleFile, getModulePath, type ComponentName } from './src/constants.ts';
import { buildManifest, PRESENCE_ICON, type ManifestTexts } from './src/manifest.ts';
import { OWN_WORDS } from './src/ownWords.ts';
import { COMPONENT_WORDS } from './src/wordKeys.ts';

/**
 * The web components `<iob-teltonika-devices>`, `<iob-teltonika-ports>`, `<iob-teltonika-person>` and
 * `<iob-teltonika-presence>`: one ES module each, `admin/webcomponents/<name>.js`, and its manifest `<name>.json`
 * next to it (`common.webComponents`). Every host - vis-2, devices, Aura, admin - reads them from
 * `/adapter/teltonika/webcomponents/`. No module federation: the host shares nothing but the socket.
 *
 * One build per component - `vite build --mode <name>` (`npm run build` runs all four): a host imports exactly one
 * URL per component, so each module is one file, with the shared code compiled into each. One build with four
 * entries would move the shared code into chunks of their own.
 *
 * React is not bundled: the four React imports point at `lib/esm/react-19.js`, which web and admin serve
 * beside `adapter/`. The path is relative to the module, so a path prefix of a reverse proxy stays.
 */

const LANGUAGES: ioBroker.Languages[] = ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn'];

/** The module of each component */
const ENTRIES: Record<ComponentName, string> = {
    'teltonika-devices': './src/TeltonikaDevices.tsx',
    'teltonika-ports': './src/TeltonikaPorts.tsx',
    'teltonika-person': './src/TeltonikaPerson.tsx',
    'teltonika-presence': './src/TeltonikaPresence.tsx',
};

/** The vis-2 widget of each component: the key of its label in the dictionaries (`visWidgetLabel`) */
const VIS_WIDGETS: Record<ComponentName, string> = {
    'teltonika-devices': 'TeltonikaDevices',
    'teltonika-ports': 'TeltonikaPorts',
    'teltonika-person': 'TeltonikaPerson',
    'teltonika-presence': 'TeltonikaPresence',
};

/** The devices widget of each component, whose label and description it takes over; the list has none */
const DEVICES_WIDGETS: Record<ComponentName, string | null> = {
    'teltonika-devices': 'TeltonikaDevicesComponent',
    'teltonika-ports': 'TeltonikaPortsComponent',
    'teltonika-person': 'TeltonikaPersonComponent',
    'teltonika-presence': null,
};

type Dictionary = Record<string, string>;

function readJson<T>(path: string): T {
    return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as T;
}

/**
 * The dictionaries of a native widget, by language
 *
 * @param folder the folder with `<lang>.json`
 */
function readDictionaries(folder: string): Record<string, Dictionary> {
    return Object.fromEntries(LANGUAGES.map(lang => [lang, readJson<Dictionary>(`${folder}/${lang}.json`)]));
}

const DEVICES_WORDS = readDictionaries('../src-devices/src/i18n');
const VIS_WORDS = readDictionaries('../src-widgets/src/i18n');

/**
 * A text in every language, or an error naming what is missing
 *
 * @param lookup the text in one language
 * @param what what it is, for the error
 */
function inAllLanguages(lookup: (lang: ioBroker.Languages) => string | undefined, what: string): Dictionary {
    const text: Dictionary = {};
    for (const lang of LANGUAGES) {
        const value = lookup(lang);
        if (!value) {
            throw new Error(`${what} has no text in "${lang}"`);
        }
        text[lang] = value;
    }
    return text;
}

/**
 * A word in every language: `telt_...` of the devices widgets, `wc_...` of `ownWords.ts`, else of the vis-2 widgets
 *
 * @param key the key in its dictionary
 */
function word(key: string): Dictionary {
    if (key.startsWith('telt_')) {
        return inAllLanguages(lang => DEVICES_WORDS[lang][key], `src-devices/src/i18n: "${key}"`);
    }
    if (key.startsWith('wc_')) {
        return inAllLanguages(lang => OWN_WORDS[key]?.[lang], `ownWords.ts: "${key}"`);
    }
    return inAllLanguages(lang => VIS_WORDS[lang][key], `src-widgets/src/i18n: "${key}"`);
}

/**
 * The words of the element, by language - only these are compiled into its module
 *
 * @param keys the words it shows
 */
function pickWords(keys: readonly string[]): Record<string, Dictionary> {
    const words = Object.fromEntries(keys.map(key => [key, word(key)]));
    return Object.fromEntries(
        LANGUAGES.map(lang => [lang, Object.fromEntries(keys.map(key => [key, words[key][lang]]))]),
    );
}

/**
 * The words of the native widgets for the manifest of one component
 *
 * @param name the component
 */
function readTexts(name: ComponentName): ManifestTexts {
    // vis-2 registers both dictionaries under its prefix, the words of the widget set win (src-widgets/src/translations.ts)
    const visKey = VIS_WIDGETS[name];
    const label = inAllLanguages(
        lang => VIS_WORDS[lang][visKey] || DEVICES_WORDS[lang][visKey],
        `the label "${visKey}" of the vis-2 widget`,
    );

    let description: WebComponentText;
    const devicesWidget = DEVICES_WIDGETS[name];
    if (devicesWidget) {
        const ioPackage = readJson<ioBroker.AdapterObject>('../io-package.json');
        const widget = ioPackage.common.deviceWidgets?.components.find(c => c.name === devicesWidget);
        if (!widget) {
            throw new Error(`io-package.json has no devices widget "${devicesWidget}"`);
        }
        // devices offers its own widget instead of the component only if the names are the same
        const deviceLabel = widget.label;
        inAllLanguages(lang => {
            const text = typeof deviceLabel === 'object' ? deviceLabel[lang] : undefined;
            if (text !== label[lang]) {
                throw new Error(
                    `io-package.json: the label of ${devicesWidget} must be "${label[lang]}" in "${lang}" like the vis-2 widget, not "${text}"`,
                );
            }
            return text;
        }, `io-package.json: the label of ${devicesWidget}`);
        const devicesDescription = widget.description;
        description = inAllLanguages(
            lang => (typeof devicesDescription === 'object' ? devicesDescription[lang] : undefined),
            `io-package.json: the description of ${devicesWidget}`,
        );
    } else {
        description = word('wc_presence_description');
    }

    return { name: label, description, devices: word, vis: word, own: word };
}

/**
 * Writes `<name>.json` next to the module, checked like a host checks it, and the icon of the presence list
 *
 * @param name the component
 */
function manifestFile(name: ComponentName): Plugin {
    return {
        name: 'teltonika-web-component-manifest',
        generateBundle() {
            let manifest;
            try {
                manifest = buildManifest(name, readTexts(name));
            } catch (e) {
                this.error(`${getManifestFile(name)}: ${(e as Error).message}`);
            }
            const problem = checkManifest(manifest);
            if (problem) {
                this.error(`${getManifestFile(name)}: ${problem}`);
            }
            if (manifest.module !== getModuleFile(name)) {
                this.error(`${getManifestFile(name)}: "module" must be "${getModuleFile(name)}"`);
            }
            this.emitFile({
                type: 'asset',
                fileName: getManifestFile(name),
                source: `${JSON.stringify(manifest, null, 4)}\n`,
            });
            if (manifest.icon === PRESENCE_ICON) {
                // the preview of the vis-2 widget; the other components take the icons of the devices widgets
                this.emitFile({
                    type: 'asset',
                    fileName: PRESENCE_ICON,
                    source: readFileSync(new URL('../src-widgets/public/img/prev_presence.svg', import.meta.url)),
                });
            }
        },
    };
}

export default ({ mode }: { mode: string }): UserConfig => {
    const name = COMPONENT_NAMES.find(component => component === mode);
    if (!name) {
        throw new Error(`Build one component at a time: vite build --mode <${COMPONENT_NAMES.join('|')}>`);
    }
    const reactImport = getReactImportPath(getModulePath(name));

    return {
        plugins: [react(), manifestFile(name)],
        define: {
            __TELT_WORDS__: JSON.stringify(pickWords(COMPONENT_WORDS[name])),
            'process.env.NODE_ENV': JSON.stringify('production'),
        },
        build: {
            target: 'es2022',
            outDir: './build',
            // the builds of all components write into the same folder: only the first one empties it
            emptyOutDir: name === COMPONENT_NAMES[0],
            lib: {
                entry: ENTRIES[name],
                formats: ['es'],
                fileName: (): string => getModuleFile(name),
            },
            rollupOptions: {
                external: [...REACT_SPECIFIERS],
                output: {
                    paths: Object.fromEntries(REACT_SPECIFIERS.map(specifier => [specifier, reactImport])),
                    // one file: a host imports exactly one URL
                    codeSplitting: false,
                    // library mode keeps whitespace for the bundler of a consumer; this module is loaded as it is
                    minify: true,
                },
            },
        },
    };
};
