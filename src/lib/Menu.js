import { clipboard } from 'electron';
import {
  app,
  Menu,
  dialog,
  webContents,
  systemPreferences,
  getCurrentWindow,
} from '@electron/remote';
import { autorun, observable } from 'mobx';
import { defineMessages } from 'react-intl';
import osName from 'os-name';
import {
  CUSTOM_WEBSITE_RECIPE_ID,
  GITHUB_FERDIUM_URL,
  LIVE_API_FERDIUM_WEBSITE,
} from '../config';
import {
  cmdOrCtrlShortcutKey,
  altKey,
  shiftKey,
  settingsShortcutKey,
  isLinux,
  isMac,
  lockFerdiumShortcutKey,
  todosToggleShortcutKey,
  workspaceToggleShortcutKey,
  addNewServiceShortcutKey,
  splitModeToggleShortcutKey,
  muteFerdiumShortcutKey,
  electronVersion,
  chromeVersion,
  nodeVersion,
  osArch,
} from '../environment';
import { ferdiumVersion } from '../environment-remote';
import { todoActions } from '../features/todos/actions';
import workspaceActions from '../features/workspaces/actions';
import { workspaceStore } from '../features/workspaces/index';
import apiBase, { serverBase } from '../api/apiBase';
import { openExternalUrl } from '../helpers/url-helpers';
import globalMessages from '../i18n/globalMessages';

// @ts-expect-error Cannot find module '../buildInfo.json' or its corresponding type declarations.
import * as buildInfo from '../buildInfo.json';

const menuItems = defineMessages({
  edit: {
    id: 'menu.edit',
    defaultMessage: 'Edit',
  },
  undo: {
    id: 'menu.edit.undo',
    defaultMessage: 'Undo',
  },
  redo: {
    id: 'menu.edit.redo',
    defaultMessage: 'Redo',
  },
  cut: {
    id: 'menu.edit.cut',
    defaultMessage: 'Cut',
  },
  copy: {
    id: 'menu.edit.copy',
    defaultMessage: 'Copy',
  },
  paste: {
    id: 'menu.edit.paste',
    defaultMessage: 'Paste',
  },
  pasteAndMatchStyle: {
    id: 'menu.edit.pasteAndMatchStyle',
    defaultMessage: 'Paste And Match Style',
  },
  delete: {
    id: 'menu.edit.delete',
    defaultMessage: 'Delete',
  },
  selectAll: {
    id: 'menu.edit.selectAll',
    defaultMessage: 'Select All',
  },
  findInPage: {
    id: 'menu.edit.findInPage',
    defaultMessage: 'Find in Page',
  },
  speech: {
    id: 'menu.edit.speech',
    defaultMessage: 'Speech',
  },
  startSpeaking: {
    id: 'menu.edit.startSpeaking',
    defaultMessage: 'Start Speaking',
  },
  stopSpeaking: {
    id: 'menu.edit.stopSpeaking',
    defaultMessage: 'Stop Speaking',
  },
  startDictation: {
    id: 'menu.edit.startDictation',
    defaultMessage: 'Start Dictation',
  },
  emojiSymbols: {
    id: 'menu.edit.emojiSymbols',
    defaultMessage: 'Emoji & Symbols',
  },
  openQuickSwitch: {
    id: 'menu.view.openQuickSwitch',
    defaultMessage: 'Open Quick Switch',
  },
  back: {
    id: 'menu.view.back',
    defaultMessage: 'Back',
  },
  forward: {
    id: 'menu.view.forward',
    defaultMessage: 'Forward',
  },
  resetZoom: {
    id: 'menu.view.resetZoom',
    defaultMessage: 'Actual Size',
  },
  zoomIn: {
    id: 'menu.view.zoomIn',
    defaultMessage: 'Zoom In',
  },
  zoomOut: {
    id: 'menu.view.zoomOut',
    defaultMessage: 'Zoom Out',
  },
  toggleFullScreen: {
    id: 'menu.view.toggleFullScreen',
    defaultMessage: 'Toggle Full Screen',
  },
  toggleNavigationBar: {
    id: 'menu.view.toggleNavigationBar',
    defaultMessage: 'Toggle Navigation Bar',
  },
  splitModeToggle: {
    id: 'menu.view.splitModeToggle',
    defaultMessage: 'Toggle Split Mode',
  },
  toggleDarkMode: {
    id: 'menu.view.toggleDarkMode',
    defaultMessage: 'Toggle Dark Mode',
  },
  toggleDevTools: {
    id: 'menu.view.toggleDevTools',
    defaultMessage: 'Toggle Developer Tools',
  },
  toggleTodosDevTools: {
    id: 'menu.view.toggleTodosDevTools',
    defaultMessage: 'Toggle Todos Developer Tools',
  },
  toggleServiceDevTools: {
    id: 'menu.view.toggleServiceDevTools',
    defaultMessage: 'Toggle Service Developer Tools',
  },
  reloadService: {
    id: 'menu.view.reloadService',
    defaultMessage: 'Reload Service',
  },
  reloadFerdium: {
    id: 'menu.view.reloadFerdium',
    defaultMessage: 'Reload Ferdium',
  },
  lockFerdium: {
    id: 'menu.view.lockFerdium',
    defaultMessage: 'Lock Ferdium',
  },
  reloadTodos: {
    id: 'menu.view.reloadTodos',
    defaultMessage: 'Reload ToDos',
  },
  minimize: {
    id: 'menu.window.minimize',
    defaultMessage: 'Minimize',
  },
  close: {
    id: 'menu.window.close',
    defaultMessage: 'Close',
  },
  learnMore: {
    id: 'menu.help.learnMore',
    defaultMessage: 'Learn More',
  },
  changelog: {
    id: 'menu.help.changelog',
    defaultMessage: 'Changelog',
  },
  importExportData: {
    id: 'menu.help.importExportData',
    defaultMessage: 'Import/Export Configuration Data',
  },
  support: {
    id: 'menu.help.support',
    defaultMessage: 'Support',
  },
  debugInfo: {
    id: 'menu.help.debugInfo',
    defaultMessage: 'Copy Debug Information',
  },
  publishDebugInfo: {
    id: 'menu.help.publishDebugInfo',
    defaultMessage: 'Publish Debug Information',
  },
  debugInfoCopiedHeadline: {
    id: 'menu.help.debugInfoCopiedHeadline',
    defaultMessage: 'Ferdium Debug Information',
  },
  debugInfoCopiedBody: {
    id: 'menu.help.debugInfoCopiedBody',
    defaultMessage: 'Your Debug Information has been copied to your clipboard.',
  },
  touchId: {
    id: 'locked.touchId',
    defaultMessage: 'Unlock with Touch ID',
  },
  touchIdPrompt: {
    id: 'locked.touchIdPrompt',
    defaultMessage: 'unlock via Touch ID',
  },
  tos: {
    id: 'menu.help.tos',
    defaultMessage: 'Terms of Service',
  },
  privacy: {
    id: 'menu.help.privacy',
    defaultMessage: 'Privacy Statement',
  },
  file: {
    id: 'menu.file',
    defaultMessage: 'File',
  },
  view: {
    id: 'menu.view',
    defaultMessage: 'View',
  },
  services: {
    id: 'menu.services',
    defaultMessage: 'Services',
  },
  window: {
    id: 'menu.window',
    defaultMessage: 'Window',
  },
  help: {
    id: 'menu.help',
    defaultMessage: 'Help',
  },
  about: {
    id: 'menu.app.about',
    defaultMessage: 'About Ferdium',
  },
  checkForUpdates: {
    id: 'menu.app.checkForUpdates',
    defaultMessage: 'Check for updates',
  },
  hide: {
    id: 'menu.app.hide',
    defaultMessage: 'Hide',
  },
  hideOthers: {
    id: 'menu.app.hideOthers',
    defaultMessage: 'Hide Others',
  },
  unhide: {
    id: 'menu.app.unhide',
    defaultMessage: 'Unhide',
  },
  autohideMenuBar: {
    id: 'menu.app.autohideMenuBar',
    defaultMessage: 'Auto-hide menu bar',
  },
  addNewService: {
    id: 'menu.services.addNewService',
    defaultMessage: 'Add New Service...',
  },
  addNewWorkspace: {
    id: 'menu.workspaces.addNewWorkspace',
    defaultMessage: 'Add New Workspace...',
  },
  openWorkspaceDrawer: {
    id: 'menu.workspaces.openWorkspaceDrawer',
    defaultMessage: 'Open workspace drawer',
  },
  closeWorkspaceDrawer: {
    id: 'menu.workspaces.closeWorkspaceDrawer',
    defaultMessage: 'Close workspace drawer',
  },
  activateNextService: {
    id: 'menu.services.setNextServiceActive',
    defaultMessage: 'Activate next service',
  },
  activatePreviousService: {
    id: 'menu.services.activatePreviousService',
    defaultMessage: 'Activate previous service',
  },
  muteApp: {
    id: 'sidebar.muteApp',
    defaultMessage: 'Disable notifications & audio',
  },
  unmuteApp: {
    id: 'sidebar.unmuteApp',
    defaultMessage: 'Enable notifications & audio',
  },
  workspaces: {
    id: 'menu.workspaces',
    defaultMessage: 'Workspaces',
  },
  defaultWorkspace: {
    id: 'menu.workspaces.defaultWorkspace',
    defaultMessage: 'All services',
  },
  todos: {
    id: 'menu.todos',
    defaultMessage: 'Todos',
  },
  openTodosDrawer: {
    id: 'menu.Todoss.openTodosDrawer',
    defaultMessage: 'Open Todos drawer',
  },
  closeTodosDrawer: {
    id: 'menu.Todoss.closeTodosDrawer',
    defaultMessage: 'Close Todos drawer',
  },
  enableTodos: {
    id: 'menu.todos.enableTodos',
    defaultMessage: 'Enable Todos',
  },
  serviceGoHome: {
    id: 'menu.services.goHome',
    defaultMessage: 'Home',
  },
  ok: {
    id: 'global.ok',
    defaultMessage: 'Ok',
  },
  copyToClipboard: {
    id: 'menu.services.copyToClipboard',
    defaultMessage: 'Copy to clipboard',
  },
});

function getActiveService() {
  return window['ferdium'].stores.services.active;
}

const _titleBarTemplateFactory = (intl, locked) => [
  {
    label: intl.formatMessage(menuItems.edit),
    accelerator: `${altKey()}+E`,
    submenu: [
      {
        label: intl.formatMessage(menuItems.undo),
        role: 'undo',
      },
      {
        label: intl.formatMessage(menuItems.redo),
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.cut),
        accelerator: `${cmdOrCtrlShortcutKey()}+X`,
        role: 'cut',
      },
      {
        label: intl.formatMessage(menuItems.copy),
        accelerator: `${cmdOrCtrlShortcutKey()}+C`,
        role: 'copy',
      },
      {
        label: intl.formatMessage(menuItems.paste),
        accelerator: `${cmdOrCtrlShortcutKey()}+V`,
        role: 'paste',
      },
      {
        label: intl.formatMessage(menuItems.pasteAndMatchStyle),
        accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+V`, // Override the accelerator since this adds new key combo in macos
        role: 'pasteAndMatchStyle',
      },
      {
        label: intl.formatMessage(menuItems.delete),
        role: 'delete',
      },
      {
        label: intl.formatMessage(menuItems.selectAll),
        accelerator: `${cmdOrCtrlShortcutKey()}+A`,
        role: 'selectall',
      },
    ],
  },
  {
    label: intl.formatMessage(menuItems.view),
    accelerator: `${altKey()}+V`,
    visible: !locked,
    submenu: [
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.openQuickSwitch),
        accelerator: `${cmdOrCtrlShortcutKey()}+S`,
        click() {
          window['ferdium'].features.quickSwitch.state.isModalVisible = true;
        },
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.findInPage),
        accelerator: `${cmdOrCtrlShortcutKey()}+F`,
        click() {
          const service = getActiveService();
          // Check if there is a service active
          if (service) {
            // Focus webview so find in page popup gets focused
            service.webview.focus();

            window['ferdium'].actions.service.sendIPCMessage({
              serviceId: service.id,
              channel: 'find-in-page',
              args: {},
            });
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.back),
        accelerator: `${!isMac ? altKey() : cmdOrCtrlShortcutKey()}+Left`,
        click() {
          getActiveService().webview.goBack();
        },
      },
      {
        label: intl.formatMessage(menuItems.forward),
        accelerator: `${!isMac ? altKey() : cmdOrCtrlShortcutKey()}+Right`,
        click() {
          getActiveService().webview.goForward();
        },
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.resetZoom),
        accelerator: `${cmdOrCtrlShortcutKey()}+0`,
        click() {
          getActiveService().webview.setZoomLevel(0);
        },
      },
      {
        label: intl.formatMessage(menuItems.zoomIn),
        accelerator: `${cmdOrCtrlShortcutKey()}+plus`,
        click() {
          const activeService = getActiveService().webview;
          const level = activeService.getZoomLevel();

          activeService.setZoomLevel(level + 0.5);
        },
      },
      {
        label: intl.formatMessage(menuItems.zoomOut),
        accelerator: `${cmdOrCtrlShortcutKey()}+-`,
        click() {
          const activeService = getActiveService().webview;
          const level = activeService.getZoomLevel();

          activeService.setZoomLevel(level - 0.5);
        },
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.toggleFullScreen),
        role: 'toggleFullScreen',
      },
      {
        label: intl.formatMessage(menuItems.toggleNavigationBar),
        accelerator: `${cmdOrCtrlShortcutKey()}+B`,
        role: 'toggleNavigationBar',
        type: 'checkbox',
        checked:
          window['ferdium'].stores.settings.app.navigationBarManualActive,
        click: () => {
          window['ferdium'].actions.settings.update({
            type: 'app',
            data: {
              navigationBarManualActive:
                !window['ferdium'].stores.settings.app
                  .navigationBarManualActive,
            },
          });
        },
      },
      {
        label: intl.formatMessage(menuItems.splitModeToggle),
        accelerator: `${splitModeToggleShortcutKey()}`,
        role: 'splitModeToggle',
        type: 'checkbox',
        checked: window['ferdium'].stores.settings.app.splitMode,
        click: () => {
          window['ferdium'].actions.settings.update({
            type: 'app',
            data: {
              splitMode: !window['ferdium'].stores.settings.app.splitMode,
            },
          });
        },
      },
      {
        label: intl.formatMessage(menuItems.toggleDarkMode),
        type: 'checkbox',
        accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+D`,
        checked: window['ferdium'].stores.settings.app.darkMode,
        click: () => {
          window['ferdium'].actions.settings.update({
            type: 'app',
            data: {
              darkMode: !window['ferdium'].stores.settings.app.darkMode,
            },
          });
        },
      },
    ],
  },
  {
    label: intl.formatMessage(menuItems.services),
    accelerator: `${altKey()}+S`,
    visible: !locked,
    submenu: [],
  },
  {
    label: intl.formatMessage(menuItems.workspaces),
    accelerator: `${altKey()}+W`,
    submenu: [],
    visible: !locked,
  },
  {
    label: intl.formatMessage(menuItems.todos),
    submenu: [],
    visible: !locked,
  },
  {
    label: intl.formatMessage(menuItems.window),
    role: 'window',
    submenu: [
      {
        label: intl.formatMessage(menuItems.minimize),
        role: 'minimize',
      },
      {
        label: intl.formatMessage(menuItems.close),
        role: 'close',
      },
    ],
  },
  {
    label: intl.formatMessage(menuItems.help),
    accelerator: `${altKey()}+H`,
    role: 'help',
    submenu: [
      {
        label: intl.formatMessage(menuItems.learnMore),
        click() {
          openExternalUrl(LIVE_API_FERDIUM_WEBSITE, true);
        },
      },
      {
        label: intl.formatMessage(menuItems.changelog),
        click() {
          openExternalUrl(
            `${GITHUB_FERDIUM_URL}/ferdium-app/releases/tag/v${ferdiumVersion}`,
            true,
          );
        },
      },
      {
        label: intl.formatMessage(menuItems.importExportData),
        click() {
          openExternalUrl(apiBase(false), true);
        },
        enabled: !locked,
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.support),
        click() {
          openExternalUrl(`${LIVE_API_FERDIUM_WEBSITE}/contact`, true);
        },
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.tos),
        click() {
          openExternalUrl(`${serverBase()}/terms`, true);
        },
      },
      {
        label: intl.formatMessage(menuItems.privacy),
        click() {
          openExternalUrl(`${serverBase()}/privacy`, true);
        },
      },
    ],
  },
];

class FranzMenu {
  @observable currentTemplate = [];

  constructor(stores, actions) {
    this.stores = stores;
    this.actions = actions;

    setTimeout(() => {
      autorun(this._build.bind(this));
    }, 10);
  }

  rebuild() {
    this._build();
  }

  get template() {
    return this.currentTemplate.toJS();
  }

  _build() {
    // need to clone object so we don't modify computed (cached) object
    const serviceTpl = Object.assign([], this.serviceTpl());

    // Don't initialize when window['ferdium'] is undefined
    if (window['ferdium'] === undefined) {
      console.log('skipping menu init');
      return;
    }

    const { intl } = window['ferdium'];
    const locked =
      this.stores.settings.app.locked &&
      this.stores.settings.app.lockingFeatureEnabled &&
      this.stores.user.isLoggedIn;
    const tpl = _titleBarTemplateFactory(intl, locked);
    const { actions } = this;

    if (!isMac) {
      tpl[1].submenu.push({
        label: intl.formatMessage(menuItems.autohideMenuBar),
        type: 'checkbox',
        checked: window['ferdium'].stores.settings.app.autohideMenuBar,
        click: () => {
          window['ferdium'].actions.settings.update({
            type: 'app',
            data: {
              autohideMenuBar:
                !window['ferdium'].stores.settings.app.autohideMenuBar,
            },
          });
        },
      });
    }

    if (!locked) {
      tpl[1].submenu.push(
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(menuItems.toggleDevTools),
          accelerator: `${cmdOrCtrlShortcutKey()}+${altKey()}+I`,
          click: () => {
            const windowWebContents = webContents.fromId(1);
            const { isDevToolsOpened, openDevTools, closeDevTools } =
              windowWebContents;

            if (isDevToolsOpened()) {
              closeDevTools();
            } else {
              openDevTools({ mode: 'right' });
            }
          },
        },
        {
          label: intl.formatMessage(menuItems.toggleServiceDevTools),
          accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+${altKey()}+I`,
          click: () => {
            this.actions.service.openDevToolsForActiveService();
          },
          enabled:
            this.stores.user.isLoggedIn &&
            this.stores.services.enabled.length > 0,
        },
      );

      if (this.stores.todos.isFeatureEnabledByUser) {
        tpl[1].submenu.push({
          label: intl.formatMessage(menuItems.toggleTodosDevTools),
          accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+${altKey()}+O`,
          click: () => {
            const webview = document.querySelector('#todos-panel webview');
            if (webview) this.actions.todos.openDevTools();
          },
        });
      }

      tpl[1].submenu.unshift(
        {
          label: intl.formatMessage(menuItems.reloadService),
          accelerator: `${cmdOrCtrlShortcutKey()}+R`,
          click: () => {
            if (
              this.stores.user.isLoggedIn &&
              this.stores.services.enabled.length > 0
            ) {
              if (getActiveService().recipe.id === CUSTOM_WEBSITE_RECIPE_ID) {
                getActiveService().webview.reload();
              } else {
                this.actions.service.reloadActive();
              }
            } else {
              window.location.reload();
            }
          },
        },
        {
          label: intl.formatMessage(menuItems.reloadFerdium),
          accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+R`,
          click: () => {
            window.location.reload();
          },
        },
        {
          label: intl.formatMessage(menuItems.reloadTodos),
          accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+${altKey()}+R`,
          click: () => {
            this.actions.todos.reload();
          },
        },
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(menuItems.lockFerdium),
          accelerator: `${lockFerdiumShortcutKey()}`,
          enabled:
            this.stores.user.isLoggedIn &&
            this.stores.settings.app.lockingFeatureEnabled,
          click() {
            actions.settings.update({
              type: 'app',
              data: {
                locked: true,
              },
            });
          },
        },
      );

      if (serviceTpl.length > 0) {
        tpl[2].submenu = serviceTpl;
      }

      tpl[3].submenu = this.workspacesMenu();

      tpl[4].submenu = this.todosMenu();
    } else {
      const touchIdEnabled = isMac
        ? this.stores.settings.app.useTouchIdToUnlock &&
          systemPreferences.canPromptTouchID()
        : false;

      tpl[0].submenu.unshift(
        {
          label: intl.formatMessage(menuItems.touchId),
          accelerator: `${lockFerdiumShortcutKey()}`,
          visible: touchIdEnabled,
          click() {
            systemPreferences
              .promptTouchID(intl.formatMessage(menuItems.touchIdPrompt))
              .then(() => {
                actions.settings.update({
                  type: 'app',
                  data: {
                    locked: false,
                  },
                });
              });
          },
        },
        {
          type: 'separator',
          visible: touchIdEnabled,
        },
      );
    }

    tpl.unshift({
      label: isMac ? app.name : intl.formatMessage(menuItems.file),
      accelerator: `${altKey()}+F`,
      submenu: [
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(globalMessages.settings),
          accelerator: `${settingsShortcutKey()}`,
          click: () => {
            this.actions.ui.openSettings({ path: 'app' });
          },
          enabled: this.stores.user.isLoggedIn,
          visible: !locked,
        },
        {
          label: intl.formatMessage(menuItems.checkForUpdates),
          visible: !locked,
          click: () => {
            this.actions.app.checkForUpdates();
          },
        },
        {
          type: 'separator',
          visible: !locked,
        },
        {
          label: intl.formatMessage(menuItems.services),
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(menuItems.hide),
          role: 'hide',
        },
        {
          label: intl.formatMessage(menuItems.hideOthers),
          role: 'hideOthers',
        },
        {
          label: intl.formatMessage(menuItems.unhide),
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(globalMessages.quit),
          accelerator: `${cmdOrCtrlShortcutKey()}+Q`,
          click() {
            app.quit();
          },
        },
      ],
    });

    const aboutAppDetails = [
      `Version: ${ferdiumVersion}`,
      `Electron: ${electronVersion}`,
      `Chrome: ${chromeVersion}`,
      `Node.js: ${nodeVersion}`,
      `Platform: ${osName()}`,
      `Arch: ${osArch}`,
      `Build date: ${new Date(Number(buildInfo.timestamp))}`,
      `Git SHA: ${buildInfo.gitHashShort}`,
      `Git branch: ${buildInfo.gitBranch}`,
    ].join('\n');

    const about = {
      label: intl.formatMessage(menuItems.about),
      click: () => {
        dialog
          .showMessageBox({
            type: 'info',
            title: 'Ferdium',
            message: 'Ferdium',
            detail: aboutAppDetails,
            buttons: [intl.formatMessage(menuItems.copyToClipboard), intl.formatMessage(menuItems.ok)],
          })
          .then(result => {
            if (result.response === 0) {
              clipboard.write({
                text: aboutAppDetails,
              });
            }
          });
      },
    };

    if (isMac) {
      // Edit menu.
      tpl[1].submenu.push(
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(menuItems.speech),
          submenu: [
            {
              label: intl.formatMessage(menuItems.startSpeaking),
              role: 'startspeaking',
            },
            {
              label: intl.formatMessage(menuItems.stopSpeaking),
              role: 'stopspeaking',
            },
          ],
        },
      );

      tpl[0].submenu.unshift(about, {
        type: 'separator',
      });
    } else {
      tpl[0].submenu = [
        {
          label: intl.formatMessage(globalMessages.settings),
          accelerator: `${settingsShortcutKey()}`,
          click: () => {
            this.actions.ui.openSettings({ path: 'app' });
          },
          enabled: this.stores.user.isLoggedIn,
          visible: !locked,
        },
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(globalMessages.quit),
          accelerator: `${cmdOrCtrlShortcutKey()}+Q`,
          click() {
            app.quit();
          },
        },
      ];

      tpl[tpl.length - 1].submenu.push(
        {
          type: 'separator',
        },
        about,
      );
    }

    if (!locked) {
      if (serviceTpl.length > 0) {
        tpl[3].submenu = serviceTpl;
      }

      tpl[4].submenu = this.workspacesMenu();

      tpl[5].submenu = this.todosMenu();

      tpl[tpl.length - 1].submenu.push(
        {
          type: 'separator',
        },
        ...this.debugMenu(),
      );
    }
    this.currentTemplate = tpl;
    const menu = Menu.buildFromTemplate(tpl);
    Menu.setApplicationMenu(menu);
  }

  serviceTpl() {
    const { intl } = window['ferdium'];
    const { user, services, settings } = this.stores;
    if (!user.isLoggedIn) return [];
    const menu = [];
    const cmdAltShortcutsVisibile = !isLinux;

    menu.push(
      {
        label: intl.formatMessage(menuItems.addNewService),
        accelerator: `${addNewServiceShortcutKey()}`,
        click: () => {
          this.actions.ui.openSettings({ path: 'recipes' });
        },
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.activateNextService),
        accelerator: `${cmdOrCtrlShortcutKey()}+tab`,
        click: () => this.actions.service.setActiveNext(),
        visible: !cmdAltShortcutsVisibile,
      },
      {
        label: intl.formatMessage(menuItems.activateNextService),
        accelerator: `${cmdOrCtrlShortcutKey()}+${altKey()}+right`,
        click: () => this.actions.service.setActiveNext(),
        visible: cmdAltShortcutsVisibile,
      },
      {
        label: intl.formatMessage(menuItems.activatePreviousService),
        accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+tab`,
        click: () => this.actions.service.setActivePrev(),
        visible: !cmdAltShortcutsVisibile,
      },
      {
        label: intl.formatMessage(menuItems.activatePreviousService),
        accelerator: `${cmdOrCtrlShortcutKey()}+${altKey()}+left`,
        click: () => this.actions.service.setActivePrev(),
        visible: cmdAltShortcutsVisibile,
      },
      {
        label: intl
          .formatMessage(
            settings.all.app.isAppMuted
              ? menuItems.unmuteApp
              : menuItems.muteApp,
          )
          .replace('&', '&&'),
        accelerator: `${muteFerdiumShortcutKey()}`,
        click: () => this.actions.app.toggleMuteApp(),
      },
      {
        type: 'separator',
      },
    );

    for (const [i, service] of services.allDisplayed.entries()) {
      menu.push({
        label: this._getServiceName(service),
        accelerator: i < 9 ? `${cmdOrCtrlShortcutKey()}+${i + 1}` : null,
        type: 'radio',
        checked: service.isActive,
        click: () => {
          this.actions.service.setActive({ serviceId: service.id });

          if (isMac && i === 0) {
            // feat(Mac): Open Window with Cmd+1
            getCurrentWindow().restore();
          }
        },
      });
    }

    if (
      services.active &&
      services.active.recipe.id === CUSTOM_WEBSITE_RECIPE_ID
    ) {
      menu.push(
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(menuItems.serviceGoHome),
          accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+H`,
          click: () => this.actions.service.reloadActive(),
        },
      );
    }

    return menu;
  }

  workspacesMenu() {
    const { workspaces, activeWorkspace, isWorkspaceDrawerOpen } =
      workspaceStore;
    const { intl } = window['ferdium'];
    const menu = [];

    // Add new workspace item:
    menu.push({
      label: intl.formatMessage(menuItems.addNewWorkspace),
      accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+N`,
      click: () => {
        workspaceActions.openWorkspaceSettings();
      },
      enabled: this.stores.user.isLoggedIn,
    });

    // Open workspace drawer:
    if (!this.stores.settings.app.alwaysShowWorkspaces) {
      const drawerLabel = isWorkspaceDrawerOpen
        ? menuItems.closeWorkspaceDrawer
        : menuItems.openWorkspaceDrawer;
      menu.push({
        label: intl.formatMessage(drawerLabel),
        accelerator: `${workspaceToggleShortcutKey()}`,
        click: () => {
          workspaceActions.toggleWorkspaceDrawer();
        },
        enabled: this.stores.user.isLoggedIn,
      });
    }

    menu.push(
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(menuItems.defaultWorkspace),
        accelerator: `${cmdOrCtrlShortcutKey()}+${altKey()}+0`,
        type: 'radio',
        checked: !activeWorkspace,
        click: () => {
          workspaceActions.deactivate();
        },
      },
    );

    // Workspace items
    for (const [i, workspace] of workspaces.entries()) {
      menu.push({
        label: workspace.name,
        accelerator:
          i < 9 ? `${cmdOrCtrlShortcutKey()}+${altKey()}+${i + 1}` : null,
        type: 'radio',
        checked: activeWorkspace ? workspace.id === activeWorkspace.id : false,
        click: () => {
          workspaceActions.activate({ workspace });
        },
      });
    }

    return menu;
  }

  todosMenu() {
    const { isTodosPanelVisible, isFeatureEnabledByUser } = this.stores.todos;
    const { intl } = window['ferdium'];
    const menu = [];

    const drawerLabel = isTodosPanelVisible
      ? menuItems.closeTodosDrawer
      : menuItems.openTodosDrawer;

    if (isFeatureEnabledByUser) {
      menu.push({
        label: intl.formatMessage(drawerLabel),
        accelerator: `${todosToggleShortcutKey()}`,
        click: () => {
          todoActions.toggleTodosPanel();
        },
        enabled: this.stores.user.isLoggedIn && isFeatureEnabledByUser,
      });
    }

    if (!isFeatureEnabledByUser) {
      menu.push(
        {
          type: 'separator',
        },
        {
          label: intl.formatMessage(menuItems.enableTodos),
          click: () => {
            todoActions.toggleTodosFeatureVisibility();
          },
          enabled: this.stores.user.isLoggedIn,
        },
      );
    }

    return menu;
  }

  debugMenu() {
    const { intl } = window['ferdium'];

    return [
      {
        label: intl.formatMessage(menuItems.debugInfo),
        click: () => {
          const { debugInfo } = this.stores.app;

          clipboard.write({
            text: JSON.stringify(debugInfo),
          });

          this.actions.app.notify({
            title: intl.formatMessage(menuItems.debugInfoCopiedHeadline),
            options: {
              body: intl.formatMessage(menuItems.debugInfoCopiedBody),
            },
          });
        },
      },
      {
        label: intl.formatMessage(menuItems.publishDebugInfo),
        click: () => {
          window[
            'ferdium'
          ].features.publishDebugInfo.state.isModalVisible = true;
        },
      },
    ];
  }

  _getServiceName(service) {
    if (service.name) {
      return service.name;
    }

    let { name } = service.recipe;

    if (service.team) {
      name = `${name} (${service.team})`;
    } else if (service.customUrl) {
      name = `${name} (${service.customUrl})`;
    }

    return name;
  }
}

export default FranzMenu;
