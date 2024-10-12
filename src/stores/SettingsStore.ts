import { getCurrentWindow } from '@electron/remote';
import { ipcRenderer } from 'electron';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import localStorage from 'mobx-localstorage';
import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_SHORTCUTS,
  FILE_SYSTEM_SETTINGS_TYPES,
  LOCAL_SERVER,
} from '../config';
import { hash } from '../helpers/password-helpers';
import TypedStore from './lib/TypedStore';

const debug = require('../preload-safe-debug')('Ferdium:SettingsStore');

export default class SettingsStore extends TypedStore {
  @observable loaded: boolean = false;

  fileSystemSettingsTypes = FILE_SYSTEM_SETTINGS_TYPES;

  @observable _fileSystemSettingsCache = {
    app: DEFAULT_APP_SETTINGS,
    proxy: {},
    shortcuts: DEFAULT_SHORTCUTS,
  };

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.settings.update.listen(this._update.bind(this));
    this.actions.settings.remove.listen(this._remove.bind(this));
  }

  async setup(): Promise<void> {
    await this._migrate();

    reaction(
      () => this.all.app.autohideMenuBar,
      () => {
        const currentWindow = getCurrentWindow();
        currentWindow.setMenuBarVisibility(!this.all.app.autohideMenuBar);
        currentWindow.autoHideMenuBar = this.all.app.autohideMenuBar;
      },
    );

    reaction(
      () => this.all.app.server,
      server => {
        if (server === LOCAL_SERVER) {
          ipcRenderer.send('startLocalServer');
        }
      },
      { fireImmediately: true },
    );

    // Inactivity lock timer
    let inactivityTimer;
    getCurrentWindow().on('blur', () => {
      if (
        this.all.app.isLockingFeatureEnabled &&
        this.all.app.inactivityLock !== 0
      ) {
        inactivityTimer = setTimeout(
          () => {
            this.actions.settings.update({
              type: 'app',
              data: {
                locked: true,
              },
            });
          },
          this.all.app.inactivityLock * 1000 * 60,
        );
      }
    });
    getCurrentWindow().on('focus', () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    });

    ipcRenderer.on('appSettings', (_, resp) => {
      // Lock on startup if enabled in settings
      if (
        !this.loaded &&
        resp.type === 'app' &&
        resp.data.isLockingFeatureEnabled
      ) {
        process.nextTick(() => {
          if (!this.all.app.locked) {
            this.all.app.locked = true;
          }
        });
      }
      debug('Get appSettings resolves', resp.type, resp.data);
      this.actions.settings.update({
        type: resp.type,
        data: resp.data,
      });
      this.setLoaded();
      ipcRenderer.send('initialAppSettings', resp);
    });

    for (const type of this.fileSystemSettingsTypes) {
      ipcRenderer.send('getAppSettings', type);
    }
  }

  @computed get app() {
    return this._fileSystemSettingsCache.app || DEFAULT_APP_SETTINGS;
  }

  @computed get proxy() {
    return this._fileSystemSettingsCache.proxy || {};
  }

  @computed get service() {
    return (
      localStorage.getItem('service') || {
        activeService: '',
      }
    );
  }

  @computed get shortcuts() {
    return this._fileSystemSettingsCache.shortcuts || DEFAULT_SHORTCUTS;
  }

  @computed get stats() {
    return (
      localStorage.getItem('stats') || {
        activeService: '',
      }
    );
  }

  @computed get migration() {
    return localStorage.getItem('migration') || {};
  }

  @computed get all() {
    return {
      app: this.app,
      proxy: this.proxy,
      service: this.service,
      stats: this.stats,
      migration: this.migration,
      shortcuts: this.shortcuts,
    };
  }

  @action async setLoaded(): Promise<void> {
    this.loaded = true;
  }

  @action async _update({ type, data }): Promise<void> {
    const appSettings = this.all;
    if (this.fileSystemSettingsTypes.includes(type)) {
      debug('Update settings on file system', type, data);
      ipcRenderer.send('updateAppSettings', {
        type,
        data,
      });

      Object.assign(this._fileSystemSettingsCache[type], data);
    } else {
      debug('Update settings', type, data, this.all);
      localStorage.setItem(type, Object.assign(appSettings[type], data));
    }
  }

  @action async _remove({ type, key }): Promise<void> {
    if (type === 'app') return; // app keys can't be deleted

    const appSettings = this.all[type];
    if (Object.hasOwnProperty.call(appSettings, key)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete appSettings[key];

      this.actions.settings.update({
        type,
        data: appSettings,
      });
    }
  }

  _ensureMigrationAndMarkDone(
    migrationName: string,
    callback: () => void,
  ): void {
    if (!this.all.migration[migrationName]) {
      callback();

      const data = {};
      data[migrationName] = true;
      this.actions.settings.update({
        type: 'migration',
        data,
      });
    }
  }

  // Helper
  async _migrate(): Promise<void> {
    this._ensureMigrationAndMarkDone('password-hashing', () => {
      if (this.stores.settings.app.lockedPassword !== '') {
        const legacySettings = localStorage.getItem('app') || {};
        this.actions.settings.update({
          type: 'app',
          data: {
            lockedPassword: hash(String(legacySettings.lockedPassword)),
          },
        });
      }

      debug('Migrated password-hashing settings');
    });

    this._ensureMigrationAndMarkDone('5.6.0-beta.6-settings', () => {
      this.actions.settings.update({
        type: 'app',
        data: {
          searchEngine: DEFAULT_APP_SETTINGS.searchEngine,
        },
      });

      debug('Migrated default search engine settings');
    });

    this._ensureMigrationAndMarkDone('user-agent-settings', () => {
      this.actions.settings.update({
        type: 'app',
        data: {
          userAgentPref: DEFAULT_APP_SETTINGS.userAgentPref,
        },
      });

      debug('Migrated default user-agent settings');
    });
  }
}
