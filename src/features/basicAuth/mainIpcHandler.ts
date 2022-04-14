import { BrowserWindow } from 'electron';

const debug = require('debug')('ferdium:feature:basicAuth:main');

export default function mainIpcHandler(mainWindow: BrowserWindow, authInfo) {
  debug('Sending basic auth call', authInfo);

  mainWindow.webContents.send('feature:basic-auth', {
    authInfo,
  });
}
