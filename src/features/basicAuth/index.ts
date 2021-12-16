import { AuthInfo, BrowserWindow, ipcRenderer } from 'electron';

import { state as ModalState } from './store';

const debug = require('debug')('Ferdi:feature:basicAuth');

const state = ModalState;

export default function initialize() {
  debug('Initialize basicAuth feature');

  window['ferdi'].features.basicAuth = {
    state,
  };

  ipcRenderer.on('feature:basic-auth-request', (e, data) => {
    debug(e, data);
    // state.serviceId = data.serviceId;
    state.authInfo = data.authInfo;
    state.isModalVisible = true;
  });
}

export function mainIpcHandler(mainWindow: BrowserWindow, authInfo: AuthInfo) {
  debug('Sending basic auth call', authInfo);

  mainWindow.webContents.send('feature:basic-auth-request', {
    authInfo,
  });
}

export { default as Component } from './Component';
