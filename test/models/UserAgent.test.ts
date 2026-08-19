import UserAgent from '../../src/models/UserAgent';

function mockCreateDebugLogger() {
  return jest.fn();
}

jest.mock('../../src/preload-safe-debug', () => mockCreateDebugLogger);

type Listener = (...args: any[]) => void;

type MockWebview = {
  userAgent: string;
  addEventListener: jest.Mock;
  emit: (eventName: string, ...args: any[]) => void;
  listenerCount: (eventName: string) => number;
  removeEventListener: jest.Mock;
};

function createMockWebview(): MockWebview {
  const listeners = new Map<string, Listener[]>();

  const webview: MockWebview = {
    userAgent: '',
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      const eventListeners = listeners.get(eventName) ?? [];
      eventListeners.push(listener);
      listeners.set(eventName, eventListeners);
    }),
    removeEventListener: jest.fn((eventName: string, listener: Listener) => {
      const eventListeners = listeners.get(eventName) ?? [];
      listeners.set(
        eventName,
        eventListeners.filter(currentListener => currentListener !== listener),
      );
    }),
    emit(eventName, ...args) {
      for (const listener of listeners.get(eventName) ?? []) {
        listener(...args);
      }
    },
    listenerCount(eventName) {
      return listeners.get(eventName)?.length ?? 0;
    },
  };

  return webview;
}

describe('UserAgent', () => {
  it('moves navigation listener from old webview to replacement webview', () => {
    const userAgent = new UserAgent(() => 'Default User Agent');
    const firstWebview = createMockWebview();
    const secondWebview = createMockWebview();

    userAgent.setWebviewReference(firstWebview as any);
    userAgent.setWebviewReference(secondWebview as any);

    expect(firstWebview.addEventListener).toHaveBeenCalledTimes(1);
    expect(firstWebview.removeEventListener).toHaveBeenCalledTimes(1);
    expect(firstWebview.removeEventListener).toHaveBeenCalledWith(
      'did-navigate',
      firstWebview.addEventListener.mock.calls[0][1],
    );
    expect(firstWebview.listenerCount('did-navigate')).toBe(0);
    expect(secondWebview.addEventListener).toHaveBeenCalledTimes(1);
    expect(secondWebview.listenerCount('did-navigate')).toBe(1);
  });

  it('does not attach duplicate listeners for the same webview', () => {
    const userAgent = new UserAgent(() => 'Default User Agent');
    const webview = createMockWebview();

    userAgent.setWebviewReference(webview as any);
    userAgent.setWebviewReference(webview as any);

    expect(webview.addEventListener).toHaveBeenCalledTimes(1);
    expect(webview.removeEventListener).not.toHaveBeenCalled();
    expect(webview.listenerCount('did-navigate')).toBe(1);
  });

  it('removes listener and clears reference on detach', () => {
    const userAgent = new UserAgent(() => 'Default User Agent');
    const webview = createMockWebview();

    userAgent.setWebviewReference(webview as any);
    userAgent.setWebviewReference(null);

    expect(webview.removeEventListener).toHaveBeenCalledWith(
      'did-navigate',
      webview.addEventListener.mock.calls[0][1],
    );
    expect(webview.listenerCount('did-navigate')).toBe(0);
    expect(userAgent.webview).toBeNull();
  });
});
