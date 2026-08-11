import type ServiceWebviewClass from '../../../../src/components/services/content/ServiceWebview';

type Listener = (...args: any[]) => void;

type MockWebviewElement = {
  addEventListener: jest.Mock;
  blur: jest.Mock;
  focus: jest.Mock;
  getTitle: jest.Mock;
  listenerCount: (eventName: string) => number;
  removeEventListener: jest.Mock;
};

function mockCreateDebugLogger() {
  return jest.fn();
}

function mockObserver<T>(component: T): T {
  return component;
}

function createMockWebviewElement(): MockWebviewElement {
  const listeners = new Map<string, Listener[]>();

  return {
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      const eventListeners = listeners.get(eventName) ?? [];
      eventListeners.push(listener);
      listeners.set(eventName, eventListeners);
    }),
    blur: jest.fn(),
    focus: jest.fn(),
    getTitle: jest.fn(() => 'Page Title'),
    listenerCount(eventName: string) {
      return listeners.get(eventName)?.length ?? 0;
    },
    removeEventListener: jest.fn((eventName: string, listener: Listener) => {
      const eventListeners = listeners.get(eventName) ?? [];
      listeners.set(
        eventName,
        eventListeners.filter(currentListener => currentListener !== listener),
      );
    }),
  };
}

function createMockWebview(view: MockWebviewElement) {
  return { view };
}

function createProps() {
  const service = {
    _webview: null,
    dialogTitle: '',
    id: 'service-a',
    isActive: false,
    name: 'Service A',
  };

  return {
    detachService: jest.fn(),
    isSpellcheckerEnabled: false,
    service,
    setWebviewReference: jest.fn(),
  };
}

jest.mock('mobx-react', () => ({
  observer: mockObserver,
}));
jest.mock('react-electron-web-view', () => 'webview');
jest.mock('../../../../src/preload-safe-debug', () => mockCreateDebugLogger);

const ServiceWebview = jest.requireActual<
  typeof import('../../../../src/components/services/content/ServiceWebview')
>('../../../../src/components/services/content/ServiceWebview').default;

describe('ServiceWebview', () => {
  it('moves webview listeners from old webview to replacement webview', () => {
    const component = new ServiceWebview(
      createProps() as any,
    ) as ServiceWebviewClass;
    const firstView = createMockWebviewElement();
    const secondView = createMockWebviewElement();

    component._setWebview(createMockWebview(firstView) as any);
    component._setWebview(createMockWebview(secondView) as any);

    expect(firstView.listenerCount('console-message')).toBe(0);
    expect(firstView.listenerCount('did-navigate')).toBe(0);
    expect(firstView.listenerCount('did-stop-loading')).toBe(0);
    expect(secondView.listenerCount('console-message')).toBe(1);
    expect(secondView.listenerCount('did-navigate')).toBe(1);
    expect(secondView.listenerCount('did-stop-loading')).toBe(1);
  });

  it('does not duplicate listeners when the same webview is set twice', () => {
    const component = new ServiceWebview(
      createProps() as any,
    ) as ServiceWebviewClass;
    const view = createMockWebviewElement();
    const webview = createMockWebview(view);

    component._setWebview(webview as any);
    component._setWebview(webview as any);

    expect(view.listenerCount('console-message')).toBe(1);
    expect(view.listenerCount('did-navigate')).toBe(1);
    expect(view.listenerCount('did-stop-loading')).toBe(1);
  });

  it('removes listeners and detaches service on unmount', () => {
    const props = createProps();
    const component = new ServiceWebview(props as any) as ServiceWebviewClass;
    const view = createMockWebviewElement();

    component._setWebview(createMockWebview(view) as any);
    component.componentWillUnmount();

    expect(view.listenerCount('console-message')).toBe(0);
    expect(view.listenerCount('did-navigate')).toBe(0);
    expect(view.listenerCount('did-stop-loading')).toBe(0);
    expect(props.detachService).toHaveBeenCalledWith({
      service: props.service,
    });
  });

  it('cancels a pending did-attach update on unmount', () => {
    jest.useFakeTimers();
    const props = createProps();
    const component = new ServiceWebview(props as any) as ServiceWebviewClass;

    component.handleDidAttach();
    component.componentWillUnmount();
    jest.runOnlyPendingTimers();

    expect(props.setWebviewReference).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
