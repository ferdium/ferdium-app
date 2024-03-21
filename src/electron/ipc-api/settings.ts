import { type BrowserWindow, type Settings, ipcMain } from 'electron';

export default (params: { mainWindow: BrowserWindow; settings: Settings }) => {
  ipcMain.on('getAppSettings', (_event, type) => {
    params.mainWindow.webContents.send('appSettings', {
      type,
      data: params.settings[type].allSerialized,
    });
  });

  ipcMain.on('updateAppSettings', (_event, args) => {
    params.settings[args.type].set(args.data);
  });
};
