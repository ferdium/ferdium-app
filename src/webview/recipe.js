/* eslint-disable global-require */
/* eslint-disable import/first */
import { contextBridge, ipcRenderer } from 'electron';
import { join } from 'path';
import { autorun, computed, observable } from 'mobx';
import { pathExistsSync, readFileSync } from 'fs-extra';
import { debounce } from 'lodash';

// For some services darkreader tries to use the chrome extension message API
// This will cause the service to fail loading
// As the message API is not actually needed, we'll add this shim sendMessage
// function in order for darkreader to continue working
window.chrome.runtime.sendMessage = () => {};
import {
  enable as enableDarkMode,
  disable as disableDarkMode,
} from 'darkreader';

import { existsSync } from 'fs';
import ignoreList from './darkmode/ignore';
import customDarkModeCss from './darkmode/custom';

import RecipeWebview from './lib/RecipeWebview';
import Userscript from './lib/Userscript';

import { BadgeHandler } from './badge';
import { DialogTitleHandler } from './dialogTitle';
import { SessionHandler } from './sessionHandler';
import contextMenu from './contextMenu';
import {
  darkModeStyleExists,
  injectDarkModeStyle,
  isDarkModeStyleInjected,
  removeDarkModeStyle,
} from './darkmode';
import FindInPage from './find';
import {
  NotificationsHandler,
  notificationsClassDefinition,
} from './notifications';
import {
  getDisplayMediaSelector,
  screenShareCss,
  screenShareJs,
} from './screenshare';
import {
  switchDict,
  getSpellcheckerLocaleByFuzzyIdentifier,
} from './spellchecker';

import { DEFAULT_APP_SETTINGS } from '../config';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:Plugin');

const badgeHandler = new BadgeHandler();

const dialogTitleHandler = new DialogTitleHandler();

const sessionHandler = new SessionHandler();

const notificationsHandler = new NotificationsHandler();

// Patching window.open
const originalWindowOpen = window.open;

window.open = (url, frameName, features) => {
  console.log('window.open', url, frameName, features);
  if (!url) {
    // The service hasn't yet supplied a URL (as used in Skype).
    // Return a new dummy window object and wait for the service to change the properties
    const newWindow = {
      location: {
        href: '',
      },
    };

    const checkInterval = setInterval(() => {
      // Has the service changed the URL yet?
      if (newWindow.location.href !== '') {
        if (features) {
          originalWindowOpen(newWindow.location.href, frameName, features);
        } else {
          // Open the new URL
          ipcRenderer.sendToHost('new-window', newWindow.location.href);
        }
        clearInterval(checkInterval);
      }
    }, 0);

    setTimeout(() => {
      // Stop checking for location changes after 1 second
      clearInterval(checkInterval);
    }, 1000);

    return newWindow;
  }

  // We need to differentiate if the link should be opened in a popup or in the systems default browser
  if (!frameName && !features && typeof features !== 'string') {
    return ipcRenderer.sendToHost('new-window', url);
  }

  if (url) {
    return originalWindowOpen(url, frameName, features);
  }
};

// We can't override APIs here, so we first expose functions via 'window.ferdium',
// then overwrite the corresponding field of the window object by injected JS.
contextBridge.exposeInMainWorld('ferdium', {
  open: window.open,
  setBadge: (direct, indirect) => badgeHandler.setBadge(direct, indirect),
  safeParseInt: text => badgeHandler.safeParseInt(text),
  setDialogTitle: title => dialogTitleHandler.setDialogTitle(title),
  displayNotification: (title, options) =>
    notificationsHandler.displayNotification(title, options),
  getDisplayMediaSelector,
});

ipcRenderer.sendToHost(
  'inject-js-unsafe',
  'window.open = window.ferdium.open;',
  notificationsClassDefinition,
  screenShareJs,
);

class RecipeController {
  @observable settings = {
    overrideSpellcheckerLanguage: false,
    app: DEFAULT_APP_SETTINGS,
    service: {
      isDarkModeEnabled: false,
      spellcheckerLanguage: '',
    },
  };

  spellcheckProvider = null;

  ipcEvents = {
    'initialize-recipe': 'loadRecipeModule',
    'settings-update': 'updateAppSettings',
    'service-settings-update': 'updateServiceSettings',
    'get-service-id': 'serviceIdEcho',
    'find-in-page': 'openFindInPage',
  };

  universalDarkModeInjected = false;

  recipe = null;

  userscript = null;

  hasUpdatedBeforeRecipeLoaded = false;

  constructor() {
    this.initialize();
  }

  @computed get spellcheckerLanguage() {
    const selected =
      this.settings.service.spellcheckerLanguage ||
      this.settings.app.spellcheckerLanguage;
    return selected;
  }

  cldIdentifier = null;

  findInPage = null;

  async initialize() {
    for (const channel of Object.keys(this.ipcEvents)) {
      ipcRenderer.on(channel, (...args) => {
        console.log('Received IPC event for channel', channel, 'with', ...args);
        this[this.ipcEvents[channel]](...args);
      });
    }

    console.log('Send "hello" to host');
    setTimeout(() => ipcRenderer.sendToHost('hello'), 100);

    this.spellcheckingProvider = null;
    contextMenu(
      () => this.settings.app.enableSpellchecking,
      () => this.settings.app.spellcheckerLanguage,
      () => this.spellcheckerLanguage,
      () => this.settings.app.searchEngine,
      () => this.settings.app.clipboardNotifications,
    );

    autorun(() => this.update());

    document.addEventListener('DOMContentLoaded', () => {
      this.findInPage = new FindInPage({
        inputFocusColor: '#CE9FFC',
        textColor: '#212121',
      });
    });
  }

  loadRecipeModule(event, config, recipe) {
    console.log('loadRecipeModule');
    const modulePath = join(recipe.path, 'webview.js');
    console.log('module path', modulePath);
    // Delete module from cache
    delete require.cache[require.resolve(modulePath)];
    try {
      this.recipe = new RecipeWebview(
        badgeHandler,
        dialogTitleHandler,
        notificationsHandler,
        sessionHandler,
      );
      if (existsSync(modulePath)) {
        // eslint-disable-next-line import/no-dynamic-require
        require(modulePath)(this.recipe, { ...config, recipe });
        console.log('Initialize Recipe', config, recipe);
      }

      this.settings.service = Object.assign(config, { recipe });

      // Make sure to update the WebView, otherwise the custom darkmode handler may not be used
      this.update();
    } catch (error) {
      console.error('Recipe initialization failed', error);
    }

    this.loadUserFiles(recipe, config);
  }

  async loadUserFiles(recipe, config) {
    const styles = document.createElement('style');
    styles.innerHTML = screenShareCss;

    const userCss = join(recipe.path, 'user.css');
    if (pathExistsSync(userCss)) {
      const data = readFileSync(userCss);
      styles.innerHTML += data.toString();
    }
    document.querySelector('head').append(styles);

    const userJs = join(recipe.path, 'user.js');
    if (pathExistsSync(userJs)) {
      const loadUserJs = () => {
        // eslint-disable-next-line import/no-dynamic-require
        const userJsModule = require(userJs);

        if (typeof userJsModule === 'function') {
          this.userscript = new Userscript(this.recipe, this, config);
          userJsModule(config, this.userscript);
        }
      };

      if (document.readyState !== 'loading') {
        loadUserJs();
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          loadUserJs();
        });
      }
    }
  }

  openFindInPage() {
    this.findInPage.openFindWindow();
  }

  update() {
    console.log('enableSpellchecking', this.settings.app.enableSpellchecking);
    console.log('isDarkModeEnabled', this.settings.service.isDarkModeEnabled);
    console.log(
      'System spellcheckerLanguage',
      this.settings.app.spellcheckerLanguage,
    );
    console.log(
      'Service spellcheckerLanguage',
      this.settings.service.spellcheckerLanguage,
    );
    console.log('darkReaderSettigs', this.settings.service.darkReaderSettings);
    console.log('searchEngine', this.settings.app.searchEngine);

    if (this.userscript && this.userscript.internal_setSettings) {
      this.userscript.internal_setSettings(this.settings);
    }

    if (this.settings.app.enableSpellchecking) {
      let { spellcheckerLanguage } = this;
      console.log(`Setting spellchecker language to ${spellcheckerLanguage}`);
      if (spellcheckerLanguage.includes('automatic')) {
        this.automaticLanguageDetection();
        console.log(
          'Found `automatic` locale, falling back to user locale until detected',
          this.settings.app.locale,
        );
        spellcheckerLanguage = this.settings.app.locale;
      }
      switchDict(spellcheckerLanguage, this.settings.service.id);
    } else {
      console.log('Disable spellchecker');
    }

    if (!this.recipe) {
      this.hasUpdatedBeforeRecipeLoaded = true;
    }

    console.log(
      'Darkmode enabled?',
      this.settings.service.isDarkModeEnabled,
      'Dark theme active?',
      this.settings.app.isDarkThemeActive,
    );

    const handlerConfig = {
      removeDarkModeStyle,
      disableDarkMode,
      enableDarkMode,
      injectDarkModeStyle: () =>
        injectDarkModeStyle(this.settings.service.recipe.path),
      isDarkModeStyleInjected,
    };

    if (
      this.settings.service.isDarkModeEnabled &&
      this.settings.app.isDarkThemeActive !== false
    ) {
      console.log('Enable dark mode');

      // Check if recipe has a custom dark mode handler
      if (this.recipe && this.recipe.darkModeHandler) {
        console.log('Using custom dark mode handler');

        // Remove other dark mode styles if they were already loaded
        if (this.hasUpdatedBeforeRecipeLoaded) {
          this.hasUpdatedBeforeRecipeLoaded = false;
          removeDarkModeStyle();
          disableDarkMode();
        }

        this.recipe.darkModeHandler(true, handlerConfig);
      } else if (darkModeStyleExists(this.settings.service.recipe.path)) {
        console.log('Injecting darkmode from recipe');
        injectDarkModeStyle(this.settings.service.recipe.path);

        // Make sure universal dark mode is disabled
        disableDarkMode();
        this.universalDarkModeInjected = false;
      } else if (
        this.settings.app.universalDarkMode &&
        !ignoreList.includes(window.location.host)
      ) {
        console.log('Injecting Dark Reader');

        // Use Dark Reader instead
        const { brightness, contrast, sepia } =
          this.settings.service.darkReaderSettings;
        enableDarkMode(
          { brightness, contrast, sepia },
          {
            css: customDarkModeCss[window.location.host] || '',
          },
        );
        this.universalDarkModeInjected = true;
      }
    } else {
      console.log('Remove dark mode');
      console.log('DarkMode disabled - removing remaining styles');

      if (this.recipe && this.recipe.darkModeHandler) {
        // Remove other dark mode styles if they were already loaded
        if (this.hasUpdatedBeforeRecipeLoaded) {
          this.hasUpdatedBeforeRecipeLoaded = false;
          removeDarkModeStyle();
          disableDarkMode();
        }

        this.recipe.darkModeHandler(false, handlerConfig);
      } else if (isDarkModeStyleInjected()) {
        console.log('Removing injected darkmode from recipe');
        removeDarkModeStyle();
      } else {
        console.log('Removing Dark Reader');

        disableDarkMode();
        this.universalDarkModeInjected = false;
      }
    }

    // Remove dark reader if (universal) dark mode was just disabled
    if (
      this.universalDarkModeInjected &&
      (!this.settings.app.darkMode ||
        !this.settings.service.isDarkModeEnabled ||
        !this.settings.app.universalDarkMode)
    ) {
      disableDarkMode();
      this.universalDarkModeInjected = false;
    }
  }

  updateAppSettings(event, data) {
    this.settings.app = Object.assign(this.settings.app, data);
  }

  updateServiceSettings(event, data) {
    this.settings.service = Object.assign(this.settings.service, data);
  }

  serviceIdEcho(event) {
    console.log('Received a service echo ping');
    event.sender.send('service-id', this.settings.service.id);
  }

  async automaticLanguageDetection() {
    window.addEventListener(
      'keyup',
      debounce(async e => {
        const element = e.target;

        if (!element) return;

        let value = '';
        if (element.isContentEditable) {
          value = element.textContent;
        } else if (element.value) {
          value = element.value;
        }

        // Force a minimum length to get better detection results
        if (value.length < 25) return;

        console.log('Detecting language for', value);
        const locale = await ipcRenderer.invoke('detect-language', {
          sample: value,
        });
        if (!locale) {
          return;
        }

        const spellcheckerLocale =
          getSpellcheckerLocaleByFuzzyIdentifier(locale);
        console.log(
          'Language detected reliably, setting spellchecker language to',
          spellcheckerLocale,
        );
        if (spellcheckerLocale) {
          switchDict(spellcheckerLocale, this.settings.service.id);
        }
      }, 225),
    );
  }
}

/* eslint-disable no-new */
new RecipeController();
/* eslint-enable no-new */
