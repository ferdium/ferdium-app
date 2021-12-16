import { app, ipcMain, BrowserWindow, Tray } from 'electron';
import { join } from 'path';
import { autorun } from 'mobx';
import { isMac, isWindows, isLinux } from '../../environment';

const INDICATOR_TASKBAR = 'taskbar';
const FILE_EXTENSION = isWindows ? 'ico' : 'png';

let isTrayIconEnabled: boolean;

function getAsset(type: 'tray' | 'taskbar', asset: string) {
  return join(
    __dirname,
    '..',
    '..',
    'assets',
    'images',
    type,
    process.platform,
    `${asset}.${FILE_EXTENSION}`,
  );
}

export default (params: {
  mainWindow: BrowserWindow;
  settings: any;
  trayIcon: Tray;
}) => {
  autorun(() => {
    isTrayIconEnabled = params.settings.app.get('enableSystemTray');

    if (!isTrayIconEnabled) {
      // @ts-expect-error Property 'hide' does not exist on type 'Tray'.
      params.trayIcon.hide();
    } else if (isTrayIconEnabled) {
      // @ts-expect-error Property 'show' does not exist on type 'Tray'.
      params.trayIcon.show();
    }
  });

  ipcMain.on('updateAppIndicator', (_event, args) => {
    // Flash TaskBar for windows, bounce Dock on Mac
    if (
      !params.mainWindow.isFocused() &&
      params.settings.app.get('notifyTaskBarOnMessage')
    ) {
      if (isWindows) {
        params.mainWindow.flashFrame(true);
        params.mainWindow.once('focus', () =>
          params.mainWindow.flashFrame(false),
        );
      } else if (isMac) {
        app.dock.bounce('informational');
      }
    }

    // Update badge
    if (isMac && typeof args.indicator === 'string') {
      app.dock.setBadge(args.indicator);
    }

    if ((isMac || isLinux) && typeof args.indicator === 'number') {
      app.badgeCount = args.indicator;
    }

    if (isWindows) {
      if (typeof args.indicator === 'number' && args.indicator !== 0) {
        params.mainWindow.setOverlayIcon(
          // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'NativeImage | null'.
          getAsset(
            'taskbar',
            `${INDICATOR_TASKBAR}-${
              args.indicator >= 10 ? 10 : args.indicator
            }`,
          ),
          '',
        );
      } else if (typeof args.indicator === 'string') {
        params.mainWindow.setOverlayIcon(
          // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'NativeImage | null'.
          getAsset('taskbar', `${INDICATOR_TASKBAR}-alert`),
          '',
        );
      } else {
        params.mainWindow.setOverlayIcon(null, '');
      }
    }

    // Update Tray
    // @ts-expect-error Property 'setIndicator' does not exist on type 'Tray'.
    params.trayIcon.setIndicator(args.indicator);
  });
};
