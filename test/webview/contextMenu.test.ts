type ContextMenuHandler = (
  event: unknown,
  props: Electron.ContextMenuParams,
) => Promise<void>;

describe('service context menu', () => {
  let contextMenuHandler!: ContextMenuHandler;
  let buildMenuForElement!: jest.Mock;
  let popup!: jest.Mock;
  let setupContextMenu!: typeof import('../../src/webview/contextMenu').default;

  beforeEach(() => {
    jest.resetModules();

    popup = jest.fn();
    buildMenuForElement = jest.fn().mockResolvedValue({ popup });

    const on = jest.fn((eventName: string, handler: ContextMenuHandler) => {
      if (eventName === 'context-menu') {
        contextMenuHandler = handler;
      }
    });

    jest.doMock('@electron/remote', () => ({
      getCurrentWebContents: () => ({ on }),
    }));
    jest.doMock('../../src/webview/contextMenuBuilder', () => ({
      ContextMenuBuilder: jest.fn().mockImplementation(() => ({
        buildMenuForElement,
      })),
    }));

    setupContextMenu = jest.requireActual<
      typeof import('../../src/webview/contextMenu')
    >('../../src/webview/contextMenu').default;
  });

  afterEach(() => {
    jest.dontMock('@electron/remote');
    jest.dontMock('../../src/webview/contextMenuBuilder');
  });

  async function initializeContextMenu() {
    await setupContextMenu(
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
    );
  }

  it('associates the popup with the frame that invoked the context menu', async () => {
    await initializeContextMenu();
    const frame = {} as Electron.WebFrameMain;

    await contextMenuHandler({}, {
      frame,
      formControlType: 'input-password',
      isEditable: true,
    } as unknown as Electron.ContextMenuParams);

    expect(buildMenuForElement.mock.calls[0][0].frame).toBe(frame);
    expect(popup).toHaveBeenCalledWith({ frame });
  });

  it('falls back safely when Electron does not provide a frame', async () => {
    await initializeContextMenu();

    await contextMenuHandler({}, {
      frame: null,
    } as unknown as Electron.ContextMenuParams);

    expect(popup).toHaveBeenCalledWith();
  });
});
