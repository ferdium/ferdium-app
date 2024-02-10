import { ipcRenderer, clipboard } from 'electron';

import { v4 as uuidV4 } from 'uuid';

const debug = require('../preload-safe-debug')('Ferdium:Notifications');

export class NotificationsHandler {
  onNotify = (data: { title: string; options: any; notificationId: string }) =>
    data;

  displayNotification(title: string, options: any) {
    return new Promise(resolve => {
      debug('New notification', title, options);

      const notificationId = uuidV4();

      const { twoFactorAutoCatcher, twoFactorAutoCatcherArray } =
        window['ferdium'].stores.settings.app;

      debug(
        'Settings for catch tokens',
        twoFactorAutoCatcher,
        twoFactorAutoCatcherArray,
      );

      if (twoFactorAutoCatcher) {
        /*
          parse the token digits from sms body, find "token" or "code" in options.body which reflect the sms content
          ---
          Token: 03624 / SMS-Code = PIN Token
          ---
          Prüfcode 010313 für Microsoft-Authentifizierung verwenden.
          ---
          483133 is your GitHub authentication code. @github.com #483133
          ---
          eBay: Ihr Sicherheitscode lautet 080090. \nEr läuft in 15 Minuten ab. Geben Sie den Code nicht an andere weiter.
          ---
          PayPal: Ihr Sicherheitscode lautet: 989605. Geben Sie diesen Code nicht weiter.
        */

        const rawBody = options.body;
        const { 0: token } = /\d{5,6}/.exec(options.body) || [];

        const wordsToCatch = twoFactorAutoCatcherArray
          .replaceAll(', ', ',')
          .split(',');

        debug('wordsToCatch', wordsToCatch);

        if (
          token &&
          wordsToCatch.some(a =>
            options.body.toLowerCase().includes(a.toLowerCase()),
          )
        ) {
          // with the extra "+ " it shows its copied to clipboard in the notification
          options.body = `+ ${rawBody}`;
          clipboard.writeText(token);
          debug('Token parsed and copied to clipboard');
        }
      }

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
      try {
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
