import { runInNewContext } from 'node:vm';

import { notificationsClassDefinition } from '../../src/webview/notifications';

function NativeNotification() {}
function ServiceWorkerRegistration() {}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(promiseResolve => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function installNotificationsShim() {
  const notificationClick = deferred<boolean>();
  const displayNotification = jest.fn(() => notificationClick.promise);
  const window = {
    ferdium: { displayNotification },
    Notification: NativeNotification,
    ServiceWorkerRegistration,
  };

  runInNewContext(`"use strict"; ${notificationsClassDefinition}`, {
    Array,
    Boolean,
    Date,
    Event,
    EventTarget,
    Promise,
    String,
    window,
  });

  return {
    displayNotification,
    notificationClick,
    Notification: window.Notification as unknown as new (
      title?: string,
      options?: NotificationOptions,
    ) => Notification,
  };
}

describe('notifications shim', () => {
  it('forwards notifications to Ferdium', () => {
    const { displayNotification, Notification } = installNotificationsShim();
    const options = { body: 'New message' };

    const notification = new Notification('Slack', options);

    expect(notification).toBeDefined();
    expect(displayNotification).toHaveBeenCalledWith('Slack', options);
  });

  it('dispatches a click event to listeners', async () => {
    const { notificationClick, Notification } = installNotificationsShim();
    const notification = new Notification('Slack');
    const listener = jest.fn(function onClick(
      this: Notification,
      event: Event,
    ) {
      expect(this).toBe(notification);
      expect(event.type).toBe('click');
      expect(event.target).toBe(notification);
    });
    notification.addEventListener('click', listener);

    notificationClick.resolve(true);
    await notificationClick.promise;
    await Promise.resolve();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onclick with the notification and click event', async () => {
    const { notificationClick, Notification } = installNotificationsShim();
    const notification = new Notification('Discord', {
      data: { url: 'https://discord.com/channels/1/2' },
    });
    const onclick = jest.fn(function onClick(this: Notification, event: Event) {
      expect(this).toBe(notification);
      expect(event.target).toBe(notification);
      expect(this.data).toEqual({
        url: 'https://discord.com/channels/1/2',
      });
    });
    Reflect.set(notification, 'onclick', onclick);

    notificationClick.resolve(true);
    await notificationClick.promise;
    await Promise.resolve();

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('replaces and clears onclick handlers', async () => {
    const { notificationClick, Notification } = installNotificationsShim();
    const notification = new Notification('WhatsApp');
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    Reflect.set(notification, 'onclick', firstHandler);
    Reflect.set(notification, 'onclick', secondHandler);
    Reflect.set(notification, 'onclick', null);

    notificationClick.resolve(true);
    await notificationClick.promise;
    await Promise.resolve();

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).not.toHaveBeenCalled();
  });
});
