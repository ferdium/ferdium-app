import type * as DownloadIpcModule from '../../../src/electron/ipc-api/download';

type Listener = (...args: any[]) => unknown;

const ipcListeners = new Map<string, Listener>();

const focusedWindow = { webContents: { id: 1 } };

function mockElectron() {
  return {
    BrowserWindow: {
      getFocusedWindow: () => focusedWindow,
    },
    dialog: {
      showOpenDialog: jest.fn(),
      showSaveDialog: jest.fn(),
    },
    ipcMain: {
      handle: jest.fn(),
      on(channel: string, listener: Listener) {
        ipcListeners.set(channel, listener);
      },
    },
  };
}

jest.mock('electron', mockElectron);

const mockDownload = jest.fn();

function mockElectronDl() {
  return {
    download: (...args: unknown[]) => mockDownload(...args),
  };
}

jest.mock('electron-dl', mockElectronDl);

function mockDownloadDebug() {
  return jest.fn();
}

jest.mock('../../../src/preload-safe-debug', () => mockDownloadDebug);

const { default: registerDownloadIpc } = jest.requireActual(
  '../../../src/electron/ipc-api/download',
) as typeof DownloadIpcModule;

describe('download-file', () => {
  beforeEach(() => {
    ipcListeners.clear();
    mockDownload.mockReset();
    mockDownload.mockResolvedValue({ savePath: '/Downloads/unnamed.png' });
    registerDownloadIpc({ mainWindow: {} as any });
  });

  it('downloads through the webContents that requested it', async () => {
    // A service webview lives in its own session partition; Google Chat
    // attachment URLs only resolve to the image with that session's cookies.
    const serviceWebContents = { id: 42 };
    const url =
      'https://chat.google.com/u/0/api/get_attachment_url?attachment_token=abc';

    await ipcListeners.get('download-file')!(
      { sender: serviceWebContents },
      { url, fileOptions: { name: 'get_attachment_url' } },
    );

    expect(mockDownload).toHaveBeenCalledTimes(1);
    const [target, requestedUrl] = mockDownload.mock.calls[0];
    expect(target.webContents).toBe(serviceWebContents);
    expect(requestedUrl).toBe(url);
  });
});
