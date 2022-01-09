import { action, observable, computed, reaction } from 'mobx';
import { nativeTheme } from '@electron/remote';

import { theme, ThemeType } from '../themes';
import Store from './lib/Store';

export default class UIStore extends Store {
  @observable showServicesUpdatedInfoBar = false;

  @observable isOsDarkThemeActive = nativeTheme.shouldUseDarkColors;

  constructor(...args) {
    super(...args);

    // Register action handlers
    this.actions.ui.openSettings.listen(this._openSettings.bind(this));
    this.actions.ui.closeSettings.listen(this._closeSettings.bind(this));
    this.actions.ui.toggleServiceUpdatedInfoBar.listen(
      this._toggleServiceUpdatedInfoBar.bind(this),
    );

    // Listen for theme change
    nativeTheme.on('updated', () => {
      this.isOsDarkThemeActive = nativeTheme.shouldUseDarkColors;
      this.actions.service.shareSettingsWithServiceProcess();
    });
  }

  setup() {
    reaction(
      () => this.isDarkThemeActive,
      () => {
        this._setupThemeInDOM();
      },
      { fireImmediately: true },
    );
    reaction(
      () => this.isSplitModeActive,
      () => {
        this._setupModeInDOM();
      },
      { fireImmediately: true },
    );
    reaction(
      () => this.splitColumnsNo,
      () => {
        this._setupColumnsInDOM();
      },
      { fireImmediately: true },
    );
  }

  @computed get showMessageBadgesEvenWhenMuted() {
    const settings = this.stores.settings.all;

    return (
      (settings.app.isAppMuted && settings.app.showMessageBadgeWhenMuted) ||
      !settings.app.isAppMuted
    );
  }

  @computed get isDarkThemeActive() {
    const isWithAdaptableInDarkMode =
      this.stores.settings.all.app.adaptableDarkMode &&
      this.isOsDarkThemeActive;
    const isWithoutAdaptableInDarkMode =
      this.stores.settings.all.app.darkMode &&
      !this.stores.settings.all.app.adaptableDarkMode;
    const isInDarkMode = this.stores.settings.all.app.darkMode;
    return !!(
      isWithAdaptableInDarkMode ||
      isWithoutAdaptableInDarkMode ||
      isInDarkMode
    );
  }

  @computed get isSplitModeActive() {
    return this.stores.settings.app.splitMode;
  }

  @computed get splitColumnsNo() {
    return this.stores.settings.app.splitColumns;
  }

  @computed get theme() {
    const themeId =
      this.isDarkThemeActive || this.stores.settings.app.darkMode
        ? ThemeType.dark
        : ThemeType.default;
    const { accentColor } = this.stores.settings.app;
    return theme(themeId, accentColor);
  }

  // Actions
  @action _openSettings({ path = '/settings' }) {
    const settingsPath = path !== '/settings' ? `/settings/${path}` : path;
    this.stores.router.push(settingsPath);
  }

  @action _closeSettings() {
    this.stores.router.push('/');
  }

  @action _toggleServiceUpdatedInfoBar({ visible }) {
    let visibility = visible;
    if (visibility === null) {
      visibility = !this.showServicesUpdatedInfoBar;
    }
    this.showServicesUpdatedInfoBar = visibility;
  }

  // Reactions
  _setupThemeInDOM() {
    if (!this.isDarkThemeActive) {
      document.body.classList.remove('theme__dark');
    } else {
      document.body.classList.add('theme__dark');
    }
  }

  _setupModeInDOM() {
    if (!this.isSplitModeActive) {
      document.body.classList.remove('mode__split');
    } else {
      document.body.classList.add('mode__split');
      document.body.dataset.columns = this.splitColumnsNo;
    }
  }

  _setupColumnsInDOM() {
    document.body.dataset.columns = this.splitColumnsNo;
  }
}
