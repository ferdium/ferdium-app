import { ipcMain } from 'electron';
import { openProcessManager } from '@krisdages/electron-process-manager';

export default () => {
  ipcMain.on('openProcessManager', () => {
    openProcessManager();
  });
};
