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
class WrapNotification {
  
  static permission = 'granted';

  constructor(title = '', options = {}) {
    this._onclick = null;
    this._displayNotification(title, options);
  }

  _displayNotification(title, options) {
    window.ferdium
      .displayNotification(title, options)
      .then((value) => {  
        // When clicked, the assigned onclick will execute
        if (this._onclick)
        {
          this._onclick();
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
      // Clean-up
      this._onclick = null
    }
  }

  // Monkey-patching the onclick setter method
  set onclick(callback) {
    this._onclick = callback;
  }
}

  // Copy prototype of the original Notification object before monkey-patch
  const OriginalNotification = window.Notification;
  Object.setPrototypeOf(WrapNotification.prototype, OriginalNotification.prototype);
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
