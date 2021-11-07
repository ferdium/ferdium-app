import { ipcMain } from 'electron';
import doNotDisturb from '@sindresorhus/do-not-disturb';
import { isMac } from '../../environment';

const debug = require('debug')('Ferdi:ipcApi:dnd');

export default async () => {
  ipcMain.handle('get-dnd', async () => {
    if (!isMac) {
      return false;
    }

    try {
      const isDND = await doNotDisturb.isEnabled();
      debug('Fetching DND state, set to', isDND);
      return isDND;
    } catch (error) {
      console.error(error);
      return false;
    }
  });
};
