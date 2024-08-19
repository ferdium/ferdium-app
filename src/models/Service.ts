import { basename, join } from 'node:path';
import { webContents } from '@electron/remote';
import { ipcRenderer } from 'electron';
import { action, autorun, computed, makeObservable, observable } from 'mobx';
import type ElectronWebView from 'react-electron-web-view';

import { v4 as uuidV4 } from 'uuid';
import { needsToken } from '../api/apiBase';
import { DEFAULT_SERVICE_ORDER, DEFAULT_SERVICE_SETTINGS } from '../config';
import { isMac } from '../environment';
import { todosStore } from '../features/todos';
import { getFaviconUrl } from '../helpers/favicon-helpers';
import { isValidExternalURL, normalizedUrl } from '../helpers/url-helpers';
import { ifUndefined } from '../jsUtils';
import type { IRecipe } from './Recipe';
import UserAgent from './UserAgent';

const debug = require('../preload-safe-debug')('Ferdium:Service');

// Global registry for active partitions
// This is needed to prevent events of the same partition from being registered multiple times (when using custom sandboxes)
const activePartitions = new Set<string>();

interface DarkReaderInterface {
  brightness: number;
  contrast: number;
  sepia: number;
}

// TODO: Shouldn't most of these values default to what's defined in DEFAULT_SERVICE_SETTINGS?
export default class Service {
  id: string = '';

  recipe: IRecipe;

  _webview: ElectronWebView | null = null;

  timer: NodeJS.Timeout | null = null;

  events = {};

  @observable isAttached: boolean = false;

  @observable isActive: boolean = false; // Is current webview active

  @observable name: string = '';

  @observable unreadDirectMessageCount: number = 0;

  @observable unreadIndirectMessageCount: number = 0;

  @observable dialogTitle: string = '';

  @observable order: number = DEFAULT_SERVICE_ORDER;

  @observable isEnabled: boolean = DEFAULT_SERVICE_SETTINGS.isEnabled;

  @observable isMuted: boolean = DEFAULT_SERVICE_SETTINGS.isMuted;

  @observable team: string = '';

  @observable customUrl: string = '';

  @observable isNotificationEnabled: boolean =
    DEFAULT_SERVICE_SETTINGS.isNotificationEnabled;

  @observable isBadgeEnabled: boolean = DEFAULT_SERVICE_SETTINGS.isBadgeEnabled;

  @observable isMediaBadgeEnabled: boolean =
    DEFAULT_SERVICE_SETTINGS.isMediaBadgeEnabled;

  @observable trapLinkClicks: boolean = DEFAULT_SERVICE_SETTINGS.trapLinkClicks;

  @observable isIndirectMessageBadgeEnabled: boolean = true;

  @observable iconUrl: string = '';

  @observable customIconUrl: string = '';

  @observable hasCustomUploadedIcon: boolean = false;

  @observable hasCrashed: boolean = false;

  @observable isDarkModeEnabled: boolean =
    DEFAULT_SERVICE_SETTINGS.isDarkModeEnabled;

  @observable isProgressbarEnabled: boolean =
    DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled;

  @observable darkReaderSettings: DarkReaderInterface = {
    brightness: 100,
    contrast: 90,
    sepia: 10,
  };

  @observable spellcheckerLanguage: string | null = null;

  @observable isFirstLoad: boolean = true;

  @observable isLoading: boolean = true;

  @observable isLoadingPage: boolean = true;

  @observable isError: boolean = false;

  @observable errorMessage: string = '';

  @observable isUsingCustomUrl: boolean = false;

  @observable isServiceAccessRestricted: boolean = false;

  // TODO: is this used?
  @observable restrictionType = null;

  @observable isHibernationEnabled: boolean =
    DEFAULT_SERVICE_SETTINGS.isHibernationEnabled;

  @observable isWakeUpEnabled: boolean =
    DEFAULT_SERVICE_SETTINGS.isWakeUpEnabled;

  @observable isHibernationRequested: boolean = false;

  @observable onlyShowFavoritesInUnreadCount: boolean = false;

  @observable lastUsed: number = Date.now(); // timestamp

  @observable lastHibernated: number | null = null; // timestamp

  @observable lastPoll: number = Date.now();

  @observable lastPollAnswer: number = Date.now();

  @observable lostRecipeConnection: boolean = false;

  @observable lostRecipeReloadAttempt: number = 0;

  @observable userAgentModel: UserAgent;

  @observable proxy: string | null = null;

  @observable isMediaPlaying: boolean = false;

  @observable useFavicon: boolean = DEFAULT_SERVICE_SETTINGS.useFavicon;

  @action _setAutoRun() {
    if (!this.isEnabled) {
      this.webview = null;
      this.isAttached = false;
      this.unreadDirectMessageCount = 0;
      this.unreadIndirectMessageCount = 0;
    }

    if (this.recipe.hasCustomUrl && this.customUrl) {
      this.isUsingCustomUrl = true;
    }
  }

  constructor(data, recipe: IRecipe) {
    if (!data) {
      throw new Error('Service config not valid');
    }

    if (!recipe) {
      throw new Error('Service recipe not valid');
    }

    makeObservable(this);

    this.recipe = recipe;

    this.userAgentModel = new UserAgent(recipe.overrideUserAgent);

    this.id = ifUndefined<string>(data.id, this.id);
    this.name = ifUndefined<string>(data.name, this.name);
    this.team = ifUndefined<string>(data.team, this.team);
    this.customUrl = ifUndefined<string>(data.customUrl, this.customUrl);
    this.iconUrl = ifUndefined<string>(data.iconUrl, this.iconUrl);
    this.useFavicon = ifUndefined<boolean>(data.useFavicon, this.useFavicon);
    this.order = ifUndefined<number>(data.order, this.order);
    this.isEnabled = ifUndefined<boolean>(data.isEnabled, this.isEnabled);
    this.isNotificationEnabled = ifUndefined<boolean>(
      data.isNotificationEnabled,
      this.isNotificationEnabled,
    );
    this.isBadgeEnabled = ifUndefined<boolean>(
      data.isBadgeEnabled,
      this.isBadgeEnabled,
    );

    this.isMediaBadgeEnabled = ifUndefined<boolean>(
      data.isMediaBadgeEnabled,
      this.isMediaBadgeEnabled,
    );
    this.trapLinkClicks = ifUndefined<boolean>(
      data.trapLinkClicks,
      this.trapLinkClicks,
    );
    this.isIndirectMessageBadgeEnabled = ifUndefined<boolean>(
      data.isIndirectMessageBadgeEnabled,
      this.isIndirectMessageBadgeEnabled,
    );
    this.isMuted = ifUndefined<boolean>(data.isMuted, this.isMuted);
    this.isDarkModeEnabled = ifUndefined<boolean>(
      data.isDarkModeEnabled,
      this.isDarkModeEnabled,
    );
    this.darkReaderSettings = ifUndefined<DarkReaderInterface>(
      data.darkReaderSettings,
      this.darkReaderSettings,
    );
    this.isProgressbarEnabled = ifUndefined<boolean>(
      data.isProgressbarEnabled,
      this.isProgressbarEnabled,
    );
    this.hasCustomUploadedIcon = ifUndefined<boolean>(
      data.iconId?.length > 0,
      this.hasCustomUploadedIcon,
    );
    this.onlyShowFavoritesInUnreadCount = ifUndefined<boolean>(
      data.onlyShowFavoritesInUnreadCount,
      this.onlyShowFavoritesInUnreadCount,
    );
    this.proxy = ifUndefined<string | null>(data.proxy, this.proxy);
    this.spellcheckerLanguage = ifUndefined<string | null>(
      data.spellcheckerLanguage,
      this.spellcheckerLanguage,
    );
    this.userAgentPref = ifUndefined<string | null>(
      data.userAgentPref,
      this.userAgentPref,
    );
    this.isHibernationEnabled = ifUndefined<boolean>(
      data.isHibernationEnabled,
      this.isHibernationEnabled,
    );
    this.isWakeUpEnabled = ifUndefined<boolean>(
      data.isWakeUpEnabled,
      this.isWakeUpEnabled,
    );

    // Check if "Hibernate on Startup" is enabled and hibernate all services except active one
    const { hibernateOnStartup } = window['ferdium'].stores.settings.app;
    // The service store is probably not loaded yet so we need to use localStorage data to get active service
    const isActive =
      window.localStorage.service &&
      JSON.parse(window.localStorage.service).activeService === this.id;
    if (hibernateOnStartup && !isActive) {
      this.isHibernationRequested = true;
    }

    autorun((): void => {
      this._setAutoRun();
    });
  }

  @action _didStartLoading(): void {
    this.hasCrashed = false;
    this.isLoading = true;
    this.isLoadingPage = true;
    this.isError = false;
  }

  @action _didStopLoading(): void {
    this.isLoading = false;
    this.isLoadingPage = false;
  }

  @action _didLoad(): void {
    this.isLoading = false;
    this.isLoadingPage = false;

    if (!this.isError) {
      this.isFirstLoad = false;
    }
  }

  @action _didFailLoad(event: { errorDescription: string }): void {
    this.isError = false;
    this.errorMessage = event.errorDescription;
    this.isLoading = false;
    this.isLoadingPage = false;
  }

  @action _hasCrashed(): void {
    this.hasCrashed = true;
  }

  @action _didMediaPlaying(): void {
    this.isMediaPlaying = true;
  }

  @action _didMediaPaused(): void {
    this.isMediaPlaying = false;
  }

  @computed get shareWithWebview(): object {
    return {
      id: this.id,
      spellcheckerLanguage: this.spellcheckerLanguage,
      isDarkModeEnabled: this.isDarkModeEnabled,
      isProgressbarEnabled: this.isProgressbarEnabled,
      darkReaderSettings: this.darkReaderSettings,
      team: this.team,
      url: this.url,
      hasCustomIcon: this.hasCustomIcon,
      onlyShowFavoritesInUnreadCount: this.onlyShowFavoritesInUnreadCount,
      trapLinkClicks: this.trapLinkClicks,
    };
  }

  @computed get isTodosService(): boolean {
    return this.recipe.id === todosStore.todoRecipeId;
  }

  @computed get canHibernate(): boolean {
    return this.isHibernationEnabled && !this.isMediaPlaying;
  }

  @computed get isHibernating(): boolean {
    return this.canHibernate && this.isHibernationRequested;
  }

  get webview(): ElectronWebView | null {
    if (this.isTodosService) {
      return todosStore.webview;
    }

    return this._webview;
  }

  set webview(webview) {
    this._webview = webview;
  }

  @computed get url(): string {
    if (this.recipe.hasCustomUrl && this.customUrl) {
      let url: string = '';
      try {
        url = normalizedUrl(this.customUrl);
      } catch {
        console.error(
          `Service (${this.recipe.name}): '${this.customUrl}' is not a valid Url.`,
        );
      }

      const { buildUrl } = this.recipe;
      if (typeof buildUrl === 'function') {
        url = buildUrl(url);
      }

      return url;
    }

    if (this.recipe.hasTeamId && this.team) {
      return this.recipe.serviceURL.replace('{teamId}', this.team);
    }

    return this.recipe.serviceURL;
  }

  @computed get icon(): string {
    if (this.useFavicon) {
      return getFaviconUrl(this.url);
    }

    if (this.iconUrl) {
      if (needsToken()) {
        let url: URL;
        try {
          url = new URL(this.iconUrl);
        } catch (error) {
          debug('Invalid url', this.iconUrl, error);
          return this.iconUrl;
        }
        const requestStore = (window as any).ferdium.stores.requests;
        // Make sure we only pass the token to the local server.
        if (url.origin === requestStore.localServerOrigin) {
          url.searchParams.set('token', requestStore.localServerToken);
          return url.toString();
        }
      }
      return this.iconUrl;
    }

    if (this.recipe.defaultIcon) {
      return this.recipe.defaultIcon;
    }

    return join(this.recipe.path, 'icon.svg');
  }

  @computed get hasCustomIcon(): boolean {
    return Boolean(this.iconUrl);
  }

  @computed get userAgent(): string {
    return this.userAgentModel.userAgent;
  }

  @computed get userAgentPref(): string | null {
    return this.userAgentModel.userAgentPref;
  }

  set userAgentPref(pref) {
    this.userAgentModel.userAgentPref = pref;
  }

  @computed get defaultUserAgent(): string {
    return this.userAgentModel.defaultUserAgent;
  }

  @computed get partition(): string {
    return this.recipe.partition || `persist:service-${this.id}`;
  }

  initializeWebViewEvents({ handleIPCMessage, openWindow, stores }): void {
    const webviewWebContents = webContents.fromId(
      this.webview.getWebContentsId(),
    );

    this.userAgentModel.setWebviewReference(this.webview);

    // If the recipe has implemented 'modifyRequestHeaders',
    // Send those headers to ipcMain so that it can be set in session
    if (typeof this.recipe.modifyRequestHeaders === 'function') {
      const modifiedRequestHeaders = this.recipe.modifyRequestHeaders();
      debug(this.name, 'modifiedRequestHeaders', modifiedRequestHeaders);
      ipcRenderer.send('modifyRequestHeaders', {
        modifiedRequestHeaders,
        serviceId: this.id,
      });
    } else {
      debug(this.name, 'modifyRequestHeaders is not defined in the recipe');
    }

    // if the recipe has implemented 'knownCertificateHosts'
    if (typeof this.recipe.knownCertificateHosts === 'function') {
      const knownHosts = this.recipe.knownCertificateHosts();
      debug(this.name, 'knownCertificateHosts', knownHosts);
      ipcRenderer.send('knownCertificateHosts', {
        knownHosts,
        serviceId: this.id,
      });
    } else {
      debug(this.name, 'knownCertificateHosts is not defined in the recipe');
    }

    this.webview.addEventListener('ipc-message', async e => {
      if (e.channel === 'inject-js-unsafe') {
        await Promise.all(
          e.args.map(script =>
            this.webview.executeJavaScript(
              `"use strict"; (() => { ${script} })();`,
            ),
          ),
        );
      } else {
        handleIPCMessage({
          serviceId: this.id,
          channel: e.channel,
          args: e.args,
        });
      }
    });

    this.webview.addEventListener(
      'new-window',
      (event, url, frameName, options) => {
        debug('new-window', event, url, frameName, options);
        if (!isValidExternalURL(event.url)) {
          return;
        }
        if (
          event.disposition === 'foreground-tab' ||
          event.disposition === 'background-tab'
        ) {
          openWindow({
            event,
            url,
            frameName,
            options,
          });
        } else {
          ipcRenderer.send('open-browser-window', {
            url: event.url,
            serviceId: this.id,
          });
        }
      },
    );

    this.webview.addEventListener('did-start-loading', event => {
      debug('Did start load', this.name, event);

      this._didStartLoading();
    });

    this.webview.addEventListener('did-stop-loading', event => {
      debug('Did stop load', this.name, event);

      this._didStopLoading();
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const didLoad = () => {
      this._didLoad();
    };

    this.webview.addEventListener('did-frame-finish-load', didLoad.bind(this));
    this.webview.addEventListener('did-navigate', didLoad.bind(this));

    this.webview.addEventListener('did-fail-load', event => {
      debug('Service failed to load', this.name, event);
      if (
        event.isMainFrame &&
        event.errorCode !== -21 &&
        event.errorCode !== -3
      ) {
        this._didFailLoad(event);
      }
    });

    this.webview.addEventListener('crashed', () => {
      debug('Service crashed', this.name);
      this._hasCrashed();
    });

    this.webview.addEventListener('found-in-page', ({ result }) => {
      debug('Found in page', result);
      this.webview.send('found-in-page', result);
    });

    this.webview.addEventListener('media-started-playing', event => {
      debug('Started Playing media', this.name, event);
      this._didMediaPlaying();
    });

    this.webview.addEventListener('media-paused', event => {
      debug('Stopped Playing media', this.name, event);
      this._didMediaPaused();
    });

    if (webviewWebContents) {
      // This is needed to prevent events of the same partition from being registered multiple times (when using custom sandboxes)
      const webviewPartition = webviewWebContents.session.getStoragePath();
      if (webviewPartition) {
        // Check if the partition is already active
        if (activePartitions.has(webviewPartition)) {
          return;
        }

        // Add the partition to the active partitions
        activePartitions.add(webviewPartition);
      }
      // -----

      // TODO: Modify this logic once https://github.com/electron/electron/issues/40674 is fixed
      // This is a workaround for the issue where the zoom in shortcut is not working
      if (!isMac) {
        webviewWebContents.on('before-input-event', (event, input) => {
          if (input.control && input.key === '+' && input.type === 'keyDown') {
            event.preventDefault();
            const currentZoom = this.webview?.getZoomLevel();
            this.webview?.setZoomLevel(currentZoom + 0.5);
          }
        });
      }

      webviewWebContents.session.on('will-download', (event, item) => {
        event.preventDefault();

        const downloadId = uuidV4();

        window['ferdium'].actions.app.addDownload({
          id: downloadId,
          serviceId: this.id,
          filename: item.getFilename(),
          url: item.getURL(),
          savePath: item.getSavePath(),
        });

        item.addListener('updated', (event, state) => {
          if (state === 'interrupted') {
            debug('Download is interrupted but can be resumed');
          } else if (state === 'progressing') {
            if (item.isPaused()) {
              debug('Download is paused');
            } else {
              debug(`Received bytes: ${item.getReceivedBytes()}`);
            }
          }
          window['ferdium'].actions.app.updateDownload({
            id: downloadId,
            serviceId: this.id,
            filename: basename(item.getSavePath()),
            url: item.getURL(),
            savePath: item.getSavePath(),
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes(),
            state,
          });
          debug('download updated', event, state);
        });
        item.addListener('done', (event, state) => {
          debug('download done', event, state);
          if (state === 'completed') {
            debug('Download successfully');
          } else {
            if (state === 'cancelled' && item.getSavePath() === '') {
              window['ferdium'].actions.app.removeDownload(downloadId);
              debug('Download is cancelled');
            }
            debug(`Download failed: ${state}`);
          }

          window['ferdium'].actions.app.endedDownload({
            id: downloadId,
            serviceId: this.id,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes(),
            state,
          });
        });

        ipcRenderer.on('toggle-pause-download', (_, data) => {
          debug('toggle-pause-download', item.isPaused(), item.getState());
          if (data.downloadId === downloadId || data.downloadId === undefined) {
            if (item.isPaused()) {
              item.resume();
            } else {
              item.pause();
            }
          }
          debug('toggle-pause-download', item.isPaused(), item.getState());
          window['ferdium'].actions.app.updateDownload({
            id: downloadId,
            paused: item.isPaused(),
          });
        });

        ipcRenderer.on('stop-download', (_, data) => {
          if (data === undefined || downloadId === data.downloadId) {
            item.cancel();
          }
        });
      });
      webviewWebContents.on('login', (event, _, authInfo, callback) => {
        // const authCallback = callback;
        debug('browser login event', authInfo);
        event.preventDefault();

        if (authInfo.isProxy && authInfo.scheme === 'basic') {
          debug('Sending service echo ping');
          webviewWebContents.send('get-service-id');

          debug('Received service id', this.id);

          const ps = stores.settings.proxy[this.id];

          if (ps) {
            debug('Sending proxy auth callback for service', this.id);
            callback(ps.user, ps.password);
          } else {
            debug('No proxy auth config found for', this.id);
          }
        }
      });
    }
  }

  initializeWebViewListener(): void {
    if (this.webview && this.recipe.events) {
      for (const eventName of Object.keys(this.recipe.events)) {
        const eventHandler = this.recipe[this.recipe.events[eventName]];
        if (typeof eventHandler === 'function') {
          this.webview.addEventListener(eventName, eventHandler);
        }
      }
    }
  }

  resetMessageCount(): void {
    this.unreadDirectMessageCount = 0;
    this.unreadIndirectMessageCount = 0;
  }

  toggleToTalk(): void {
    this.webview?.send('toggle-to-talk');
  }
}
