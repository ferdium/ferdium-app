import { action, makeObservable, observable } from 'mobx';
import type WebControlsScreenClass from '../../../../src/features/webControls/containers/WebControlsScreen';

const URL_EVENTS = [
  'load-commit',
  'will-navigate',
  'did-navigate',
  'did-navigate-in-page',
];

type Listener = (...args: any[]) => void;

type MockWebview = {
  addEventListener: jest.Mock;
  canGoBack: jest.Mock;
  canGoForward: jest.Mock;
  emit: (eventName: string, ...args: any[]) => void;
  getURL: jest.Mock;
  goBack: jest.Mock;
  goForward: jest.Mock;
  goToIndex: jest.Mock;
  listenerCount: (eventName: string) => number;
  loadURL: jest.Mock;
  reload: jest.Mock;
  removeEventListener: jest.Mock;
};

class TestService {
  @observable isAttached = false;

  @observable.ref webview: MockWebview | null = null;

  constructor() {
    makeObservable(this);
  }

  @action attach(webview: MockWebview): void {
    this.webview = webview;
    this.isAttached = true;
  }

  @action detach(): void {
    this.isAttached = false;
    this.webview = null;
  }
}

function mockInject() {
  return function injectDecorator<T>(component: T): T {
    return component;
  };
}

function mockObserver<T>(component: T): T {
  return component;
}

function createMockWebview(url = 'https://example.com'): MockWebview {
  const listeners = new Map<string, Listener[]>();

  return {
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      const eventListeners = listeners.get(eventName) ?? [];
      eventListeners.push(listener);
      listeners.set(eventName, eventListeners);
    }),
    canGoBack: jest.fn(() => true),
    canGoForward: jest.fn(() => false),
    emit(eventName, ...args) {
      for (const listener of listeners.get(eventName) ?? []) {
        listener(...args);
      }
    },
    getURL: jest.fn(() => url),
    goBack: jest.fn(),
    goForward: jest.fn(),
    goToIndex: jest.fn(),
    listenerCount(eventName: string) {
      return listeners.get(eventName)?.length ?? 0;
    },
    loadURL: jest.fn(),
    reload: jest.fn(),
    removeEventListener: jest.fn((eventName: string, listener: Listener) => {
      const eventListeners = listeners.get(eventName) ?? [];
      listeners.set(
        eventName,
        eventListeners.filter(currentListener => currentListener !== listener),
      );
    }),
  };
}

function createProps(service: TestService) {
  return {
    actions: {
      app: {
        openExternalUrl: jest.fn(),
      },
    },
    service,
    stores: {
      settings: {
        app: {
          searchEngine: 'google',
        },
      },
    },
  };
}

jest.mock('mobx-react', () => ({
  inject: mockInject,
  observer: mockObserver,
}));
jest.mock(
  '../../../../src/features/webControls/components/WebControls',
  () => 'WebControls',
);

const WebControlsScreen = jest.requireActual<
  typeof import('../../../../src/features/webControls/containers/WebControlsScreen')
>('../../../../src/features/webControls/containers/WebControlsScreen').default;

describe('WebControlsScreen', () => {
  it('moves URL listeners from old webview to replacement webview', () => {
    const service = new TestService();
    const component = new WebControlsScreen(
      createProps(service) as any,
    ) as WebControlsScreenClass;
    const firstWebview = createMockWebview('https://first.example');
    const secondWebview = createMockWebview('https://second.example');

    component.componentDidMount();
    service.attach(firstWebview);
    service.attach(secondWebview);

    for (const eventName of URL_EVENTS) {
      expect(firstWebview.listenerCount(eventName)).toBe(0);
      expect(secondWebview.listenerCount(eventName)).toBe(1);
    }
    expect(component.url).toBe('https://second.example');
  });

  it('does not duplicate URL listeners for the same webview', () => {
    const service = new TestService();
    const component = new WebControlsScreen(
      createProps(service) as any,
    ) as WebControlsScreenClass;
    const webview = createMockWebview();

    component.componentDidMount();
    service.attach(webview);
    service.attach(webview);

    for (const eventName of URL_EVENTS) {
      expect(webview.listenerCount(eventName)).toBe(1);
    }
  });

  it('removes URL listeners when the service detaches', () => {
    const service = new TestService();
    const component = new WebControlsScreen(
      createProps(service) as any,
    ) as WebControlsScreenClass;
    const webview = createMockWebview();

    component.componentDidMount();
    service.attach(webview);
    service.detach();

    for (const eventName of URL_EVENTS) {
      expect(webview.listenerCount(eventName)).toBe(0);
    }
  });

  it('removes URL listeners on unmount', () => {
    const service = new TestService();
    const component = new WebControlsScreen(
      createProps(service) as any,
    ) as WebControlsScreenClass;
    const webview = createMockWebview();

    component.componentDidMount();
    service.attach(webview);
    component.componentWillUnmount();

    for (const eventName of URL_EVENTS) {
      expect(webview.listenerCount(eventName)).toBe(0);
    }
  });

  it('updates URL and navigation state from main-frame navigation events', () => {
    const service = new TestService();
    const component = new WebControlsScreen(
      createProps(service) as any,
    ) as WebControlsScreenClass;
    const webview = createMockWebview();

    component.componentDidMount();
    service.attach(webview);
    webview.emit('did-navigate', {
      isMainFrame: true,
      url: 'https://example.com/inbox',
    });

    expect(component.url).toBe('https://example.com/inbox');
    expect(component.canGoBack).toBe(true);
    expect(component.canGoForward).toBe(false);
  });
});
