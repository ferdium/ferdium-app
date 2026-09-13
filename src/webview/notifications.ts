import { ipcRenderer } from 'electron';

import { v4 as uuidV4 } from 'uuid';

const debug = require('../preload-safe-debug')('Ferdium:Notifications');

export class NotificationsHandler {
  onNotify = (data: { title: string; options: any; notificationId: string }) =>
    data;

  displayNotification(title: string, options: any) {
    return new Promise(resolve => {
      debug('New notification', title, options);

      const notificationId = uuidV4();

      ipcRenderer.sendToHost(
        'notification',
        this.onNotify({
          title,
          options,
          notificationId,
        }),
      );

      ipcRenderer.once(`notification-onclick:${notificationId}`, () => {
        resolve(true);
      });
    });
  }
}

export const notificationsClassDefinition = `(() => {
class WrapNotification extends EventTarget {
  static permission = 'granted';

  constructor(title = '', options = {}) {
    super();

    this._onclick = null;
    this._onclickListener = event => this._onclick?.call(this, event);

    // Keep the properties that notification click handlers commonly use.
    // In particular, services often store their destination in the data field.
    this.title = String(title);
    this.dir = options.dir || 'auto';
    this.lang = options.lang || '';
    this.body = options.body || '';
    this.tag = options.tag || '';
    this.icon = options.icon || '';
    this.badge = options.badge || '';
    this.image = options.image || '';
    this.data = options.data ?? null;
    this.timestamp = options.timestamp ?? Date.now();
    this.renotify = Boolean(options.renotify);
    this.silent = options.silent ?? null;
    this.requireInteraction = Boolean(options.requireInteraction);
    this.actions = Array.isArray(options.actions) ? options.actions : [];

    this._displayNotification(title, options);
  }

  _displayNotification(title, options) {
    window.ferdium
      .displayNotification(title, options)
      .then(() => {
        this.dispatchEvent(new Event('click'));
      });
  }

  static requestPermission(cb) {
    if (typeof cb === 'function') {
      cb(WrapNotification.permission);
    }
    return Promise.resolve(WrapNotification.permission);
  }

  onNotify(data) {
    return data;
  }

  close() {
    this.onclick = null;
  }

  set onclick(callback) {
    const hadClickHandler = typeof this._onclick === 'function';
    this._onclick = typeof callback === 'function' ? callback : null;

    if (!hadClickHandler && this._onclick) {
      this.addEventListener('click', this._onclickListener);
    } else if (hadClickHandler && !this._onclick) {
      this.removeEventListener('click', this._onclickListener);
    }
  }

  get onclick() {
    return this._onclick;
  }
}

  window.Notification = WrapNotification;

  // some sites use service workers for notifications, but electron doesn't support this
  // this is a monkey patch to redirect them to window.Notification instead
  window.ServiceWorkerRegistration.prototype.showNotification = function (
    title = '',
    options = {},
  ) {
    // passing all of options causes notifications to only appear sometimes
    // but the only option that actually matters is body
    new WrapNotification(title, { body: options.body });
  };
})();`;
