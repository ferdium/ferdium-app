import { app, ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { isMac, isWindows } from '../../environment';

const debug = require('debug')('ferdium:ipcApi:autoUpdate');

export default (params: { mainWindow: BrowserWindow; settings: any }) => {
  const enableUpdate = Boolean(params.settings.app.get('automaticUpdates'));

  if (!enableUpdate) {
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoDownload = false;
  } else if (isMac || isWindows || process.env.APPIMAGE) {
    ipcMain.on('autoUpdate', (event, args) => {
      if (enableUpdate) {
        try {
          autoUpdater.autoInstallOnAppQuit = false;
          autoUpdater.allowPrerelease = Boolean(
            params.settings.app.get('beta'),
          );

          if (args.action === 'check') {
            debug('checking for update');
            autoUpdater.checkForUpdates();
          } else if (args.action === 'install') {
            debug('installing update');
            app.removeAllListeners('window-all-closed');
            params.mainWindow.removeAllListeners('close');
            autoUpdater.quitAndInstall();
          }
        } catch (error) {
          event.sender.send('autoUpdate', { error });
        }
      }
    });

    autoUpdater.on('update-not-available', () => {
      debug('update-not-available');
      params.mainWindow.webContents.send('autoUpdate', { available: false });
    });

    autoUpdater.on('update-available', event => {
      debug('update-available');

      if (enableUpdate) {
        params.mainWindow.webContents.send('autoUpdate', {
          version: event.version,
          available: true,
        });
      }
    });

    autoUpdater.on('download-progress', progressObj => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
      logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;

      debug(logMessage);
    });

    autoUpdater.on('update-downloaded', () => {
      debug('update-downloaded');
      params.mainWindow.webContents.send('autoUpdate', { downloaded: true });
    });

    autoUpdater.on('error', error => {
      debug('update-error');
      params.mainWindow.webContents.send('autoUpdate', { error });
    });
  }
};
