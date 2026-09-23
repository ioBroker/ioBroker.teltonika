// Words of the widget set, registered by vis-2 under the `telt_` prefix.
//
// vis-2 prefixes every key that does not start with the prefix already. The shared views look their words up as
// `telt_…`, exactly as the devices app registers them, so their dictionary is merged in unchanged; the words of
// the vis-2 settings come without the prefix and get it from vis-2.

import devicesEn from '@teltonika/i18n/en.json';
import devicesDe from '@teltonika/i18n/de.json';
import devicesRu from '@teltonika/i18n/ru.json';
import devicesPt from '@teltonika/i18n/pt.json';
import devicesNl from '@teltonika/i18n/nl.json';
import devicesFr from '@teltonika/i18n/fr.json';
import devicesIt from '@teltonika/i18n/it.json';
import devicesEs from '@teltonika/i18n/es.json';
import devicesPl from '@teltonika/i18n/pl.json';
import devicesUk from '@teltonika/i18n/uk.json';
import devicesZhCn from '@teltonika/i18n/zh-cn.json';

import en from './i18n/en.json';
import de from './i18n/de.json';
import ru from './i18n/ru.json';
import pt from './i18n/pt.json';
import nl from './i18n/nl.json';
import fr from './i18n/fr.json';
import it from './i18n/it.json';
import es from './i18n/es.json';
import pl from './i18n/pl.json';
import uk from './i18n/uk.json';
import zhCn from './i18n/zh-cn.json';

const translations = {
    en: { ...devicesEn, ...en },
    de: { ...devicesDe, ...de },
    ru: { ...devicesRu, ...ru },
    pt: { ...devicesPt, ...pt },
    nl: { ...devicesNl, ...nl },
    fr: { ...devicesFr, ...fr },
    it: { ...devicesIt, ...it },
    es: { ...devicesEs, ...es },
    pl: { ...devicesPl, ...pl },
    uk: { ...devicesUk, ...uk },
    'zh-cn': { ...devicesZhCn, ...zhCn },
    prefix: 'telt_',
};

export default translations;
