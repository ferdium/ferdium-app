import { ipcMain } from 'electron';
import { isMac } from '../../environment';

const { getDoNotDisturb } = require('macos-notification-state');

const debug = require('debug')('Ferdi:ipcApi:dnd');

export default async () => {
  ipcMain.handle('get-dnd', async () => {
    if (!isMac) {
      return false;
    }

    try {
      const isDND = getDoNotDisturb();
      debug('Fetching DND state, set to', isDND);
      return isDND;
    } catch (error) {
      console.error(error);
      return false;
    }
  });
};
