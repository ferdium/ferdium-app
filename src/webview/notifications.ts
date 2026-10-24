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
// Changed the class name for clarity purpose
class WrapNotification extends EventTarget {
  static permission = 'granted';

  constructor(title = '', options = {}) {
    super();
    this.title = String(title);
    this.body = typeof options.body === 'string' ? options.body : '';
    this.data = options.data;
    this.tag = typeof options.tag === 'string' ? options.tag : '';
    this.icon = typeof options.icon === 'string' ? options.icon : '';
    this.dir = typeof options.dir === 'string' ? options.dir : 'auto';
    this.lang = typeof options.lang === 'string' ? options.lang : '';
    this.silent = Boolean(options.silent);
    this._onclick = null;
    this._notification = this;

    this._displayNotification(title, options);
  }

  _displayNotification(title, options) {
    window.ferdium
      .displayNotification(title, options)
      .then(() => {
        const event = new Event('click');
        this.dispatchEvent(event);
        if (typeof this._onclick === 'function') {
          this._onclick.call(this, event);
        }
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
    if (this._notification) {
      this._notification = null;
      this._onclick = null;
    }
  }

  get onclick() {
    return this._onclick;
  }

  set onclick(callback) {
    this._onclick = callback;
  }
}

  const OriginalNotification = window.Notification;
  Object.setPrototypeOf(WrapNotification.prototype, OriginalNotification.prototype);
  window.Notification = WrapNotification;

  window.ServiceWorkerRegistration.prototype.showNotification = function (
    title = '',
    options = {},
  ) {
    const notif = new WrapNotification(title, options);

    notif.addEventListener('click', () => {
      const bannerKey = options?.data?.notificationBannerKey;
      if (bannerKey && window.navigator.serviceWorker?.controller) {
        try {
          const channel = new MessageChannel();
          const event = new Event('message');
          Object.assign(event, {
            data: { action: 'NOTIFICATION_BANNER_CLICKED', bannerKey },
            ports: [channel.port2],
            source: window.navigator.serviceWorker.controller,
          });
          window.navigator.serviceWorker.dispatchEvent(event);
        } catch {}
      }

      if (window.navigator.serviceWorker?.controller) {
        try {
          window.navigator.serviceWorker.controller.postMessage({
            type: 'NOTIFICATION_CLICK',
            notification: {
              title,
              body: options?.body,
              data: options?.data,
              tag: options?.tag,
            },
          });
        } catch {}
      }
    });

    return Promise.resolve();
  };
})();`;
