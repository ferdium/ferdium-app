import { join } from 'node:path';
import {
  BrowserWindow,
  Menu,
  type NativeImage,
  Tray,
  app,
  ipcMain,
  nativeImage,
  nativeTheme,
  systemPreferences,
} from 'electron';
import macosVersion from 'macos-version';
import { isLinux, isMac, isWindows } from '../environment';
import { getTranslatedText } from '../helpers/i18n-helpers';

const FILE_EXTENSION = isWindows ? 'ico' : 'png';
const INDICATOR_TRAY_PLAIN = 'tray';
const INDICATOR_TRAY_UNREAD = 'tray-unread';
const INDICATOR_TRAY_INDIRECT = 'tray-indirect';

export default class TrayIcon {
  tray: Tray | null = null;

  indicator: string | number = 0;

  themeChangeSubscriberId: number | null = null;

  trayMenu: Menu | null = null;

  visible = false;

  isAppMuted = false;

  mainWindow: BrowserWindow | null = null;

  currentLocale: string = 'en-US';

  constructor() {
    ipcMain.on('initialAppSettings', (_, appSettings) => {
      this._updateTrayMenu(appSettings);
    });
    ipcMain.on('updateAppSettings', (_, appSettings) => {
      this._updateTrayMenu(appSettings);
    });

    const [firstWindow] = BrowserWindow.getAllWindows();
    this.mainWindow = firstWindow;

    // listen to window events to be able to set correct string
    // to tray menu ('Hide Ferdium' / 'Show Ferdium')
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

  trayMenuTemplate(tray) {
    return [
      {
        label:
          tray.mainWindow.isVisible() && tray.mainWindow.isFocused()
            ? getTranslatedText(
                tray.currentLocale,
                'tray.hideFerdium',
                'Hide Ferdium',
              )
            : getTranslatedText(
                tray.currentLocale,
                'tray.showFerdium',
                'Show Ferdium',
              ),
        click() {
          tray._toggleWindow();
        },
      },
      {
        label: tray.isAppMuted
          ? getTranslatedText(
              tray.currentLocale,
              'tray.enableNotifications',
              'Enable Notifications && Audio',
            )
          : getTranslatedText(
              tray.currentLocale,
              'tray.disableNotifications',
              'Disable Notifications && Audio',
            ),
        click() {
          if (!tray.mainWindow) return;
          tray.mainWindow.webContents.send('muteApp');
        },
      },
      {
        label: getTranslatedText(
          tray.currentLocale,
          'tray.quitFerdium',
          'Quit Ferdium',
        ),
        click() {
          app.quit();
        },
      },
    ];
  }

  _updateTrayMenu(appSettings): void {
    if (!this.tray) {
      return;
    }

    if (appSettings && appSettings.type === 'app') {
      this.isAppMuted = appSettings.data.isAppMuted; // save current state after a change
      if (appSettings.data.locale) {
        this.currentLocale = appSettings.data.locale;
      }
    }

    this.trayMenu = Menu.buildFromTemplate(this.trayMenuTemplate(this));
    if (isLinux) {
      this.tray.setContextMenu(this.trayMenu);
    }
  }

  show(): void {
    this.visible = true;
    this._show();
  }

  _show(): void {
    if (this.tray) {
      return;
    }

    this.tray = new Tray(this._getAsset('tray', INDICATOR_TRAY_PLAIN));
    this.tray.setToolTip('Ferdium');

    this.trayMenu = Menu.buildFromTemplate(this.trayMenuTemplate(this));
    if (isLinux) {
      this.tray.setContextMenu(this.trayMenu);
    }

    this.tray.on('click', () => {
      this._toggleWindow();
    });

    if (isMac || isWindows) {
      this.tray.on('right-click', () => {
        if (this.tray && this.trayMenu) {
          this.tray.popUpContextMenu(this.trayMenu);
        }
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

  _toggleWindow(): void {
    const [mainWindow] = BrowserWindow.getAllWindows();

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    } else if (mainWindow.isVisible() && mainWindow.isFocused()) {
      if (isMac && mainWindow.isFullScreen()) {
        mainWindow.once('show', () => mainWindow.setFullScreen(true));
        mainWindow.once('leave-full-screen', () => mainWindow.hide());
        mainWindow.setFullScreen(false);
      } else {
        mainWindow.hide();
      }
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }

  hide(): void {
    this.visible = false;
    this._hide();
  }

  _hide(): void {
    if (!this.tray) return;

    this.tray.destroy();
    this.tray = null;

    if (isMac && this.themeChangeSubscriberId) {
      systemPreferences.unsubscribeNotification(this.themeChangeSubscriberId);
      this.themeChangeSubscriberId = null;
    }
  }

  recreateIfVisible(): void {
    if (this.visible) {
      this._hide();
      setTimeout(() => {
        if (this.visible) {
          this._show();
        }
      }, 100);
    }
  }

  /**
   * Refresh the tray icon after a StatusNotifierWatcher restart (e.g. screen
   * unlock on GNOME). Instead of destroying and recreating the Tray object
   * (which fails because Electron doesn't clean up D-Bus exports), we call
   * setImage() which forces Electron to write the icon to a new temp file
   * and update the IconThemePath property in D-Bus.
   */
  refreshTrayAfterWatcherRestart(): void {
    if (!this.visible || !this.tray) {
      return;
    }

    const icon = this._getAsset(
      'tray',
      this._getAssetFromIndicator(this.indicator),
    );
    this.tray.setImage(icon);
  }

  setIndicator(indicator: string | number): void {
    this.indicator = indicator;
    this._refreshIcon();
  }

  _getAssetFromIndicator(indicator: string | number): string {
    let assetFromIndicator = INDICATOR_TRAY_PLAIN;
    if (indicator === '•') {
      assetFromIndicator = INDICATOR_TRAY_INDIRECT;
    }
    if (indicator !== 0 && indicator !== '•') {
      assetFromIndicator = INDICATOR_TRAY_UNREAD;
    }
    return assetFromIndicator;
  }

  _refreshIcon(): void {
    if (!this.tray) {
      return;
    }

    this.tray.setImage(
      this._getAsset('tray', this._getAssetFromIndicator(this.indicator)),
    );

    if (isMac && !macosVersion.isGreaterThanOrEqualTo('11')) {
      this.tray.setPressedImage(
        this._getAsset(
          'tray',
          `${this._getAssetFromIndicator(this.indicator)}-active`,
        ),
      );
    }
  }

  _getAsset(type, asset): NativeImage {
    const { platform } = process;
    let platformPath: string = platform;

    if (isMac && macosVersion.isGreaterThanOrEqualTo('11')) {
      platformPath = `${platform}-20`;
    } else if (isMac && nativeTheme.shouldUseDarkColors) {
      platformPath = `${platform}-dark`;
    }

    const trayImg = nativeImage.createFromPath(
      join(
        __dirname,
        '..',
        'assets',
        'images',
        type,
        platformPath,
        `${asset}.${FILE_EXTENSION}`,
      ),
    );

    if (isMac && macosVersion.isGreaterThanOrEqualTo('11')) {
      trayImg.setTemplateImage(true);
    }

    return trayImg;
  }
}
