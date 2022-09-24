import { ipcMain } from 'electron';

import LanguageDetect from 'languagedetect';

const debug = require('../../preload-safe-debug')(
  'Ferdium:ipcApi:languageDetect',
);

export default async () => {
  ipcMain.handle('detect-language', async (_event, { sample }) => {
    if (!LanguageDetect) {
      return null;
    }
    const langDetector = new LanguageDetect();
    langDetector.setLanguageType('iso2');
    debug('Checking language for sample:', sample);
    const result = langDetector.detect(sample, 1);
    debug('Language detection result:', result);
    return result[0][0];
  });
};
