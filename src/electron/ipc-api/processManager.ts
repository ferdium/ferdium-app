import { openProcessManager } from '@syed_umair/electron-process-manager';
import { ipcMain } from 'electron';

export default () => {
  ipcMain.on('openProcessManager', () => {
    openProcessManager();
  });
};
