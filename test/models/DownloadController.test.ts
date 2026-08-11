import type * as DownloadControllerModule from '../../src/models/DownloadController';

type Listener = (...args: any[]) => void;

type MockIpc = {
  emit: (channel: string, ...args: any[]) => void;
  listenerCount: (channel: string) => number;
  on: (channel: string, listener: Listener) => MockIpc;
  removeListener: (channel: string, listener: Listener) => MockIpc;
};

type MockDownloadItem = {
  cancelled: boolean;
  paused: boolean;
  addListener: (_eventName: 'updated', listener: Listener) => MockDownloadItem;
  cancel: () => void;
  emit: (eventName: string, ...args: any[]) => void;
  getFilename: () => string;
  getReceivedBytes: () => number;
  getSavePath: () => string;
  getState: () => string;
  getTotalBytes: () => number;
  getURL: () => string;
  isPaused: () => boolean;
  listenerCount: (eventName: string) => number;
  once: (_eventName: 'done', listener: Listener) => MockDownloadItem;
  pause: () => void;
  removeListener: (
    eventName: 'done' | 'updated',
    listener: Listener,
  ) => MockDownloadItem;
  resume: () => void;
};

type MockWebContents = {
  id: number;
  session: MockIpc;
  destroy: () => void;
  once: (eventName: 'destroyed', listener: Listener) => MockWebContents;
};

function createMockIpc(): MockIpc {
  const listeners = new Map<string, Listener[]>();

  const ipc: MockIpc = {
    on(channel, listener) {
      const channelListeners = listeners.get(channel) ?? [];
      channelListeners.push(listener);
      listeners.set(channel, channelListeners);
      return ipc;
    },
    removeListener(channel, listener) {
      const channelListeners = listeners.get(channel) ?? [];
      listeners.set(
        channel,
        channelListeners.filter(
          currentListener => currentListener !== listener,
        ),
      );
      return ipc;
    },
    emit(channel, ...args) {
      for (const listener of listeners.get(channel) ?? []) {
        listener(...args);
      }
    },
    listenerCount(channel) {
      return listeners.get(channel)?.length ?? 0;
    },
  };

  return ipc;
}

function mockElectron() {
  return {
    ipcRenderer: createMockIpc(),
  };
}

jest.mock('electron', mockElectron);

function mockDownloadControllerDebug() {
  return jest.fn();
}

jest.mock('../../src/preload-safe-debug', () => mockDownloadControllerDebug);

const { default: DownloadController } = jest.requireActual(
  '../../src/models/DownloadController',
) as typeof DownloadControllerModule;

function createActions() {
  return {
    addDownload: jest.fn(),
    updateDownload: jest.fn(),
    endedDownload: jest.fn(),
    removeDownload: jest.fn(),
  };
}

function createMockDownloadItem(filename: string): MockDownloadItem {
  const listeners = new Map<string, Listener[]>();

  const item: MockDownloadItem = {
    paused: false,
    cancelled: false,
    getFilename() {
      return filename;
    },
    getURL() {
      return `https://example.test/${filename}`;
    },
    getSavePath() {
      return item.cancelled ? '' : `C:\\Downloads\\${filename}`;
    },
    getReceivedBytes() {
      return 50;
    },
    getTotalBytes() {
      return 100;
    },
    isPaused() {
      return item.paused;
    },
    pause() {
      item.paused = true;
    },
    resume() {
      item.paused = false;
    },
    cancel() {
      item.cancelled = true;
    },
    getState() {
      return item.paused ? 'paused' : 'progressing';
    },
    addListener(_eventName, listener) {
      const eventListeners = listeners.get('updated') ?? [];
      eventListeners.push(listener);
      listeners.set('updated', eventListeners);
      return item;
    },
    once(_eventName, listener) {
      const wrappedListener: Listener = (...args) => {
        item.removeListener('done', wrappedListener);
        listener(...args);
      };
      const eventListeners = listeners.get('done') ?? [];
      eventListeners.push(wrappedListener);
      listeners.set('done', eventListeners);
      return item;
    },
    removeListener(eventName, listener) {
      const eventListeners = listeners.get(eventName) ?? [];
      listeners.set(
        eventName,
        eventListeners.filter(currentListener => currentListener !== listener),
      );
      return item;
    },
    emit(eventName, ...args) {
      for (const listener of listeners.get(eventName) ?? []) {
        listener(...args);
      }
    },
    listenerCount(eventName) {
      return listeners.get(eventName)?.length ?? 0;
    },
  };

  return item;
}

function createMockWebContents(id: number, session: MockIpc): MockWebContents {
  const listeners = new Map<string, Listener[]>();

  const webContents: MockWebContents = {
    id,
    session,
    once(eventName, listener) {
      const eventListeners = listeners.get(eventName) ?? [];
      eventListeners.push(listener);
      listeners.set(eventName, eventListeners);
      return webContents;
    },
    destroy() {
      for (const listener of listeners.get('destroyed') ?? []) {
        listener();
      }
      listeners.set('destroyed', []);
    },
  };

  return webContents;
}

function createController() {
  const ipc = createMockIpc();
  const actions = createActions();
  let nextId = 0;
  const controller = new DownloadController({
    ipc,
    createDownloadId: () => {
      nextId += 1;
      return `download-${nextId}`;
    },
    getAppActions: () => actions,
  });

  return { actions, controller, ipc };
}

describe('DownloadController', () => {
  it('keeps one IPC listener per download command while tracking many downloads', () => {
    const { controller, ipc } = createController();
    const items = Array.from({ length: 100 }, (_, index) =>
      createMockDownloadItem(`file-${index}.txt`),
    );

    for (const item of items) {
      controller.trackDownload({
        item,
        serviceId: 'service-id',
      });
    }

    expect(ipc.listenerCount('toggle-pause-download')).toBe(1);
    expect(ipc.listenerCount('stop-download')).toBe(1);
    expect(controller.activeDownloadCount).toBe(100);
  });

  it.each(['completed', 'cancelled', 'interrupted', 'failed'])(
    'removes downloads and item listeners after %s terminal state',
    state => {
      const { actions, controller } = createController();
      const item = createMockDownloadItem(`${state}.txt`);
      const downloadId = controller.trackDownload({
        item,
        serviceId: 'service-id',
      });

      expect(controller.activeDownloadCount).toBe(1);
      expect(item.listenerCount('updated')).toBe(1);

      item.emit('done', {}, state);

      expect(controller.activeDownloadCount).toBe(0);
      expect(item.listenerCount('updated')).toBe(0);
      expect(actions.endedDownload).toHaveBeenCalledWith({
        id: downloadId,
        serviceId: 'service-id',
        receivedBytes: 50,
        totalBytes: 100,
        state,
      });
    },
  );

  it('pauses, resumes, and cancels only requested active downloads', () => {
    const { actions, controller, ipc } = createController();
    const first = createMockDownloadItem('first.txt');
    const second = createMockDownloadItem('second.txt');
    const firstId = controller.trackDownload({
      item: first,
      serviceId: 'service-id',
    });
    controller.trackDownload({
      item: second,
      serviceId: 'service-id',
    });

    ipc.emit('toggle-pause-download', {}, { downloadId: firstId });

    expect(first.isPaused()).toBe(true);
    expect(second.isPaused()).toBe(false);
    expect(actions.updateDownload).toHaveBeenLastCalledWith({
      id: firstId,
      paused: true,
    });

    ipc.emit('toggle-pause-download', {}, { downloadId: firstId });
    ipc.emit('stop-download', {}, { downloadId: firstId });

    expect(first.isPaused()).toBe(false);
    expect(first.cancelled).toBe(true);
    expect(second.cancelled).toBe(false);
  });

  it('registers one download listener for webContents sharing a session', () => {
    const { actions, controller } = createController();
    const session = createMockIpc();
    const firstWebContents = createMockWebContents(1, session);
    const secondWebContents = createMockWebContents(2, session);
    const event = { preventDefault: jest.fn() };
    const item = createMockDownloadItem('shared-session.txt');

    controller.registerWebContents({
      serviceId: 'first-service',
      webContents: firstWebContents,
    });
    controller.registerWebContents({
      serviceId: 'second-service',
      webContents: secondWebContents,
    });

    expect(session.listenerCount('will-download')).toBe(1);
    expect(controller.registeredSessionCount).toBe(1);

    session.emit('will-download', event, item, secondWebContents);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(actions.addDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'download-1',
        serviceId: 'second-service',
      }),
    );
  });

  it('registers separate download listeners for separate custom sessions', () => {
    const { actions, controller } = createController();
    const firstSession = createMockIpc();
    const secondSession = createMockIpc();
    const firstWebContents = createMockWebContents(1, firstSession);
    const secondWebContents = createMockWebContents(2, secondSession);

    controller.registerWebContents({
      serviceId: 'first-service',
      webContents: firstWebContents,
    });
    controller.registerWebContents({
      serviceId: 'second-service',
      webContents: secondWebContents,
    });

    expect(firstSession.listenerCount('will-download')).toBe(1);
    expect(secondSession.listenerCount('will-download')).toBe(1);
    expect(controller.registeredSessionCount).toBe(2);

    firstSession.emit(
      'will-download',
      { preventDefault: jest.fn() },
      createMockDownloadItem('first-custom.txt'),
      firstWebContents,
    );
    secondSession.emit(
      'will-download',
      { preventDefault: jest.fn() },
      createMockDownloadItem('second-custom.txt'),
      secondWebContents,
    );

    expect(actions.addDownload).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ serviceId: 'first-service' }),
    );
    expect(actions.addDownload).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ serviceId: 'second-service' }),
    );
  });

  it('uses the service ID value rather than retaining a service object', () => {
    const { actions, controller } = createController();
    const session = createMockIpc();
    const webContents = createMockWebContents(1, session);
    const service = { id: 'service-before-mutation' };

    controller.registerWebContents({
      serviceId: service.id,
      webContents,
    });

    service.id = 'service-after-mutation';
    session.emit(
      'will-download',
      { preventDefault: jest.fn() },
      createMockDownloadItem('lightweight-service-id.txt'),
      webContents,
    );

    expect(actions.addDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: 'service-before-mutation',
      }),
    );
  });
});
