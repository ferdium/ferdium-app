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
      this.title = title;
      this.options = options;
      try{
        window.ferdium.displayNotification(title, options)
          .then(() => {
            if (typeof (this.onClick) === 'function') {
              this.onClick();
            }
          });
      } catch(error) {
	        this.options.onClick = null;
          window.ferdium.displayNotification(title, options)
            .then(() => {
              if (typeof (this.onClick) === 'function') {
                this.onClick();
              }
            });      
      }
    }

    static requestPermission(cb = null) {
      if (!cb) {
        return new Promise((resolve) => {
          resolve(Notification.permission);
        });
      }

      if (typeof (cb) === 'function') {
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

  window.Notification = Notification;
})();`;
