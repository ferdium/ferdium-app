import {
  app,
  Menu,
  nativeImage,
  nativeTheme,
  systemPreferences,
  Tray,
  ipcMain,
  BrowserWindow,
} from 'electron';
import { join } from 'path';
import macosVersion from 'macos-version';
import { isMac, isWindows, isLinux } from '../environment';

const FILE_EXTENSION = isWindows ? 'ico' : 'png';
const INDICATOR_TRAY_PLAIN = 'tray';
const INDICATOR_TRAY_UNREAD = 'tray-unread';
const INDICATOR_TRAY_INDIRECT = 'tray-indirect';

// TODO: Need to support i18n for a lot of the hard-coded strings in this file
export default class TrayIcon {
  trayIcon = null;

  indicator = 0;

  themeChangeSubscriberId = null;

  trayMenu = null;

  visible = false;

  isAppMuted = false;

  mainWindow = null;

  trayMenuTemplate = tray => [
    {
      label:
        tray.mainWindow.isVisible() && tray.mainWindow.isFocused()
          ? 'Hide Ferdi'
          : 'Show Ferdi',
      click() {
        tray._toggleWindow();
      },
    },
    {
      label: tray.isAppMuted
        ? 'Enable Notifications && Audio'
        : 'Disable Notifications && Audio',
      click() {
        if (!tray.mainWindow) return;
        tray.mainWindow.webContents.send('muteApp');
      },
    },
    {
      label: 'Quit Ferdi',
      click() {
        app.quit();
      },
    },
  ];

  constructor() {
    ipcMain.on('initialAppSettings', (event, appSettings) => {
      this._updateTrayMenu(appSettings);
    });
    ipcMain.on('updateAppSettings', (event, appSettings) => {
      this._updateTrayMenu(appSettings);
    });

    this.mainWindow = BrowserWindow.getAllWindows()[0];

    // listen to window events to be able to set correct string
    // to tray menu ('Hide Ferdi' / 'Show Ferdi')
    this.mainWindow.on('hide', () => {
      this._updateTrayMenu(null);
    });
    this.mainWindow.on('restore', () => {
      this._updateTrayMenu(null);
    });
    this.mainWindow.on('minimize', () => {
      this._updateTrayMenu(null);
    });
    this.mainWindow.on('show', () => {
      this._updateTrayMenu(null);
    });
    this.mainWindow.on('focus', () => {
      this._updateTrayMenu(null);
    });
    this.mainWindow.on('blur', () => {
      this._updateTrayMenu(null);
    });
  }

  _updateTrayMenu(appSettings) {
    if (!this.trayIcon) return;

    if (appSettings && appSettings.type === 'app') {
      this.isAppMuted = appSettings.data.isAppMuted; // save current state after a change
    }

    this.trayMenu = Menu.buildFromTemplate(this.trayMenuTemplate(this));
    if (isLinux) {
      this.trayIcon.setContextMenu(this.trayMenu);
    }
  }

  show() {
    this.visible = true;
    this._show();
  }

  _show() {
    if (this.trayIcon) return;

    this.trayIcon = new Tray(this._getAsset('tray', INDICATOR_TRAY_PLAIN));
    this.trayIcon.setToolTip('Ferdi');

    this.trayMenu = Menu.buildFromTemplate(this.trayMenuTemplate(this));
    if (isLinux) {
      this.trayIcon.setContextMenu(this.trayMenu);
    }

    this.trayIcon.on('click', () => {
      this._toggleWindow();
    });

    if (isMac || isWindows) {
      this.trayIcon.on('right-click', () => {
        this.trayIcon.popUpContextMenu(this.trayMenu);
      });
    }

    if (isMac) {
      this.themeChangeSubscriberId = systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
        () => {
          this._refreshIcon();
        },
      );
    }
  }

  _toggleWindow() {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (!mainWindow) return;

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    } else if (mainWindow.isVisible() && mainWindow.isFocused()) {
      if (isMac && mainWindow.isFullScreen()) {
        mainWindow.once('show', () => mainWindow?.setFullScreen(true));
        mainWindow.once('leave-full-screen', () => mainWindow?.hide());
        mainWindow.setFullScreen(false);
      } else {
        mainWindow.hide();
      }
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }

  hide() {
    this.visible = false;
    this._hide();
  }

  _hide() {
    if (!this.trayIcon) return;

    this.trayIcon.destroy();
    this.trayIcon = null;

    if (isMac && this.themeChangeSubscriberId) {
      systemPreferences.unsubscribeNotification(this.themeChangeSubscriberId);
      this.themeChangeSubscriberId = null;
    }
  }

  recreateIfVisible() {
    if (this.visible) {
      this._hide();
      setTimeout(() => {
        if (this.visible) {
          this._show();
        }
      }, 100);
    }
  }

  setIndicator(indicator) {
    this.indicator = indicator;
    this._refreshIcon();
  }

  _getAssetFromIndicator(indicator) {
    if (indicator === '•') {
      return INDICATOR_TRAY_INDIRECT;
    }
    if (indicator !== 0) {
      return INDICATOR_TRAY_UNREAD;
    }
    return INDICATOR_TRAY_PLAIN;
  }

  _refreshIcon() {
    if (!this.trayIcon) return;

    this.trayIcon.setImage(
      this._getAsset('tray', this._getAssetFromIndicator(this.indicator)),
    );

    if (isMac) {
      this.trayIcon.setPressedImage(
        this._getAsset(
          'tray',
          `${this._getAssetFromIndicator(this.indicator)}-active`,
        ),
      );
    }
  }

  _getAsset(type, asset) {
    let { platform } = process;

    if (
      isMac &&
      (nativeTheme.shouldUseDarkColors ||
        macosVersion.isGreaterThanOrEqualTo('11'))
    ) {
      platform = `${platform}-dark`;
    }

    const trayImg = nativeImage.createFromPath(
      join(
        __dirname,
        '..',
        'assets',
        'images',
        type,
        platform,
        `${asset}.${FILE_EXTENSION}`,
      ),
    );

    if (isMac && macosVersion.isGreaterThanOrEqualTo('11')) {
      trayImg.setTemplateImage(true);
    }

    return trayImg;
  }
}
