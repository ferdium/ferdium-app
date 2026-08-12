import type { PathLike } from 'node:fs';
import type { OpenDialogOptions } from 'electron';
import { BrowserWindow, dialog, ipcMain } from 'electron';
import { download } from 'electron-dl';
import { writeFileSync } from 'fs-extra';

const debug = require('../../preload-safe-debug')('Ferdium:ipcApi:download');

const decodeBase64Image = (dataString: string) => {
  const matches = dataString.match(/^data:([+/A-Za-z-]+);base64,(.+)$/);

  if (matches?.length !== 3) {
    return new Error('Invalid input string');
  }

  return Buffer.from(matches[2], 'base64');
};

type DownloadSettings = {
  app?: {
    get: (key: string) => unknown;
  };
};

export default (params: {
  mainWindow: BrowserWindow;
  settings?: DownloadSettings;
}) => {
  ipcMain.on(
    'download-file',
    async (_event, { url, content, fileOptions = {} }) => {
      const win = BrowserWindow.getFocusedWindow();

      try {
        if (content) {
          try {
            const saveDialog = await dialog.showSaveDialog(params.mainWindow, {
              defaultPath: fileOptions.name,
            });

            if (saveDialog.canceled) return;

            const binaryImage = decodeBase64Image(content);
            writeFileSync(
              saveDialog.filePath as PathLike,
              binaryImage as unknown as string,
              'binary',
            );

            debug('File blob saved to', saveDialog.filePath);
          } catch (error) {
            console.error(error);
          }
        } else {
          const dl = await download(win!, url, {
            saveAs: true,
          });
          debug('File saved to', dl.savePath);
        }
      } catch (error) {
        console.error(error);
      }
    },
  );

  ipcMain.handle('download-folder-select', async () => {
    const dialogOptions: OpenDialogOptions = {
      properties: ['openDirectory'],
    };
    const defaultPath = params.settings?.app?.get('downloadFolderPath');

    if (typeof defaultPath === 'string' && defaultPath !== '') {
      dialogOptions.defaultPath = defaultPath;
    }

    const result = await dialog.showOpenDialog(
      params.mainWindow,
      dialogOptions,
    );

    if (result.canceled) return null;

    return result.filePaths[0];
  });
};
