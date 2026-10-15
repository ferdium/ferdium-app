import { runInNewContext } from 'node:vm';

import { notificationsClassDefinition } from '../../src/webview/notifications';

interface TestNotification extends EventTarget {
  title: string;
  body: string;
  data: unknown;
  tag: string;
  onclick: ((event: Event) => void) | null;
}

interface TestWindow {
  ferdium: { displayNotification: jest.Mock };
  ServiceWorkerRegistration: {
    prototype: {
      showNotification: (
        title: string,
        options?: Record<string, unknown>,
      ) => Promise<void>;
    };
  };
  Notification: new (
    title: string,
    options?: Record<string, unknown>,
  ) => TestNotification;
  navigator: {
    serviceWorker: {
      controller: { postMessage: jest.Mock };
      dispatchEvent: jest.Mock;
    };
  };
}

function installNotificationShim() {
  let resolveClick: (() => void) | undefined;
  const displayNotification = jest.fn(
    () =>
      new Promise<void>(resolve => {
        resolveClick = resolve;
      }),
  );

  class NativeNotification extends EventTarget implements TestNotification {
    title = '';

    body = '';

    data: unknown = null;

    tag = '';

    onclick = null;
  }

  const window: TestWindow = {
    ferdium: { displayNotification },
    ServiceWorkerRegistration: {
      prototype: {
        showNotification: async () => {},
      },
    },
    Notification: NativeNotification,
    navigator: {
      serviceWorker: {
        controller: { postMessage: jest.fn() },
        dispatchEvent: jest.fn(),
      },
    },
  };

  runInNewContext(
    `"use strict"; (() => { ${notificationsClassDefinition} })();`,
    {
      window,
      EventTarget,
      Event,
      MessageEvent,
      MessageChannel,
      Promise,
      String,
      Boolean,
      Object,
    },
  );

  return {
    displayNotification,
    triggerClick: () => {
      resolveClick?.();
    },
    window,
  };
}

describe('notificationsClassDefinition', () => {
  it('WrapNotification stores metadata and dispatches click event', async () => {
    let clicked = false;
    let clickEvent: Event | null = null;
    let onclickCalled = false;
    const { displayNotification, triggerClick, window } =
      installNotificationShim();

    const notif = new window.Notification('Test Title', {
      body: 'Test Body',
      data: { channelId: '123' },
      tag: 'test-tag',
    });

    expect(notif.title).toBe('Test Title');
    expect(notif.body).toBe('Test Body');
    expect(notif.data).toEqual({ channelId: '123' });
    expect(notif.tag).toBe('test-tag');

    notif.addEventListener('click', (e: Event) => {
      clicked = true;
      clickEvent = e;
    });
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    notif.onclick = () => {
      onclickCalled = true;
    };

    expect(displayNotification).toHaveBeenCalledWith('Test Title', {
      body: 'Test Body',
      data: { channelId: '123' },
      tag: 'test-tag',
    });

    triggerClick();
    await Promise.resolve();

    expect(clicked).toBe(true);
    expect(onclickCalled).toBe(true);
    expect(clickEvent).toBeDefined();
  });

  it('ServiceWorkerRegistration.prototype.showNotification returns Promise and forwards options', async () => {
    const { displayNotification, triggerClick, window } =
      installNotificationShim();
    const promise = window.ServiceWorkerRegistration.prototype.showNotification(
      'SW Title',
      { body: 'SW Body', data: { notificationBannerKey: 'k123' } },
    );

    expect(promise).toBeInstanceOf(Promise);

    expect(displayNotification).toHaveBeenCalledWith('SW Title', {
      body: 'SW Body',
      data: { notificationBannerKey: 'k123' },
    });

    triggerClick();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.navigator.serviceWorker.dispatchEvent).toHaveBeenCalled();
    expect(
      window.navigator.serviceWorker.controller.postMessage,
    ).toHaveBeenCalled();
  });
});
