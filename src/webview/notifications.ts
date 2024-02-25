// eslint-disable-next-line max-classes-per-file
import { ipcRenderer } from 'electron';

import { v4 as uuidV4 } from 'uuid';

const debug = require('../preload-safe-debug')('Ferdium:Notifications');

export class NotificationsHandler {
  onNotify = (data: any) => data;

  displayNotification(title: string, options: string) {
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

class FerdiumNotification extends window.Notification {
  static permission: NotificationPermission = 'granted';

  title: string;

  options: any;

  constructor(title = '', options = {}) {
    super(title, options);
    this.title = title;
    this.options = options as { onClick?: () => void };
    try {
      window.ferdium.displayNotification(title, options).then(() => {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      });
    } catch {
      this.options.onClick = null;
      window.ferdium.displayNotification(title, options).then(() => {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      });
    }
  }

  static requestPermission(cb: any = null) {
    if (!cb) {
      return Promise.resolve(Notification.permission);
    }

    if (typeof cb === 'function') {
      return cb(Notification.permission);
    }

    return Notification.permission;
  }

  onNotify(data) {
    return data;
  }

  onClick() {}

  close() {}
}

export const notificationInject = (() => {
  window.Notification = FerdiumNotification;
})();
