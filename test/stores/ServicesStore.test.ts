import type ServicesStoreClass from '../../src/stores/ServicesStore';

function mockCreateDebugLogger() {
  return jest.fn();
}

function mockFilterServicesByActiveWorkspace<T>(services: T): T {
  return services;
}

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    send: jest.fn(),
  },
  shell: {
    openExternal: jest.fn(),
  },
}));

jest.mock('../../src/environment-remote', () => ({
  ferdiumVersion: 'test-version',
  userDataRecipesPath: (...segments: string[]) => segments.join('/'),
}));

jest.mock('../../src/features/workspaces', () => ({
  workspaceStore: {
    filterServicesByActiveWorkspace: mockFilterServicesByActiveWorkspace,
  },
}));
jest.mock('../../src/preload-safe-debug', () => mockCreateDebugLogger);

const ServicesStore = jest.requireActual<
  typeof import('../../src/stores/ServicesStore')
>('../../src/stores/ServicesStore').default;

describe('ServicesStore', () => {
  it('clears UserAgent webview reference when detaching a service', () => {
    const store = Object.create(ServicesStore.prototype) as ServicesStoreClass;
    const userAgentModel = {
      setWebviewReference: jest.fn(),
    };
    const service = {
      isAttached: true,
      userAgentModel,
      webview: { id: 'webview' },
    };

    store._detachService({ service });

    expect(userAgentModel.setWebviewReference).toHaveBeenCalledWith(null);
    expect(service.webview).toBeNull();
    expect(service.isAttached).toBe(false);
  });
});
