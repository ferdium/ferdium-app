import { ipcMain } from 'electron';
import { isDevMode } from '../../environment-remote';
import { isMac } from '../../environment';

const debug = require('../../preload-safe-debug')('Ferdium:ipcApi:dnd');

export default async () => {
  ipcMain.handle('get-dnd', async () => {
    // In dev mode, we don't want to check DND status because it's not available
    // TODO: This should be removed when we have a better way to handle this
    if (isDevMode) {
      return false;
    }
    if (!isMac) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
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
