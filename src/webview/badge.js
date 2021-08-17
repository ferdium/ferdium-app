const { ipcRenderer } = require('electron');

const debug = require('debug')('Ferdi:Plugin:BadgeHandler');

export class BadgeHandler {
  constructor() {
    this.countCache = {
      direct: 0,
      indirect: 0,
    };
  }

  _normalizeNumber(count) {
    // Parse number to integer
    // This will correct errors that recipes may introduce, e.g.
    // by sending a String instead of an integer
    const parsedNumber = parseInt(count, 10);
    const adjustedNumber = Number.isNaN(parsedNumber) ? 0 : parsedNumber;
    return Math.max(adjustedNumber, 0);
  }

  setBadge(direct, indirect) {
    if (this.countCache.direct === direct
        && this.countCache.indirect === indirect) return;

    const count = {
      direct: this._normalizeNumber(direct),
      indirect: this._normalizeNumber(indirect),
    };

    ipcRenderer.sendToHost('message-counts', count);
    Object.assign(this.countCache, count);

    debug('Sending badge count to host', count);
  }
}
