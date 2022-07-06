import { ipcRenderer } from 'electron';
import {
  app,
  screen,
  powerMonitor,
  nativeTheme,
  getCurrentWindow,
  process as remoteProcess,
} from '@electron/remote';
import { action, computed, makeObservable, observable } from 'mobx';
import moment from 'moment';
import AutoLaunch from 'auto-launch';
import ms from 'ms';
import { URL } from 'url';
import { readJsonSync } from 'fs-extra';

import { Stores } from '../@types/stores.types';
import { ApiInterface } from '../api';
import { Actions } from '../actions/lib/actions';
import TypedStore from './lib/TypedStore';
import Request from './lib/Request';
import { CHECK_INTERVAL, DEFAULT_APP_SETTINGS } from '../config';
import { cleanseJSObject } from '../jsUtils';
import { isMac, electronVersion, osRelease } from '../environment';
import {
  ferdiumVersion,
  userDataPath,
  ferdiumLocale,
} from '../environment-remote';
import generatedTranslations from '../i18n/translations';
import { getLocale } from '../helpers/i18n-helpers';

import {
  getServiceIdsFromPartitions,
  removeServicePartitionDirectory,
} from '../helpers/service-helpers';
import { openExternalUrl } from '../helpers/url-helpers';
import sleep from '../helpers/async-helpers';

const debug = require('../preload-safe-debug')('Ferdium:AppStore');

const mainWindow = getCurrentWindow();

const executablePath = isMac ? remoteProcess.execPath : process.execPath;
const autoLauncher = new AutoLaunch({
  name: 'Ferdium',
  path: executablePath,
});

const CATALINA_NOTIFICATION_HACK_KEY =
  '_temp_askedForCatalinaNotificationPermissions';

const locales = generatedTranslations();

export default class AppStore extends TypedStore {
  updateStatusTypes = {
    CHECKING: 'CHECKING',
    AVAILABLE: 'AVAILABLE',
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    DOWNLOADED: 'DOWNLOADED',
    FAILED: 'FAILED',
  };

  @observable healthCheckRequest = new Request(this.api.app, 'health');

  @observable getAppCacheSizeRequest = new Request(
    this.api.local,
    'getAppCacheSize',
  );

  @observable clearAppCacheRequest = new Request(this.api.local, 'clearCache');

  @observable autoLaunchOnStart = true;

  @observable isOnline = navigator.onLine;

  @observable authRequestFailed = false;

  @observable timeSuspensionStart = moment();

  @observable timeOfflineStart;

  @observable updateStatus = '';

  @observable locale = ferdiumLocale;

  @observable isSystemMuteOverridden = false;

  @observable isSystemDarkModeEnabled = false;

  @observable isClearingAllCache = false;

  @observable isFullScreen = mainWindow.isFullScreen();

  @observable isFocused = true;

  @observable lockingFeatureEnabled = false;

  @observable launchInBackground = false;

  dictionaries = [];

  fetchDataInterval: null | NodeJS.Timer = null;

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.app.notify.listen(this._notify.bind(this));
    this.actions.app.setBadge.listen(this._setBadge.bind(this));
    this.actions.app.launchOnStartup.listen(this._launchOnStartup.bind(this));
    this.actions.app.openExternalUrl.listen(this._openExternalUrl.bind(this));
    this.actions.app.checkForUpdates.listen(this._checkForUpdates.bind(this));
    this.actions.app.installUpdate.listen(this._installUpdate.bind(this));
    this.actions.app.resetUpdateStatus.listen(
      this._resetUpdateStatus.bind(this),
    );
    this.actions.app.healthCheck.listen(this._healthCheck.bind(this));
    this.actions.app.muteApp.listen(this._muteApp.bind(this));
    this.actions.app.toggleMuteApp.listen(this._toggleMuteApp.bind(this));
    this.actions.app.toggleCollapseMenu.listen(
      this._toggleCollapseMenu.bind(this),
    );
    this.actions.app.clearAllCache.listen(this._clearAllCache.bind(this));

    this.registerReactions([
      this._offlineCheck.bind(this),
      this._setLocale.bind(this),
      this._muteAppHandler.bind(this),
      this._handleFullScreen.bind(this),
      this._handleLogout.bind(this),
    ]);
  }

  async setup(): Promise<void> {
    this._appStartsCounter();
    // Focus the active service
    window.addEventListener('focus', this.actions.service.focusActiveService);

    // Online/Offline handling
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    mainWindow.on('enter-full-screen', () => {
      this.isFullScreen = true;
    });
    mainWindow.on('leave-full-screen', () => {
      this.isFullScreen = false;
    });

    this.isOnline = navigator.onLine;

    // Check if Ferdium should launch on start
    // Needs to be delayed a bit
    this._autoStart();

    // Check if system is muted
    // There are no events to subscribe so we need to poll everey 5s
    this._systemDND();
    setInterval(() => this._systemDND(), ms('5s'));

    this.fetchDataInterval = setInterval(() => {
      this.stores.user.getUserInfoRequest.invalidate({
        immediately: true,
      });
      this.stores.features.featuresRequest.invalidate({
        immediately: true,
      });
    }, ms('60m'));

    // Check for updates once every 4 hours
    setInterval(() => this._checkForUpdates(), CHECK_INTERVAL);
    // Check for an update in 30s (need a delay to prevent Squirrel Installer lock file issues)
    setTimeout(() => this._checkForUpdates(), ms('30s'));
    ipcRenderer.on('autoUpdate', (_, data) => {
      if (this.updateStatus !== this.updateStatusTypes.FAILED) {
        if (data.available) {
          this.updateStatus = this.updateStatusTypes.AVAILABLE;
          if (isMac && this.stores.settings.app.automaticUpdates) {
            app.dock.bounce();
          }
        }

        if (data.available !== undefined && !data.available) {
          this.updateStatus = this.updateStatusTypes.NOT_AVAILABLE;
        }

        if (data.downloaded) {
          this.updateStatus = this.updateStatusTypes.DOWNLOADED;
          if (isMac && this.stores.settings.app.automaticUpdates) {
            app.dock.bounce();
          }
        }

        if (data.error) {
          if (data.error.message && data.error.message.startsWith('404')) {
            this.updateStatus = this.updateStatusTypes.NOT_AVAILABLE;
            console.warn(
              'Updater warning: there seems to be unpublished pre-release(s) available on GitHub',
              data.error,
            );
          } else {
            console.error('Updater error:', data.error);
            this.updateStatus = this.updateStatusTypes.FAILED;
          }
        }
      }
    });

    // Handle deep linking (ferdium://)
    ipcRenderer.on('navigateFromDeepLink', (_, data) => {
      debug('Navigate from deep link', data);
      let { url } = data;
      if (!url) return;

      url = url.replace(/\/$/, '');

      this.stores.router.push(url);
    });

    ipcRenderer.on('muteApp', () => {
      this._toggleMuteApp();
    });

    this.locale = this._getDefaultLocale();

    setTimeout(() => {
      this._healthCheck();
    }, 1000);

    this.isSystemDarkModeEnabled = nativeTheme.shouldUseDarkColors;

    ipcRenderer.on('isWindowFocused', (_, isFocused) => {
      debug('Setting is focused to', isFocused);
      this.isFocused = isFocused;
    });

    powerMonitor.on('suspend', () => {
      debug('System suspended starting timer');

      this.timeSuspensionStart = moment();
    });

    powerMonitor.on('resume', () => {
      debug('System resumed, last suspended on', this.timeSuspensionStart);
      this.actions.service.resetLastPollTimer();

      const idleTime = this.stores.settings.app.reloadAfterResumeTime;

      if (
        this.timeSuspensionStart.add(idleTime, 'm').isBefore(moment()) &&
        this.stores.settings.app.reloadAfterResume
      ) {
        debug('Reloading services, user info and features');

        setInterval(() => {
          debug('Reload app interval is starting');
          if (this.isOnline) {
            window.location.reload();
          }
        }, ms('2s'));
      }
    });

    // macOS catalina notifications hack
    // notifications got stuck after upgrade but forcing a notification
    // via `new Notification` triggered the permission request
    if (isMac && !localStorage.getItem(CATALINA_NOTIFICATION_HACK_KEY)) {
      debug('Triggering macOS Catalina notification permission trigger');
      // eslint-disable-next-line no-new
      new window.Notification('Welcome to Ferdium 5', {
        body: 'Have a wonderful day & happy messaging.',
      });

      localStorage.setItem(CATALINA_NOTIFICATION_HACK_KEY, 'true');
    }
  }

  @computed get cacheSize() {
    return this.getAppCacheSizeRequest.execute().result;
  }

  @computed get debugInfo() {
    const settings = cleanseJSObject(this.stores.settings.app);
    settings.lockedPassword = '******';

    return {
      host: {
        platform: process.platform,
        release: osRelease,
        screens: screen.getAllDisplays(),
      },
      ferdium: {
        version: ferdiumVersion,
        electron: electronVersion,
        installedRecipes: this.stores.recipes.all.map(recipe => ({
          id: recipe.id,
          version: recipe.version,
        })),
        devRecipes: this.stores.recipePreviews.dev.map(recipe => ({
          id: recipe.id,
          version: recipe.version,
        })),
        services: this.stores.services.all.map(service => ({
          id: service.id,
          recipe: service.recipe.id,
          isAttached: service.isAttached,
          isActive: service.isActive,
          isEnabled: service.isEnabled,
          isHibernating: service.isHibernating,
          hasCrashed: service.hasCrashed,
          isDarkModeEnabled: service.isDarkModeEnabled,
          isProgressbarEnabled: service.isProgressbarEnabled,
        })),
        messages: this.stores.globalError.messages,
        workspaces: this.stores.workspaces.workspaces.map(workspace => ({
          id: workspace.id,
          services: workspace.services,
        })),
        windowSettings: readJsonSync(userDataPath('window-state.json')),
        settings,
        features: this.stores.features.features,
        user: this.stores.user.data.id,
      },
    };
  }

  // Actions
  @action _notify({ title, options, notificationId, serviceId = null }) {
    if (this.stores.settings.all.app.isAppMuted) return;

    // TODO: is there a simple way to use blobs for notifications without storing them on disk?
    if (options.icon && options.icon.startsWith('blob:')) {
      delete options.icon;
    }

    const notification = new window.Notification(title, options);

    debug('New notification', title, options);

    notification.addEventListener('click', () => {
      if (serviceId) {
        this.actions.service.sendIPCMessage({
          channel: `notification-onclick:${notificationId}`,
          args: {},
          serviceId,
        });

        this.actions.service.setActive({
          serviceId,
        });

        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();

        debug('Notification click handler');
      }
    });
  }

  @action _setBadge({ unreadDirectMessageCount, unreadIndirectMessageCount }) {
    let indicator = unreadDirectMessageCount;

    if (indicator === 0 && unreadIndirectMessageCount !== 0) {
      indicator = '•';
    } else if (
      unreadDirectMessageCount === 0 &&
      unreadIndirectMessageCount === 0
    ) {
      indicator = 0;
    } else {
      indicator = Number.parseInt(indicator, 10);
    }

    ipcRenderer.send('updateAppIndicator', {
      indicator,
    });
  }

  @action _launchOnStartup({ enable }) {
    this.autoLaunchOnStart = enable;

    try {
      if (enable) {
        debug('enabling launch on startup', executablePath);
        autoLauncher.enable();
      } else {
        debug('disabling launch on startup');
        autoLauncher.disable();
      }
    } catch (error) {
      console.warn(error);
    }
  }

  // Ideally(?) this should be merged with the 'shell-helpers' functionality
  @action _openExternalUrl({ url }) {
    openExternalUrl(new URL(url));
  }

  @action _checkForUpdates() {
    if (this.isOnline && this.stores.settings.app.automaticUpdates) {
      debug('_checkForUpdates: sending event to autoUpdate:check');
      this.updateStatus = this.updateStatusTypes.CHECKING;
      ipcRenderer.send('autoUpdate', {
        action: 'check',
      });
    }

    if (this.isOnline && this.stores.settings.app.automaticUpdates) {
      this.actions.recipe.update();
    }
  }

  @action _installUpdate() {
    debug('_installUpdate: sending event to autoUpdate:install');
    ipcRenderer.send('autoUpdate', {
      action: 'install',
    });
  }

  @action _resetUpdateStatus() {
    this.updateStatus = '';
  }

  @action _healthCheck() {
    this.healthCheckRequest.execute();
  }

  @action _muteApp({ isMuted, overrideSystemMute = true }) {
    this.isSystemMuteOverridden = overrideSystemMute;
    this.actions.settings.update({
      type: 'app',
      data: {
        isAppMuted: isMuted,
      },
    });
  }

  @action _toggleMuteApp() {
    this._muteApp({
      isMuted: !this.stores.settings.all.app.isAppMuted,
    });
  }

  @action _toggleCollapseMenu(): void {
    this.actions.settings.update({
      type: 'app',
      data: {
        isMenuCollapsed: !this.stores.settings.all.app.isMenuCollapsed,
      },
    });
  }

  @action async _clearAllCache() {
    this.isClearingAllCache = true;
    const clearAppCache = this.clearAppCacheRequest.execute();
    const allServiceIds = await getServiceIdsFromPartitions();
    const allOrphanedServiceIds = allServiceIds.filter(
      id =>
        !this.stores.services.all.some(
          s => id.replace('service-', '') === s.id,
        ),
    );

    try {
      await Promise.all(
        allOrphanedServiceIds.map(id => removeServicePartitionDirectory(id)),
      );
    } catch (error) {
      console.log('Error while deleting service partition directory -', error);
    }
    await Promise.all(
      this.stores.services.all.map(s =>
        this.actions.service.clearCache({
          serviceId: s.id,
        }),
      ),
    );

    await clearAppCache._promise;

    await sleep(ms('1s'));

    this.getAppCacheSizeRequest.execute();

    this.isClearingAllCache = false;
  }

  // Reactions
  _offlineCheck() {
    if (!this.isOnline) {
      this.timeOfflineStart = moment();
    } else {
      const deltaTime = moment().diff(this.timeOfflineStart);

      if (deltaTime > ms('30m')) {
        this.actions.service.reloadAll();
      }
    }
  }

  _setLocale() {
    if (this.stores.user?.isLoggedIn && this.stores.user?.data.locale) {
      this.locale = this.stores.user.data.locale;
    } else if (!this.locale) {
      this.locale = this._getDefaultLocale();
    }

    moment.locale(this.locale);
    debug(`Set locale to "${this.locale}"`);
  }

  _getDefaultLocale() {
    return getLocale({
      locale: ferdiumLocale,
      locales,
      fallbackLocale: DEFAULT_APP_SETTINGS.fallbackLocale,
    });
  }

  _muteAppHandler() {
    const { showMessageBadgesEvenWhenMuted } = this.stores.ui;

    if (!showMessageBadgesEvenWhenMuted) {
      this.actions.app.setBadge({
        unreadDirectMessageCount: 0,
        unreadIndirectMessageCount: 0,
      });
    }
  }

  _handleFullScreen() {
    const body = document.querySelector('body');

    if (body) {
      if (this.isFullScreen) {
        body.classList.add('isFullScreen');
      } else {
        body.classList.remove('isFullScreen');
      }
    }
  }

  _handleLogout() {
    if (!this.stores.user.isLoggedIn && this.fetchDataInterval !== null) {
      clearInterval(this.fetchDataInterval);
    }
  }

  // Helpers
  _appStartsCounter() {
    this.actions.settings.update({
      type: 'stats',
      data: {
        appStarts: (this.stores.settings.all.stats.appStarts || 0) + 1,
      },
    });
  }

  async _autoStart() {
    this.autoLaunchOnStart = await this._checkAutoStart();

    if (this.stores.settings.all.stats.appStarts === 1) {
      debug('Set app to launch on start');
      this.actions.app.launchOnStartup({
        enable: true,
      });
    }
  }

  async _checkAutoStart() {
    return autoLauncher.isEnabled() || false;
  }

  async _systemDND() {
    debug('Checking if Do Not Disturb Mode is on');
    const dnd = await ipcRenderer.invoke('get-dnd');
    debug('Do not disturb mode is', dnd);
    if (
      dnd !== this.stores.settings.all.app.isAppMuted &&
      !this.isSystemMuteOverridden
    ) {
      this.actions.app.muteApp({
        isMuted: dnd,
        overrideSystemMute: false,
      });
    }
  }
}
