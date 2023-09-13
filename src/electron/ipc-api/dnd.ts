import { ipcMain } from 'electron';
import { isMac } from '../../environment';

const debug = require('../../preload-safe-debug')('Ferdium:ipcApi:dnd');

export default async () => {
  ipcMain.handle('get-dnd', async () => {
    if (!isMac) {
      return false;
    }

    const { getDoNotDisturb } = await import('macos-notification-state');

    if (!getDoNotDisturb) {
      debug("Could not load 'macos-notification-state' module");
      return false;
    }

    try {
      const isDND = await getDoNotDisturb();
      debug('Fetching DND state, set to', isDND);
      return isDND;
    } catch (error) {
      console.error(error);
      return false;
    }
  });
};
