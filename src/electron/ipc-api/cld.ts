import { ipcMain } from 'electron';
// @ts-ignore
import cld from 'cld';

const debug = require('debug')('ferdium:ipcApi:cld');

export default async () => {
  ipcMain.handle('detect-language', async (_event, { sample }) => {
    if (!cld) {
      return null;
    }
    try {
      const result = await cld.detect(sample);
      debug('Checking language', 'probability', result.languages);
      if (result.reliable) {
        debug(
          'Language detected reliably, setting spellchecker language to',
          result.languages[0].code,
        );

        return result.languages[0].code;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  });
};
