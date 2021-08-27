import { ipcRenderer } from 'electron';

const debug = require('debug')('Ferdi:Plugin:BadgeHandler');

export class BadgeHandler {
  countCache: { direct: number; indirect: number; };

  constructor() {
    this.countCache = {
      direct: 0,
      indirect: 0,
    };
  }

  _normalizeNumber(count: string | number) {
    // Parse number to integer
    // This will correct errors that recipes may introduce, e.g.
    // by sending a String instead of an integer
    const parsedNumber = parseInt(count.toString(), 10);
    const adjustedNumber = Number.isNaN(parsedNumber) ? 0 : parsedNumber;
    return Math.max(adjustedNumber, 0);
  }

  setBadge(direct: string | number, indirect: string | number) {
    if (this.countCache.direct.toString() === direct.toString()
        && this.countCache.indirect.toString() === indirect.toString()) {
      return;
    }

    const count = {
      direct: this._normalizeNumber(direct),
      indirect: this._normalizeNumber(indirect),
    };

    debug('Sending badge count to host', count);
    ipcRenderer.sendToHost('message-counts', count);

    Object.assign(this.countCache, count);
  }
}
