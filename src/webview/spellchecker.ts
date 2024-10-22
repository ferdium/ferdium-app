import { ipcRenderer } from 'electron';
import { isMac } from '../environment';
import { SPELLCHECKER_LOCALES } from '../i18n/languages';

const debug = require('../preload-safe-debug')('Ferdium:spellchecker');

export const getSpellcheckerLocaleByFuzzyIdentifier = (identifier: string) => {
  const locales = Object.keys(SPELLCHECKER_LOCALES).filter(
    key =>
      key.toLocaleLowerCase() === identifier.toLowerCase() ||
      key.split('-')[0] === identifier.toLowerCase(),
  );

  return locales.length > 0 ? locales[0] : null;
};

export const switchDict = (fuzzyLocale: string, serviceId: string) => {
  if (isMac) {
    debug('Ignoring dictionary changes on macOS');
    return;
  }

  debug(`Setting spellchecker locale from: ${fuzzyLocale}`);
  const locale = getSpellcheckerLocaleByFuzzyIdentifier(fuzzyLocale);
  if (locale) {
    debug(`Sending spellcheck locales to host: ${locale}`);
    ipcRenderer.send('set-spellchecker-locales', { locale, serviceId });
  }
};
