import { ipcRenderer } from 'electron';
import { safeParseInt } from '../jsUtils';

const debug = require('../preload-safe-debug')('Ferdium:Plugin:BadgeHandler');

export default class BadgeHandler {
  setBadge(
    direct: string | number | undefined | null,
    indirect: string | number | undefined | null,
  ) {
    const count = {
      direct: safeParseInt(direct),
      indirect: safeParseInt(indirect),
    };

    debug('Sending badge count to host: %j', count);
    ipcRenderer.sendToHost('message-counts', count);
  }
}
