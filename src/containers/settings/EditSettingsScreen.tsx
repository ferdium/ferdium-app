import { ipcRenderer } from 'electron';
import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';

import type { StoresProps } from '../../@types/ferdium-components.types';
import type { FormFields } from '../../@types/mobx-form.types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_SHORTCUTS,
  GOOGLE_TRANSLATOR_LANGUAGES,
  HIBERNATION_STRATEGIES,
  ICON_SIZES,
  LIBRETRANSLATE_TRANSLATOR_LANGUAGES,
  NAVIGATION_BAR_BEHAVIOURS,
  SEARCH_ENGINE_NAMES,
  SIDEBAR_SERVICES_LOCATION,
  SIDEBAR_WIDTH,
  SPLIT_COLUMNS_MAX,
  SPLIT_COLUMNS_MIN,
  TODO_APPS,
  TRANSLATOR_ENGINE_GOOGLE,
  TRANSLATOR_ENGINE_NAMES,
  WAKE_UP_HIBERNATION_STRATEGIES,
  WAKE_UP_STRATEGIES,
  WEBRTC_IP_HANDLING_POLICY,
} from '../../config';
import { isMac } from '../../environment';
import { APP_LOCALES, SPELLCHECKER_LOCALES } from '../../i18n/languages';
import Form from '../../lib/Form';

import { getSelectOptions } from '../../helpers/i18n-helpers';
import { hash } from '../../helpers/password-helpers';
import defaultUserAgent from '../../helpers/userAgent-helpers';

import EditSettingsForm from '../../components/settings/settings/EditSettingsForm';
import ErrorBoundary from '../../components/util/ErrorBoundary';

import { importExportURL } from '../../api/apiBase';
import globalMessages from '../../i18n/globalMessages';
import { ifUndefined } from '../../jsUtils';
import { menuItems } from '../../lib/Menu';

const debug = require('../../preload-safe-debug')('Ferdium:EditSettingsScreen');

const messages = defineMessages({
  autoLaunchOnStart: {
    id: 'settings.app.form.autoLaunchOnStart',
    defaultMessage: 'Launch Ferdium on start',
  },
  autoLaunchInBackground: {
    id: 'settings.app.form.autoLaunchInBackground',
    defaultMessage: 'Open in background',
  },
  runInBackground: {
    id: 'settings.app.form.runInBackground',
    defaultMessage: 'Keep Ferdium in background when closing the window',
  },
  startMinimized: {
    id: 'settings.app.form.startMinimized',
    defaultMessage: 'Start minimized',
  },
  confirmOnQuit: {
    id: 'settings.app.form.confirmOnQuit',
    defaultMessage: 'Confirm when quitting Ferdium',
  },
  enableSystemTray: {
    id: 'settings.app.form.enableSystemTray',
    defaultMessage: 'Always show Ferdium in System Tray',
  },
  enableMenuBar: {
    id: 'settings.app.form.enableMenuBar',
    defaultMessage: 'Always show Ferdium in Menu Bar',
  },
  reloadAfterResume: {
    id: 'settings.app.form.reloadAfterResume',
    defaultMessage: 'Reload Ferdium after system resume',
  },
  reloadAfterResumeTime: {
    id: 'settings.app.form.reloadAfterResumeTime',
    defaultMessage:
      'Time to consider the system as idle/suspended (in minutes)',
  },
  minimizeToSystemTray: {
    id: 'settings.app.form.minimizeToSystemTray',
    defaultMessage: 'Minimize Ferdium to system tray',
  },
  closeToSystemTray: {
    id: 'settings.app.form.closeToSystemTray',
    defaultMessage: 'Close Ferdium to system tray',
  },
  privateNotifications: {
    id: 'settings.app.form.privateNotifications',
    defaultMessage: "Don't show message content in notifications",
  },
  clipboardNotifications: {
    id: 'settings.app.form.clipboardNotifications',
    defaultMessage: "Don't show notifications for clipboard events",
  },
  notifyTaskBarOnMessage: {
    id: 'settings.app.form.notifyTaskBarOnMessage',
    defaultMessage: 'Notify TaskBar/Dock on new message',
  },
  isTwoFactorAutoCatcherEnabled: {
    id: 'settings.app.form.isTwoFactorAutoCatcherEnabled',
    defaultMessage:
      'Auto-catch two-factor codes from notifications (Ex.: android messages) and copy to clipboard',
  },
  twoFactorAutoCatcherMatcher: {
    id: 'settings.app.form.twoFactorAutoCatcherMatcher',
    defaultMessage:
      'Comma-separated and case-insensitive words/expressions to catch two-factor codes from. Ex.: token, code, sms, verify',
  },
  navigationBarBehaviour: {
    id: 'settings.app.form.navigationBarBehaviour',
    defaultMessage: 'Navigation bar behaviour',
  },
  webRTCIPHandlingPolicy: {
    id: 'settings.app.form.webRTCIPHandlingPolicy',
    defaultMessage: 'WebRTC IP Handling Policy',
  },
  searchEngine: {
    id: 'settings.app.form.searchEngine',
    defaultMessage: 'Search engine',
  },
  sentry: {
    id: 'settings.app.form.sentry',
    defaultMessage: 'Send telemetry data',
  },
  translatorEngine: {
    id: 'settings.app.form.translatorEngine',
    defaultMessage: 'Translator Engine',
  },
  translatorLanguage: {
    id: 'settings.app.form.translatorLanguage',
    defaultMessage: 'Default Translator language',
  },
  hibernateOnStartup: {
    id: 'settings.app.form.hibernateOnStartup',
    defaultMessage: 'Keep services in hibernation on startup',
  },
  hibernationStrategy: {
    id: 'settings.app.form.hibernationStrategy',
    defaultMessage: 'Hibernation strategy',
  },
  wakeUpStrategy: {
    id: 'settings.app.form.wakeUpStrategy',
    defaultMessage: 'Wake up strategy',
  },
  wakeUpHibernationStrategy: {
    id: 'settings.app.form.wakeUpHibernationStrategy',
    defaultMessage: 'Hibernation strategy after automatic wake up',
  },
  wakeUpHibernationSplay: {
    id: 'settings.app.form.wakeUpHibernationSplay',
    defaultMessage: 'Splay hibernate/wake cycles to reduce load',
  },
  predefinedTodoServer: {
    id: 'settings.app.form.predefinedTodoServer',
    defaultMessage: 'Todo Server',
  },
  customTodoServer: {
    id: 'settings.app.form.customTodoServer',
    defaultMessage: 'Custom Todo Server',
  },
  enableLock: {
    id: 'settings.app.form.enableLock',
    defaultMessage: 'Enable Password Lock',
  },
  lockPassword: {
    id: 'settings.app.form.lockPassword',
    defaultMessage: 'Password',
  },
  useTouchIdToUnlock: {
    id: 'settings.app.form.useTouchIdToUnlock',
    defaultMessage: 'Allow using TouchID to unlock Ferdium',
  },
  inactivityLock: {
    id: 'settings.app.form.inactivityLock',
    defaultMessage: 'Lock after inactivity',
  },
  scheduledDNDEnabled: {
    id: 'settings.app.form.scheduledDNDEnabled',
    defaultMessage: 'Enable scheduled Do-not-Disturb',
  },
  scheduledDNDStart: {
    id: 'settings.app.form.scheduledDNDStart',
    defaultMessage: 'From',
  },
  scheduledDNDEnd: {
    id: 'settings.app.form.scheduledDNDEnd',
    defaultMessage: 'To',
  },
  language: {
    id: 'settings.app.form.language',
    defaultMessage: 'Language',
  },
  darkMode: {
    id: 'settings.app.form.darkMode',
    defaultMessage: 'Enable Dark Mode',
  },
  adaptableDarkMode: {
    id: 'settings.app.form.adaptableDarkMode',
    defaultMessage: "Synchronize dark mode with my OS's dark mode setting",
  },
  universalDarkMode: {
    id: 'settings.app.form.universalDarkMode',
    defaultMessage: 'Enable universal Dark Mode',
  },
  splitMode: {
    id: 'settings.app.form.splitMode',
    defaultMessage: 'Enable Split View Mode',
  },
  splitColumns: {
    id: 'settings.app.form.splitColumns',
    defaultMessage: 'Number of columns',
  },
  serviceRibbonWidth: {
    id: 'settings.app.form.serviceRibbonWidth',
    defaultMessage: 'Sidebar width',
  },
  sidebarServicesLocation: {
    id: 'settings.app.form.sidebarServicesLocation',
    defaultMessage: 'Sidebar Services Icons Location',
  },
  iconSize: {
    id: 'settings.app.form.iconSize',
    defaultMessage: 'Service icon size',
  },
  enableLongPressServiceHint: {
    id: 'settings.app.form.enableLongPressServiceHint',
    defaultMessage: 'Enable service shortcut hint on long press',
  },
  useHorizontalStyle: {
    id: 'settings.app.form.useHorizontalStyle',
    defaultMessage: 'Use horizontal style',
  },
  hideCollapseButton: {
    id: 'settings.app.form.hideCollapseButton',
    defaultMessage: 'Hide Collapse button',
  },
  hideRecipesButton: {
    id: 'settings.app.form.hideRecipesButton',
    defaultMessage: 'Hide Recipes button',
  },
  hideSplitModeButton: {
    id: 'settings.app.form.hideSplitModeButton',
    defaultMessage: 'Hide Split Mode button',
  },
  useGrayscaleServices: {
    id: 'settings.app.form.useGrayscaleServices',
    defaultMessage: 'Use grayscale services',
  },
  grayscaleServicesDim: {
    id: 'settings.app.form.grayscaleServicesDim',
    defaultMessage: 'Grayscale dim level',
  },
  hideWorkspacesButton: {
    id: 'settings.app.form.hideWorkspacesButton',
    defaultMessage: 'Hide Workspace Drawer button',
  },
  hideNotificationsButton: {
    id: 'settings.app.form.hideNotificationsButton',
    defaultMessage: 'Hide Notifications & Sound button',
  },
  hideSettingsButton: {
    id: 'settings.app.form.hideSettingsButton',
    defaultMessage: 'Hide Settings button',
  },
  hideDownloadButton: {
    id: 'settings.app.form.hideDownloadButton',
    defaultMessage: 'Hide Downloads button',
  },
  alwaysShowWorkspaces: {
    id: 'settings.app.form.alwaysShowWorkspaces',
    defaultMessage: 'Always show workspace drawer',
  },
  hideAllServicesWorkspace: {
    id: 'settings.app.form.hideAllServicesWorkspace',
    defaultMessage: 'Hide "All services" workspace',
  },
  accentColor: {
    id: 'settings.app.form.accentColor',
    defaultMessage: 'Accent color',
  },
  progressbarAccentColor: {
    id: 'settings.app.form.progressbarAccentColor',
    defaultMessage: 'Progressbar Accent color',
  },
  showDisabledServices: {
    id: 'settings.app.form.showDisabledServices',
    defaultMessage: 'Display disabled services tabs',
  },
  showServiceName: {
    id: 'settings.app.form.showServiceName',
    defaultMessage: 'Display service name under the icon',
  },
  showMessageBadgeWhenMuted: {
    id: 'settings.app.form.showMessagesBadgesWhenMuted',
    defaultMessage: 'Show unread message badge when notifications are disabled',
  },
  showDragArea: {
    id: 'settings.app.form.showDragArea',
    defaultMessage: 'Show draggable area on window',
  },
  enableSpellchecking: {
    id: 'settings.app.form.enableSpellchecking',
    defaultMessage: 'Enable spell checking',
  },
  enableTranslator: {
    id: 'settings.app.form.enableTranslator',
    defaultMessage: 'Enable Translator',
  },
  useSelfSignedCertificates: {
    id: 'settings.app.form.useSelfSignedCertificates',
    defaultMessage: 'Enable self-signed certificates',
  },
  enableGPUAcceleration: {
    id: 'settings.app.form.enableGPUAcceleration',
    defaultMessage: 'Enable GPU Acceleration',
  },
  enableGlobalHideShortcut: {
    id: 'settings.app.form.enableGlobalHideShortcut',
    defaultMessage: 'Enable Global shortcut to hide Ferdium',
  },
  beta: {
    id: 'settings.app.form.beta',
    defaultMessage: 'Include pre-releases',
  },
  automaticUpdates: {
    id: 'settings.app.form.automaticUpdates',
    defaultMessage: 'Enable updates',
  },
  enableTodos: {
    id: 'settings.app.form.enableTodos',
    defaultMessage: 'Enable Ferdium Todos',
  },
  keepAllWorkspacesLoaded: {
    id: 'settings.app.form.keepAllWorkspacesLoaded',
    defaultMessage: 'Keep all workspaces loaded',
  },
  downloadFolderPath: {
    id: 'settings.app.form.downloadFolderPath',
    defaultMessage:
      'Default download folder (leave blank to be prompted for each download)',
  },
  restartDialogTitle: {
    id: 'settings.app.restart.restartDialogTitle',
    defaultMessage: 'Ferdium - Relaunch Application',
  },
  restartNow: {
    id: 'settings.app.restart.restartNow',
    defaultMessage: 'Restart now',
  },
  restartLater: {
    id: 'settings.app.restart.restartLater',
    defaultMessage: 'Restart later',
  },
  restartDialogMessage: {
    id: 'settings.app.restart.restartDialogMessage',
    defaultMessage: 'Do you want to relaunch Ferdium?',
  },
  restartDialogDetail: {
    id: 'settings.app.restart.restartDialogDetail',
    defaultMessage:
      'You made a change that requires a restart. This will close Ferdium and restart it.',
  },
  sandboxServices: {
    id: 'settings.app.form.sandboxServices',
    defaultMessage: 'Use sandboxed services',
  },
});

interface EditSettingsScreenProps extends StoresProps, WrappedComponentProps {}

interface EditSettingsScreenState {
  lockedPassword: string;
}

@inject('stores', 'actions')
@observer
class EditSettingsScreen extends Component<
  EditSettingsScreenProps,
  EditSettingsScreenState
> {
  constructor(props) {
    super(props);

    this.state = {
      lockedPassword: '',
    };
  }

  onSubmit(settingsData) {
    const { intl } = this.props;
    const { todos, workspaces } = this.props.stores;
    const {
      app,
      settings,
      user,
      todos: todosActions,
      workspaces: workspaceActions,
    } = this.props.actions;

    const useOriginalPassword = settingsData.lockedPassword === '';

    this.setState({
      lockedPassword: useOriginalPassword ? '' : settingsData.lockedPassword,
    });

    app.launchOnStartup({
      enable: Boolean(settingsData.autoLaunchOnStart),
      openInBackground: Boolean(settingsData.autoLaunchInBackground),
    });

    debug(`Updating settings store with data: ${settingsData}`);

    const { app: currentSettings } = this.props.stores.settings.all;

    const newSettings = {
      runInBackground: Boolean(settingsData.runInBackground),
      enableSystemTray: Boolean(settingsData.enableSystemTray),
      reloadAfterResume: Boolean(settingsData.reloadAfterResume),
      reloadAfterResumeTime: Number(settingsData.reloadAfterResumeTime),
      startMinimized: Boolean(settingsData.startMinimized),
      confirmOnQuit: Boolean(settingsData.confirmOnQuit),
      minimizeToSystemTray: Boolean(settingsData.minimizeToSystemTray),
      closeToSystemTray: Boolean(settingsData.closeToSystemTray),
      privateNotifications: Boolean(settingsData.privateNotifications),
      clipboardNotifications: Boolean(settingsData.clipboardNotifications),
      notifyTaskBarOnMessage: Boolean(settingsData.notifyTaskBarOnMessage),
      isTwoFactorAutoCatcherEnabled: Boolean(
        settingsData.isTwoFactorAutoCatcherEnabled,
      ),
      twoFactorAutoCatcherMatcher: settingsData.twoFactorAutoCatcherMatcher,
      navigationBarBehaviour: settingsData.navigationBarBehaviour,
      webRTCIPHandlingPolicy: settingsData.webRTCIPHandlingPolicy,
      searchEngine: settingsData.searchEngine,
      translatorEngine: settingsData.translatorEngine,
      translatorLanguage: settingsData.translatorLanguage,
      sentry: Boolean(settingsData.sentry),
      hibernateOnStartup: Boolean(settingsData.hibernateOnStartup),
      hibernationStrategy: Number(settingsData.hibernationStrategy),
      wakeUpStrategy: Number(settingsData.wakeUpStrategy),
      wakeUpHibernationStrategy: Number(settingsData.wakeUpHibernationStrategy),
      wakeUpHibernationSplay: Boolean(settingsData.wakeUpHibernationSplay),
      predefinedTodoServer: settingsData.predefinedTodoServer,
      customTodoServer: settingsData.customTodoServer,
      isLockingFeatureEnabled: Boolean(settingsData.isLockingFeatureEnabled),
      lockedPassword: useOriginalPassword
        ? this.props.stores.settings.all.app.lockedPassword
        : hash(String(settingsData.lockedPassword)),
      useTouchIdToUnlock: Boolean(settingsData.useTouchIdToUnlock),
      inactivityLock: Number(settingsData.inactivityLock),
      scheduledDNDEnabled: Boolean(settingsData.scheduledDNDEnabled),
      scheduledDNDStart: settingsData.scheduledDNDStart,
      scheduledDNDEnd: settingsData.scheduledDNDEnd,
      enableGPUAcceleration: Boolean(settingsData.enableGPUAcceleration),
      downloadFolderPath: String(settingsData.downloadFolderPath),
      enableGlobalHideShortcut: Boolean(settingsData.enableGlobalHideShortcut),
      showDisabledServices: Boolean(settingsData.showDisabledServices),
      showServiceName: Boolean(settingsData.showServiceName),
      darkMode: Boolean(settingsData.darkMode),
      adaptableDarkMode: Boolean(settingsData.adaptableDarkMode),
      universalDarkMode: Boolean(settingsData.universalDarkMode),
      splitMode: Boolean(settingsData.splitMode),
      splitColumns: Number(settingsData.splitColumns),
      serviceRibbonWidth: Number(settingsData.serviceRibbonWidth),
      sidebarServicesLocation: Number(settingsData.sidebarServicesLocation),
      iconSize: Number(settingsData.iconSize),
      enableLongPressServiceHint: Boolean(
        settingsData.enableLongPressServiceHint,
      ),
      useHorizontalStyle: Boolean(settingsData.useHorizontalStyle),
      hideCollapseButton: Boolean(settingsData.hideCollapseButton),
      hideRecipesButton: Boolean(settingsData.hideRecipesButton),
      hideSplitModeButton: Boolean(settingsData.hideSplitModeButton),
      useGrayscaleServices: Boolean(settingsData.useGrayscaleServices),
      grayscaleServicesDim: Number(settingsData.grayscaleServicesDim),
      hideWorkspacesButton: Boolean(settingsData.hideWorkspacesButton),
      hideNotificationsButton: Boolean(settingsData.hideNotificationsButton),
      hideSettingsButton: Boolean(settingsData.hideSettingsButton),
      hideDownloadButton: Boolean(settingsData.hideDownloadButton),
      alwaysShowWorkspaces: Boolean(settingsData.alwaysShowWorkspaces),
      hideAllServicesWorkspace: Boolean(settingsData.hideAllServicesWorkspace),
      accentColor: settingsData.accentColor,
      progressbarAccentColor: settingsData.progressbarAccentColor,
      showMessageBadgeWhenMuted: Boolean(
        settingsData.showMessageBadgeWhenMuted,
      ),
      showDragArea: Boolean(settingsData.showDragArea),
      enableSpellchecking: Boolean(settingsData.enableSpellchecking),
      enableTranslator: Boolean(settingsData.enableTranslator),
      useSelfSignedCertificates: Boolean(
        settingsData.useSelfSignedCertificates,
      ),
      spellcheckerLanguage: settingsData.spellcheckerLanguage,
      userAgentPref: settingsData.userAgentPref,
      beta: Boolean(settingsData.beta), // we need this info in the main process as well
      automaticUpdates: Boolean(settingsData.automaticUpdates), // we need this info in the main process as well
      locale: settingsData.locale, // we need this info in the main process as well
      sandboxServices: Boolean(settingsData.sandboxServices),
    };

    const newShortcuts = {
      activateNextService: settingsData.shortcutActivateNextService,
      activatePreviousService: settingsData.shortcutActivatePreviousService,
    };

    const requiredRestartKeys = [
      'webRTCIPHandlingPolicy',
      'sentry',
      'searchEngine',
      'enableSpellchecking',
      'spellcheckerLanguage',
      'enableGlobalHideShortcut',
      // 'userAgentPref', // TODO: this is an input field, so it changes on every key stroke
    ];

    // Check if any of the keys that require a restart have changed
    const requiresRestart = requiredRestartKeys.some(
      key => newSettings[key] !== currentSettings[key],
    );

    if (requiresRestart) {
      debug('Settings require restart');

      const options: Electron.MessageBoxOptions = {
        type: 'warning',
        buttons: [
          intl.formatMessage(messages.restartNow),
          intl.formatMessage(messages.restartLater),
        ],
        defaultId: 0,
        cancelId: 1,
        title: intl.formatMessage(messages.restartDialogTitle),
        message: intl.formatMessage(messages.restartDialogMessage),
        detail: intl.formatMessage(messages.restartDialogDetail),
      };

      ipcRenderer.send('relaunch-app', options);
    }

    settings.update({
      type: 'app',
      // TODO: The conversions might not be necessary once we convert to typescript
      data: newSettings,
    });

    settings.update({
      type: 'shortcuts',
      // TODO: The conversions might not be necessary once we convert to typescript
      data: newShortcuts,
    });

    user.update({
      userData: {
        automaticUpdates: Boolean(settingsData.automaticUpdates),
        beta: Boolean(settingsData.beta),
        locale: settingsData.locale,
      },
    });

    const { keepAllWorkspacesLoaded } = workspaces.settings;
    if (
      Boolean(keepAllWorkspacesLoaded) !==
      Boolean(settingsData.keepAllWorkspacesLoaded)
    ) {
      workspaceActions.toggleKeepAllWorkspacesLoadedSetting();
    }

    if (todos.isFeatureActive) {
      const { isFeatureEnabledByUser } = todos.settings;
      if (
        Boolean(isFeatureEnabledByUser) !== Boolean(settingsData.enableTodos)
      ) {
        todosActions.toggleTodosFeatureVisibility();
      }
    }
  }

  openProcessManager() {
    ipcRenderer.send('openProcessManager');
  }

  prepareForm() {
    const { app, settings, user, todos, workspaces } = this.props.stores;
    const { intl } = this.props;
    const { lockedPassword } = this.state;

    const locales = getSelectOptions({
      locales: APP_LOCALES,
    });

    const navigationBarBehaviours = getSelectOptions({
      locales: NAVIGATION_BAR_BEHAVIOURS,
      sort: false,
    });

    const webRTCIPHandlingPolicies = getSelectOptions({
      locales: WEBRTC_IP_HANDLING_POLICY,
      sort: false,
    });

    const searchEngines = getSelectOptions({
      locales: SEARCH_ENGINE_NAMES,
      sort: false,
    });

    const translatorEngines = getSelectOptions({
      locales: TRANSLATOR_ENGINE_NAMES,
      sort: false,
    });

    const translatorLanguages = getSelectOptions({
      locales: LIBRETRANSLATE_TRANSLATOR_LANGUAGES,
      sort: false,
    });

    const hibernationStrategies = getSelectOptions({
      locales: HIBERNATION_STRATEGIES,
      sort: false,
    });

    const wakeUpStrategies = getSelectOptions({
      locales: WAKE_UP_STRATEGIES,
      sort: false,
    });

    const wakeUpHibernationStrategies = getSelectOptions({
      locales: WAKE_UP_HIBERNATION_STRATEGIES,
      sort: false,
    });

    const todoApp = getSelectOptions({
      locales: TODO_APPS,
      sort: false,
    });

    const sidebarWidth = getSelectOptions({
      locales: SIDEBAR_WIDTH,
      sort: false,
    });

    const sidebarServicesLocation = getSelectOptions({
      locales: SIDEBAR_SERVICES_LOCATION,
      sort: false,
    });

    const iconSizes = getSelectOptions({
      locales: ICON_SIZES,
      sort: false,
    });

    const spellcheckingLanguages = getSelectOptions({
      locales: SPELLCHECKER_LOCALES,
      automaticDetectionText: intl.formatMessage(
        globalMessages.spellcheckerAutomaticDetection,
      ),
    });

    const config: FormFields = {
      fields: {
        autoLaunchOnStart: {
          label: intl.formatMessage(messages.autoLaunchOnStart),
          value: ifUndefined<boolean>(
            app.autoLaunchOnStart,
            DEFAULT_APP_SETTINGS.autoLaunchOnStart,
          ),
          default: DEFAULT_APP_SETTINGS.autoLaunchOnStart,
          type: 'checkbox',
        },
        autoLaunchInBackground: {
          label: intl.formatMessage(messages.autoLaunchInBackground),
          value: ifUndefined<boolean>(
            app.launchInBackground,
            DEFAULT_APP_SETTINGS.autoLaunchInBackground,
          ),
          default: DEFAULT_APP_SETTINGS.autoLaunchInBackground,
          type: 'checkbox',
        },
        runInBackground: {
          label: intl.formatMessage(messages.runInBackground),
          value: ifUndefined<boolean>(
            settings.all.app.runInBackground,
            DEFAULT_APP_SETTINGS.runInBackground,
          ),
          default: DEFAULT_APP_SETTINGS.runInBackground,
          type: 'checkbox',
        },
        startMinimized: {
          label: intl.formatMessage(messages.startMinimized),
          value: ifUndefined<boolean>(
            settings.all.app.startMinimized,
            DEFAULT_APP_SETTINGS.startMinimized,
          ),
          default: DEFAULT_APP_SETTINGS.startMinimized,
          type: 'checkbox',
        },
        confirmOnQuit: {
          label: intl.formatMessage(messages.confirmOnQuit),
          value: ifUndefined<boolean>(
            settings.all.app.confirmOnQuit,
            DEFAULT_APP_SETTINGS.confirmOnQuit,
          ),
          default: DEFAULT_APP_SETTINGS.confirmOnQuit,
          type: 'checkbox',
        },
        enableSystemTray: {
          label: intl.formatMessage(
            isMac ? messages.enableMenuBar : messages.enableSystemTray,
          ),
          value: ifUndefined<boolean>(
            settings.all.app.enableSystemTray,
            DEFAULT_APP_SETTINGS.enableSystemTray,
          ),
          default: DEFAULT_APP_SETTINGS.enableSystemTray,
          type: 'checkbox',
        },
        reloadAfterResume: {
          label: intl.formatMessage(messages.reloadAfterResume),
          value: ifUndefined<boolean>(
            settings.all.app.reloadAfterResume,
            DEFAULT_APP_SETTINGS.reloadAfterResume,
          ),
          default: DEFAULT_APP_SETTINGS.reloadAfterResume,
          type: 'checkbox',
        },
        reloadAfterResumeTime: {
          label: intl.formatMessage(messages.reloadAfterResumeTime),
          value: ifUndefined<number>(
            settings.all.app.reloadAfterResumeTime,
            DEFAULT_APP_SETTINGS.reloadAfterResumeTime,
          ),
          default: DEFAULT_APP_SETTINGS.reloadAfterResumeTime,
        },
        minimizeToSystemTray: {
          label: intl.formatMessage(messages.minimizeToSystemTray),
          value: ifUndefined<boolean>(
            settings.all.app.minimizeToSystemTray,
            DEFAULT_APP_SETTINGS.minimizeToSystemTray,
          ),
          default: DEFAULT_APP_SETTINGS.minimizeToSystemTray,
          type: 'checkbox',
        },
        closeToSystemTray: {
          label: intl.formatMessage(messages.closeToSystemTray),
          value: ifUndefined<boolean>(
            settings.all.app.closeToSystemTray,
            DEFAULT_APP_SETTINGS.closeToSystemTray,
          ),
          default: DEFAULT_APP_SETTINGS.closeToSystemTray,
          type: 'checkbox',
        },
        privateNotifications: {
          label: intl.formatMessage(messages.privateNotifications),
          value: ifUndefined<boolean>(
            settings.all.app.privateNotifications,
            DEFAULT_APP_SETTINGS.privateNotifications,
          ),
          default: DEFAULT_APP_SETTINGS.privateNotifications,
          type: 'checkbox',
        },
        clipboardNotifications: {
          label: intl.formatMessage(messages.clipboardNotifications),
          value: ifUndefined<boolean>(
            settings.all.app.clipboardNotifications,
            DEFAULT_APP_SETTINGS.clipboardNotifications,
          ),
          default: DEFAULT_APP_SETTINGS.clipboardNotifications,
          type: 'checkbox',
        },
        notifyTaskBarOnMessage: {
          label: intl.formatMessage(messages.notifyTaskBarOnMessage),
          value: ifUndefined<boolean>(
            settings.all.app.notifyTaskBarOnMessage,
            DEFAULT_APP_SETTINGS.notifyTaskBarOnMessage,
          ),
          default: DEFAULT_APP_SETTINGS.notifyTaskBarOnMessage,
          type: 'checkbox',
        },
        isTwoFactorAutoCatcherEnabled: {
          label: intl.formatMessage(messages.isTwoFactorAutoCatcherEnabled),
          value: ifUndefined<boolean>(
            settings.all.app.isTwoFactorAutoCatcherEnabled,
            DEFAULT_APP_SETTINGS.isTwoFactorAutoCatcherEnabled,
          ),
          default: DEFAULT_APP_SETTINGS.isTwoFactorAutoCatcherEnabled,
          type: 'checkbox',
        },
        twoFactorAutoCatcherMatcher: {
          label: intl.formatMessage(messages.twoFactorAutoCatcherMatcher),
          value: ifUndefined<string>(
            settings.all.app.twoFactorAutoCatcherMatcher,
            DEFAULT_APP_SETTINGS.twoFactorAutoCatcherMatcher,
          ),
          default: DEFAULT_APP_SETTINGS.twoFactorAutoCatcherMatcher,
        },
        navigationBarBehaviour: {
          label: intl.formatMessage(messages.navigationBarBehaviour),
          value: ifUndefined<string>(
            settings.all.app.navigationBarBehaviour,
            DEFAULT_APP_SETTINGS.navigationBarBehaviour,
          ),
          default: DEFAULT_APP_SETTINGS.navigationBarBehaviour,
          options: navigationBarBehaviours,
        },
        webRTCIPHandlingPolicy: {
          label: intl.formatMessage(messages.webRTCIPHandlingPolicy),
          value: ifUndefined<string>(
            settings.all.app.webRTCIPHandlingPolicy,
            DEFAULT_APP_SETTINGS.webRTCIPHandlingPolicy,
          ),
          default: DEFAULT_APP_SETTINGS.webRTCIPHandlingPolicy,
          options: webRTCIPHandlingPolicies,
        },
        searchEngine: {
          label: intl.formatMessage(messages.searchEngine),
          value: ifUndefined<string>(
            settings.all.app.searchEngine,
            DEFAULT_APP_SETTINGS.searchEngine,
          ),
          default: DEFAULT_APP_SETTINGS.searchEngine,
          options: searchEngines,
        },
        translatorEngine: {
          label: intl.formatMessage(messages.translatorEngine),
          value: ifUndefined<string>(
            settings.all.app.translatorEngine,
            DEFAULT_APP_SETTINGS.translatorEngine,
          ),
          default: DEFAULT_APP_SETTINGS.translatorEngine,
          options: translatorEngines,
        },
        translatorLanguage: {
          label: intl.formatMessage(messages.translatorLanguage),
          value: ifUndefined<string>(
            settings.all.app.translatorLanguage,
            DEFAULT_APP_SETTINGS.translatorLanguage,
          ),
          default: DEFAULT_APP_SETTINGS.translatorLanguage,
          options: translatorLanguages,
        },
        sentry: {
          label: intl.formatMessage(messages.sentry),
          value: ifUndefined<boolean>(
            settings.all.app.sentry,
            DEFAULT_APP_SETTINGS.sentry,
          ),
          default: DEFAULT_APP_SETTINGS.sentry,
          type: 'checkbox',
        },
        hibernateOnStartup: {
          label: intl.formatMessage(messages.hibernateOnStartup),
          value: ifUndefined<boolean>(
            settings.all.app.hibernateOnStartup,
            DEFAULT_APP_SETTINGS.hibernateOnStartup,
          ),
          default: DEFAULT_APP_SETTINGS.hibernateOnStartup,
          type: 'checkbox',
        },
        hibernationStrategy: {
          label: intl.formatMessage(messages.hibernationStrategy),
          value: ifUndefined<string>(
            settings.all.app.hibernationStrategy,
            DEFAULT_APP_SETTINGS.hibernationStrategy,
          ),
          default: DEFAULT_APP_SETTINGS.hibernationStrategy,
          options: hibernationStrategies,
        },
        wakeUpStrategy: {
          label: intl.formatMessage(messages.wakeUpStrategy),
          value: ifUndefined<string>(
            settings.all.app.wakeUpStrategy,
            DEFAULT_APP_SETTINGS.wakeUpStrategy,
          ),
          default: DEFAULT_APP_SETTINGS.wakeUpStrategy,
          options: wakeUpStrategies,
        },
        wakeUpHibernationStrategy: {
          label: intl.formatMessage(messages.wakeUpHibernationStrategy),
          value: ifUndefined<string>(
            settings.all.app.wakeUpHibernationStrategy,
            DEFAULT_APP_SETTINGS.wakeUpHibernationStrategy,
          ),
          default: DEFAULT_APP_SETTINGS.wakeUpHibernationStrategy,
          options: wakeUpHibernationStrategies,
        },
        wakeUpHibernationSplay: {
          label: intl.formatMessage(messages.wakeUpHibernationSplay),
          value: ifUndefined<boolean>(
            settings.all.app.wakeUpHibernationSplay,
            DEFAULT_APP_SETTINGS.wakeUpHibernationSplay,
          ),
          default: DEFAULT_APP_SETTINGS.wakeUpHibernationSplay,
          type: 'checkbox',
        },
        predefinedTodoServer: {
          label: intl.formatMessage(messages.predefinedTodoServer),
          value: ifUndefined<string>(
            settings.all.app.predefinedTodoServer,
            DEFAULT_APP_SETTINGS.predefinedTodoServer,
          ),
          default: DEFAULT_APP_SETTINGS.predefinedTodoServer,
          options: todoApp,
        },
        customTodoServer: {
          label: intl.formatMessage(messages.customTodoServer),
          value: ifUndefined<string>(
            settings.all.app.customTodoServer,
            DEFAULT_APP_SETTINGS.customTodoServer,
          ),
          default: DEFAULT_APP_SETTINGS.customTodoServer,
        },
        isLockingFeatureEnabled: {
          label: intl.formatMessage(messages.enableLock),
          value: ifUndefined<boolean>(
            settings.all.app.isLockingFeatureEnabled,
            DEFAULT_APP_SETTINGS.isLockingFeatureEnabled,
          ),
          default: DEFAULT_APP_SETTINGS.isLockingFeatureEnabled,
          type: 'checkbox',
        },
        lockedPassword: {
          label: intl.formatMessage(messages.lockPassword),
          value: ifUndefined<string>(
            lockedPassword,
            DEFAULT_APP_SETTINGS.lockedPassword,
          ),
          default: DEFAULT_APP_SETTINGS.lockedPassword,
          type: 'password',
        },
        useTouchIdToUnlock: {
          label: intl.formatMessage(messages.useTouchIdToUnlock),
          value: ifUndefined<boolean>(
            settings.all.app.useTouchIdToUnlock,
            DEFAULT_APP_SETTINGS.useTouchIdToUnlock,
          ),
          default: DEFAULT_APP_SETTINGS.useTouchIdToUnlock,
          type: 'checkbox',
        },
        inactivityLock: {
          label: intl.formatMessage(messages.inactivityLock),
          value: ifUndefined<number>(
            settings.all.app.inactivityLock,
            DEFAULT_APP_SETTINGS.inactivityLock,
          ),
          default: DEFAULT_APP_SETTINGS.inactivityLock,
          type: 'number',
        },
        scheduledDNDEnabled: {
          label: intl.formatMessage(messages.scheduledDNDEnabled),
          value: ifUndefined<boolean>(
            settings.all.app.scheduledDNDEnabled,
            DEFAULT_APP_SETTINGS.scheduledDNDEnabled,
          ),
          default: DEFAULT_APP_SETTINGS.scheduledDNDEnabled,
          type: 'checkbox',
        },
        scheduledDNDStart: {
          label: intl.formatMessage(messages.scheduledDNDStart),
          value: ifUndefined<string>(
            settings.all.app.scheduledDNDStart,
            DEFAULT_APP_SETTINGS.scheduledDNDStart,
          ),
          default: DEFAULT_APP_SETTINGS.scheduledDNDStart,
          type: 'time',
        },
        scheduledDNDEnd: {
          label: intl.formatMessage(messages.scheduledDNDEnd),
          value: ifUndefined<string>(
            settings.all.app.scheduledDNDEnd,
            DEFAULT_APP_SETTINGS.scheduledDNDEnd,
          ),
          default: DEFAULT_APP_SETTINGS.scheduledDNDEnd,
          type: 'time',
        },
        showDisabledServices: {
          label: intl.formatMessage(messages.showDisabledServices),
          value: ifUndefined<boolean>(
            settings.all.app.showDisabledServices,
            DEFAULT_APP_SETTINGS.showDisabledServices,
          ),
          default: DEFAULT_APP_SETTINGS.showDisabledServices,
          type: 'checkbox',
        },
        showServiceName: {
          label: intl.formatMessage(messages.showServiceName),
          value: ifUndefined<boolean>(
            settings.all.app.showServiceName,
            DEFAULT_APP_SETTINGS.showServiceName,
          ),
          default: DEFAULT_APP_SETTINGS.showServiceName,
          type: 'checkbox',
        },
        showMessageBadgeWhenMuted: {
          label: intl.formatMessage(messages.showMessageBadgeWhenMuted),
          value: ifUndefined<boolean>(
            settings.all.app.showMessageBadgeWhenMuted,
            DEFAULT_APP_SETTINGS.showMessageBadgeWhenMuted,
          ),
          default: DEFAULT_APP_SETTINGS.showMessageBadgeWhenMuted,
          type: 'checkbox',
        },
        showDragArea: {
          label: intl.formatMessage(messages.showDragArea),
          value: ifUndefined<boolean>(
            settings.all.app.showDragArea,
            DEFAULT_APP_SETTINGS.showDragArea,
          ),
          default: DEFAULT_APP_SETTINGS.showDragArea,
          type: 'checkbox',
        },
        enableSpellchecking: {
          label: intl.formatMessage(messages.enableSpellchecking),
          value: ifUndefined<boolean>(
            settings.all.app.enableSpellchecking,
            DEFAULT_APP_SETTINGS.enableSpellchecking,
          ),
          default: DEFAULT_APP_SETTINGS.enableSpellchecking,
          type: 'checkbox',
        },
        enableTranslator: {
          label: intl.formatMessage(messages.enableTranslator),
          value: ifUndefined<boolean>(
            settings.all.app.enableTranslator,
            DEFAULT_APP_SETTINGS.enableTranslator,
          ),
          default: DEFAULT_APP_SETTINGS.enableTranslator,
          type: 'checkbox',
        },
        useSelfSignedCertificates: {
          label: intl.formatMessage(messages.useSelfSignedCertificates),
          value: ifUndefined<boolean>(
            settings.all.app.useSelfSignedCertificates,
            DEFAULT_APP_SETTINGS.useSelfSignedCertificates,
          ),
          default: DEFAULT_APP_SETTINGS.useSelfSignedCertificates,
          type: 'checkbox',
        },
        spellcheckerLanguage: {
          label: intl.formatMessage(globalMessages.spellcheckerLanguage),
          value: ifUndefined<string>(
            settings.all.app.spellcheckerLanguage,
            DEFAULT_APP_SETTINGS.spellcheckerLanguage,
          ),
          default: DEFAULT_APP_SETTINGS.spellcheckerLanguage,
          options: spellcheckingLanguages,
        },
        userAgentPref: {
          label: intl.formatMessage(globalMessages.userAgentPref),
          value: ifUndefined<string>(
            settings.all.app.userAgentPref,
            DEFAULT_APP_SETTINGS.userAgentPref,
          ),
          default: DEFAULT_APP_SETTINGS.userAgentPref,
          placeholder: defaultUserAgent(),
        },
        downloadFolderPath: {
          label: intl.formatMessage(messages.downloadFolderPath),
          value: ifUndefined<string>(
            settings.all.app.downloadFolderPath,
            DEFAULT_APP_SETTINGS.downloadFolderPath,
          ),
          default: DEFAULT_APP_SETTINGS.userAgentPref,
        },
        darkMode: {
          label: intl.formatMessage(messages.darkMode),
          value: ifUndefined<boolean>(
            settings.all.app.darkMode,
            DEFAULT_APP_SETTINGS.darkMode,
          ),
          default: DEFAULT_APP_SETTINGS.darkMode,
          type: 'checkbox',
        },
        adaptableDarkMode: {
          label: intl.formatMessage(messages.adaptableDarkMode),
          value: ifUndefined<boolean>(
            settings.all.app.adaptableDarkMode,
            DEFAULT_APP_SETTINGS.adaptableDarkMode,
          ),
          default: DEFAULT_APP_SETTINGS.adaptableDarkMode,
          type: 'checkbox',
        },
        universalDarkMode: {
          label: intl.formatMessage(messages.universalDarkMode),
          value: ifUndefined<boolean>(
            settings.all.app.universalDarkMode,
            DEFAULT_APP_SETTINGS.universalDarkMode,
          ),
          default: DEFAULT_APP_SETTINGS.universalDarkMode,
          type: 'checkbox',
        },
        splitMode: {
          label: intl.formatMessage(messages.splitMode),
          value: ifUndefined<boolean>(
            settings.all.app.splitMode,
            DEFAULT_APP_SETTINGS.splitMode,
          ),
          default: DEFAULT_APP_SETTINGS.splitMode,
          type: 'checkbox',
        },
        splitColumns: {
          label: `${intl.formatMessage(
            messages.splitColumns,
          )} (${SPLIT_COLUMNS_MIN}-${SPLIT_COLUMNS_MAX})`,
          value: ifUndefined<number>(
            settings.all.app.splitColumns,
            DEFAULT_APP_SETTINGS.splitColumns,
          ),
          default: DEFAULT_APP_SETTINGS.splitColumns,
        },
        serviceRibbonWidth: {
          label: intl.formatMessage(messages.serviceRibbonWidth),
          value: ifUndefined<number>(
            settings.all.app.serviceRibbonWidth,
            DEFAULT_APP_SETTINGS.serviceRibbonWidth,
          ),
          default: DEFAULT_APP_SETTINGS.serviceRibbonWidth,
          options: sidebarWidth,
        },
        sidebarServicesLocation: {
          label: intl.formatMessage(messages.sidebarServicesLocation),
          value: ifUndefined<number>(
            settings.all.app.sidebarServicesLocation,
            DEFAULT_APP_SETTINGS.sidebarServicesLocation,
          ),
          default: DEFAULT_APP_SETTINGS.sidebarServicesLocation,
          options: sidebarServicesLocation,
        },
        iconSize: {
          label: intl.formatMessage(messages.iconSize),
          value: ifUndefined<number>(
            settings.all.app.iconSize,
            DEFAULT_APP_SETTINGS.iconSize,
          ),
          default: DEFAULT_APP_SETTINGS.iconSize,
          options: iconSizes,
        },
        enableLongPressServiceHint: {
          label: intl.formatMessage(messages.enableLongPressServiceHint),
          value: ifUndefined<boolean>(
            settings.all.app.enableLongPressServiceHint,
            DEFAULT_APP_SETTINGS.enableLongPressServiceHint,
          ),
          default: DEFAULT_APP_SETTINGS.enableLongPressServiceHint,
          type: 'checkbox',
        },
        useHorizontalStyle: {
          label: intl.formatMessage(messages.useHorizontalStyle),
          value: ifUndefined<boolean>(
            settings.all.app.useHorizontalStyle,
            DEFAULT_APP_SETTINGS.useHorizontalStyle,
          ),
          default: DEFAULT_APP_SETTINGS.useHorizontalStyle,
          type: 'checkbox',
        },
        hideCollapseButton: {
          label: intl.formatMessage(messages.hideCollapseButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideCollapseButton,
            DEFAULT_APP_SETTINGS.hideCollapseButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideCollapseButton,
          type: 'checkbox',
        },
        hideRecipesButton: {
          label: intl.formatMessage(messages.hideRecipesButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideRecipesButton,
            DEFAULT_APP_SETTINGS.hideRecipesButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideRecipesButton,
          type: 'checkbox',
        },
        hideSplitModeButton: {
          label: intl.formatMessage(messages.hideSplitModeButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideSplitModeButton,
            DEFAULT_APP_SETTINGS.hideSplitModeButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideSplitModeButton,
          type: 'checkbox',
        },
        useGrayscaleServices: {
          label: intl.formatMessage(messages.useGrayscaleServices),
          value: ifUndefined<boolean>(
            settings.all.app.useGrayscaleServices,
            DEFAULT_APP_SETTINGS.useGrayscaleServices,
          ),
          default: DEFAULT_APP_SETTINGS.useGrayscaleServices,
          type: 'checkbox',
        },
        grayscaleServicesDim: {
          label: intl.formatMessage(messages.grayscaleServicesDim),
          value: ifUndefined<number>(
            settings.all.app.grayscaleServicesDim,
            DEFAULT_APP_SETTINGS.grayscaleServicesDim,
          ),
          default: DEFAULT_APP_SETTINGS.grayscaleServicesDim,
        },
        hideWorkspacesButton: {
          label: intl.formatMessage(messages.hideWorkspacesButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideWorkspacesButton,
            DEFAULT_APP_SETTINGS.hideWorkspacesButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideWorkspacesButton,
          type: 'checkbox',
        },
        hideNotificationsButton: {
          label: intl.formatMessage(messages.hideNotificationsButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideNotificationsButton,
            DEFAULT_APP_SETTINGS.hideNotificationsButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideNotificationsButton,
          type: 'checkbox',
        },
        hideSettingsButton: {
          label: intl.formatMessage(messages.hideSettingsButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideSettingsButton,
            DEFAULT_APP_SETTINGS.hideSettingsButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideSettingsButton,
          type: 'checkbox',
        },
        hideDownloadButton: {
          label: intl.formatMessage(messages.hideDownloadButton),
          value: ifUndefined<boolean>(
            settings.all.app.hideDownloadButton,
            DEFAULT_APP_SETTINGS.hideDownloadButton,
          ),
          default: DEFAULT_APP_SETTINGS.hideDownloadButton,
          type: 'checkbox',
        },
        alwaysShowWorkspaces: {
          label: intl.formatMessage(messages.alwaysShowWorkspaces),
          value: ifUndefined<boolean>(
            settings.all.app.alwaysShowWorkspaces,
            DEFAULT_APP_SETTINGS.alwaysShowWorkspaces,
          ),
          default: DEFAULT_APP_SETTINGS.alwaysShowWorkspaces,
          type: 'checkbox',
        },
        hideAllServicesWorkspace: {
          label: intl.formatMessage(messages.hideAllServicesWorkspace),
          value: ifUndefined<boolean>(
            settings.all.app.hideAllServicesWorkspace,
            DEFAULT_APP_SETTINGS.hideAllServicesWorkspace,
          ),
          default: DEFAULT_APP_SETTINGS.hideAllServicesWorkspace,
          type: 'checkbox',
        },
        accentColor: {
          label: intl.formatMessage(messages.accentColor),
          value: ifUndefined<string>(
            settings.all.app.accentColor,
            DEFAULT_APP_SETTINGS.accentColor,
          ),
          default: DEFAULT_APP_SETTINGS.accentColor,
        },
        progressbarAccentColor: {
          label: intl.formatMessage(messages.progressbarAccentColor),
          value: ifUndefined<string>(
            settings.all.app.progressbarAccentColor,
            DEFAULT_APP_SETTINGS.progressbarAccentColor,
          ),
          default: DEFAULT_APP_SETTINGS.progressbarAccentColor,
        },
        enableGPUAcceleration: {
          label: intl.formatMessage(messages.enableGPUAcceleration),
          value: ifUndefined<boolean>(
            settings.all.app.enableGPUAcceleration,
            DEFAULT_APP_SETTINGS.enableGPUAcceleration,
          ),
          default: DEFAULT_APP_SETTINGS.enableGPUAcceleration,
          type: 'checkbox',
        },
        enableGlobalHideShortcut: {
          label: intl.formatMessage(messages.enableGlobalHideShortcut),
          value: ifUndefined<boolean>(
            settings.all.app.enableGlobalHideShortcut,
            DEFAULT_APP_SETTINGS.enableGlobalHideShortcut,
          ),
          default: DEFAULT_APP_SETTINGS.enableGlobalHideShortcut,
          type: 'checkbox',
        },
        locale: {
          label: intl.formatMessage(messages.language),
          value: ifUndefined<string>(app.locale, DEFAULT_APP_SETTINGS.locale),
          default: DEFAULT_APP_SETTINGS.locale,
          options: locales,
        },
        beta: {
          label: intl.formatMessage(messages.beta),
          value: ifUndefined<boolean>(
            user.data.beta,
            DEFAULT_APP_SETTINGS.beta,
          ),
          default: DEFAULT_APP_SETTINGS.beta,
          type: 'checkbox',
        },
        automaticUpdates: {
          label: intl.formatMessage(messages.automaticUpdates),
          value: ifUndefined<boolean>(
            settings.app.automaticUpdates,
            DEFAULT_APP_SETTINGS.automaticUpdates,
          ),
          default: DEFAULT_APP_SETTINGS.automaticUpdates,
          type: 'checkbox',
        },
        sandboxServices: {
          label: intl.formatMessage(messages.sandboxServices),
          value: ifUndefined<boolean>(
            settings.app.sandboxServices,
            DEFAULT_APP_SETTINGS.sandboxServices,
          ),
          default: DEFAULT_APP_SETTINGS.sandboxServices,
          type: 'checkbox',
        },
        shortcutActivateNextService: {
          label: intl.formatMessage(menuItems.activateNextService),
          value: ifUndefined<string>(
            settings.all.shortcuts.activateNextService,
            DEFAULT_SHORTCUTS.activateNextService,
          ),
          default: DEFAULT_SHORTCUTS.activateNextService,
          placeholder: DEFAULT_SHORTCUTS.activateNextService,
        },
        shortcutActivatePreviousService: {
          label: intl.formatMessage(menuItems.activatePreviousService),
          value: ifUndefined<string>(
            settings.all.shortcuts.activatePreviousService,
            DEFAULT_SHORTCUTS.activatePreviousService,
          ),
          default: DEFAULT_SHORTCUTS.activatePreviousService,
          placeholder: DEFAULT_SHORTCUTS.activatePreviousService,
        },
      },
    };

    if (settings.app.translatorEngine === TRANSLATOR_ENGINE_GOOGLE) {
      const translatorGoogleLanguages = getSelectOptions({
        locales: GOOGLE_TRANSLATOR_LANGUAGES,
        sort: false,
      });
      config.fields.translatorLanguage.options = translatorGoogleLanguages;
    }

    if (workspaces.isFeatureActive) {
      config.fields.keepAllWorkspacesLoaded = {
        label: intl.formatMessage(messages.keepAllWorkspacesLoaded),
        value: ifUndefined<boolean>(
          workspaces.settings.keepAllWorkspacesLoaded,
          DEFAULT_APP_SETTINGS.keepAllWorkspacesLoaded,
        ),
        default: DEFAULT_APP_SETTINGS.keepAllWorkspacesLoaded,
        type: 'checkbox',
      };
    }

    if (todos.isFeatureActive) {
      config.fields.enableTodos = {
        label: intl.formatMessage(messages.enableTodos),
        value: ifUndefined<boolean>(
          todos.settings.isFeatureEnabledByUser,
          DEFAULT_APP_SETTINGS.isTodosFeatureEnabled,
        ),
        default: DEFAULT_APP_SETTINGS.isTodosFeatureEnabled,
        type: 'checkbox',
      };
    }

    return new Form(config);
  }

  render(): ReactElement {
    const { app } = this.props.stores;
    const {
      updateStatus,
      updateVersion,
      updateStatusTypes,
      isClearingAllCache,
      isLockingFeatureEnabled,
    } = app;
    const { checkForUpdates, installUpdate, clearAllCache } =
      this.props.actions.app;
    const form = this.prepareForm();
    return (
      <ErrorBoundary>
        <EditSettingsForm
          form={form}
          checkForUpdates={checkForUpdates}
          installUpdate={installUpdate}
          updateVersion={updateVersion}
          isCheckingForUpdates={updateStatus === updateStatusTypes.CHECKING}
          isUpdateAvailable={updateStatus === updateStatusTypes.AVAILABLE}
          noUpdateAvailable={updateStatus === updateStatusTypes.NOT_AVAILABLE}
          updateIsReadyToInstall={updateStatus === updateStatusTypes.DOWNLOADED}
          updateFailed={updateStatus === updateStatusTypes.FAILED}
          showServicesUpdatedInfoBar={
            this.props.stores.ui.showServicesUpdatedInfoBar
          }
          onSubmit={d => this.onSubmit(d)}
          getCacheSize={() => app.cacheSize}
          isClearingAllCache={isClearingAllCache}
          onClearAllCache={clearAllCache}
          isLockingFeatureEnabled={isLockingFeatureEnabled}
          automaticUpdates={this.props.stores.settings.app.automaticUpdates}
          isDarkmodeEnabled={this.props.stores.settings.app.darkMode}
          isAdaptableDarkModeEnabled={
            this.props.stores.settings.app.adaptableDarkMode
          }
          isUseGrayscaleServicesEnabled={
            this.props.stores.settings.app.useGrayscaleServices
          }
          isSplitModeEnabled={this.props.stores.settings.app.splitMode}
          isTwoFactorAutoCatcherEnabled={
            this.props.stores.settings.app.isTwoFactorAutoCatcherEnabled
          }
          twoFactorAutoCatcherMatcher={
            this.props.stores.settings.app.twoFactorAutoCatcherMatcher
          }
          isTodosActivated={this.props.stores.todos.isFeatureEnabledByUser}
          openProcessManager={() => this.openProcessManager()}
          isOnline={app.isOnline}
          serverURL={importExportURL()}
        />
      </ErrorBoundary>
    );
  }
}

export default injectIntl(EditSettingsScreen);
