// What the widget set takes from `@iobroker/gui-components`: `I18n`, nothing else.
//
// vis-2 does not share gui-components, so every widget set bundles its own copy, and the package's entry drags in
// far more than tree-shaking can remove again. `I18n` has no imports of its own, and a second copy is harmless: it
// keeps the dictionary and the language on `window`, shared by every copy. The build points the bare package name
// here (see `vite.config.ts`), so importing anything else from it fails the build instead of bloating it.

export { I18n } from '@iobroker/gui-components/build/i18n.js';
