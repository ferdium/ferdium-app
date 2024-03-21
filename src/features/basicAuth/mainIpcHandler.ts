import type { BrowserWindow } from 'electron';

const debug = require('../../preload-safe-debug')(
  'Ferdium:feature:basicAuth:main',
);

export default function mainIpcHandler(mainWindow: BrowserWindow, authInfo) {
  debug('Sending basic auth call', authInfo);

  mainWindow.webContents.send('feature:basic-auth', {
    authInfo,
  });
}
