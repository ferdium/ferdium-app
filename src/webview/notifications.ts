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
class Notification extends window.Notification {
  static permission = 'granted';

  constructor(title = '', options = {}) {
    super(title, options);
    window.ferdium.displayNotification(title, options).then(() => {
      // Continue to dispatch the event to the original Notification class
      super.dispatchEvent(new Event('click'));
    });
  }

  static requestPermission(cb) {
    if (typeof cb === 'function') {
      cb(Notification.permission);
    }

    return Promise.resolve(Notification.permission);
  }

  onNotify(data) {
    return data;
  }
}

  window.Notification = Notification;
})();`;
