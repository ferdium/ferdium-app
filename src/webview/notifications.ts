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
class Notification {
  static permission = 'granted';

  constructor(title = '', options = {}) {
    window.ferdium.displayNotification(title, options).then(() => {
      // TODO: After several tries, we couldn't find a way to trigger the native notification onclick event.
      // This was needed so that user could go to the specific context when clicking on the notification (it only goes to the service now).
      // For now, we don't do anything here
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
