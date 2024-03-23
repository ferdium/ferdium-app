import { openProcessManager } from '@krisdages/electron-process-manager';
import { ipcMain } from 'electron';

export default () => {
  ipcMain.on('openProcessManager', () => {
    openProcessManager();
  });
};
