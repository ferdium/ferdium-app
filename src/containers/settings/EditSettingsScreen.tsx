import { ipcRenderer } from 'electron';
import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';

import { FormFields } from '../../@types/mobx-form.types';
import { StoresProps } from '../../@types/ferdium-components.types';
import Form from '../../lib/Form';
import { APP_LOCALES, SPELLCHECKER_LOCALES } from '../../i18n/languages';
import {
  DEFAULT_APP_SETTINGS,
  HIBERNATION_STRATEGIES,
  SIDEBAR_WIDTH,
  SIDEBAR_SERVICES_LOCATION,
  ICON_SIZES,
  NAVIGATION_BAR_BEHAVIOURS,
  SEARCH_ENGINE_NAMES,
  TRANSLATOR_LANGUAGES,
  TODO_APPS,
  DEFAULT_SETTING_KEEP_ALL_WORKSPACES_LOADED,
  DEFAULT_IS_FEATURE_ENABLED_BY_USER,
  WAKE_UP_STRATEGIES,
  WAKE_UP_HIBERNATION_STRATEGIES,
  SPLIT_COLUMNS_MIN,
  SPLIT_COLUMNS_MAX,
} from '../../config';
import { isMac } from '../../environment';

import { getSelectOptions } from '../../helpers/i18n-helpers';
import { hash } from '../../helpers/password-helpers';
import defaultUserAgent from '../../helpers/userAgent-helpers';

import EditSettingsForm from '../../components/settings/settings/EditSettingsForm';
import ErrorBoundary from '../../components/util/ErrorBoundary';

import globalMessages from '../../i18n/globalMessages';
import { importExportURL } from '../../api/apiBase';

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
  navigationBarBehaviour: {
    id: 'settings.app.form.navigationBarBehaviour',
    defaultMessage: 'Navigation bar behaviour',
  },
  searchEngine: {
    id: 'settings.app.form.searchEngine',
    defaultMessage: 'Search engine',
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
  alwaysShowWorkspaces: {
    id: 'settings.app.form.alwaysShowWorkspaces',
    defaultMessage: 'Always show workspace drawer',
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
});

interface EditSettingsScreenProps extends StoresProps {
  intl: any;
}

class EditSettingsScreen extends Component<EditSettingsScreenProps> {
  state = {
    lockedPassword: '',
  };

  onSubmit(settingsData) {
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

    settings.update({
      type: 'app',
      // TODO: The conversions might not be necessary once we convert to typescript
      data: {
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
        navigationBarBehaviour: settingsData.navigationBarBehaviour,
        searchEngine: settingsData.searchEngine,
        translatorLanguage: settingsData.translatorLanguage,
        hibernateOnStartup: Boolean(settingsData.hibernateOnStartup),
        hibernationStrategy: Number(settingsData.hibernationStrategy),
        wakeUpStrategy: Number(settingsData.wakeUpStrategy),
        wakeUpHibernationStrategy: Number(
          settingsData.wakeUpHibernationStrategy,
        ),
        wakeUpHibernationSplay: Boolean(settingsData.wakeUpHibernationSplay),
        predefinedTodoServer: settingsData.predefinedTodoServer,
        customTodoServer: settingsData.customTodoServer,
        lockingFeatureEnabled: Boolean(settingsData.lockingFeatureEnabled),
        lockedPassword: useOriginalPassword
          ? this.props.stores.settings.all.app.lockedPassword
          : hash(String(settingsData.lockedPassword)),
        useTouchIdToUnlock: Boolean(settingsData.useTouchIdToUnlock),
        inactivityLock: Number(settingsData.inactivityLock),
        scheduledDNDEnabled: Boolean(settingsData.scheduledDNDEnabled),
        scheduledDNDStart: settingsData.scheduledDNDStart,
        scheduledDNDEnd: settingsData.scheduledDNDEnd,
        enableGPUAcceleration: Boolean(settingsData.enableGPUAcceleration),
        enableGlobalHideShortcut: Boolean(
          settingsData.enableGlobalHideShortcut,
        ),
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
        alwaysShowWorkspaces: Boolean(settingsData.alwaysShowWorkspaces),
        accentColor: settingsData.accentColor,
        progressbarAccentColor: settingsData.progressbarAccentColor,
        showMessageBadgeWhenMuted: Boolean(
          settingsData.showMessageBadgeWhenMuted,
        ),
        showDragArea: Boolean(settingsData.showDragArea),
        enableSpellchecking: Boolean(settingsData.enableSpellchecking),
        spellcheckerLanguage: settingsData.spellcheckerLanguage,
        userAgentPref: settingsData.userAgentPref,
        beta: Boolean(settingsData.beta), // we need this info in the main process as well
        automaticUpdates: Boolean(settingsData.automaticUpdates), // we need this info in the main process as well
        locale: settingsData.locale, // we need this info in the main process as well
      },
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

    const searchEngines = getSelectOptions({
      locales: SEARCH_ENGINE_NAMES,
      sort: false,
    });

    const translatorLanguages = getSelectOptions({
      locales: TRANSLATOR_LANGUAGES,
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
          value: app.autoLaunchOnStart,
          default: DEFAULT_APP_SETTINGS.autoLaunchOnStart,
        },
        autoLaunchInBackground: {
          label: intl.formatMessage(messages.autoLaunchInBackground),
          value: app.launchInBackground,
          default: DEFAULT_APP_SETTINGS.autoLaunchInBackground,
        },
        runInBackground: {
          label: intl.formatMessage(messages.runInBackground),
          value: settings.all.app.runInBackground,
          default: DEFAULT_APP_SETTINGS.runInBackground,
        },
        startMinimized: {
          label: intl.formatMessage(messages.startMinimized),
          value: settings.all.app.startMinimized,
          default: DEFAULT_APP_SETTINGS.startMinimized,
        },
        confirmOnQuit: {
          label: intl.formatMessage(messages.confirmOnQuit),
          value: settings.all.app.confirmOnQuit,
          default: DEFAULT_APP_SETTINGS.confirmOnQuit,
        },
        enableSystemTray: {
          label: intl.formatMessage(
            isMac ? messages.enableMenuBar : messages.enableSystemTray,
          ),
          value: settings.all.app.enableSystemTray,
          default: DEFAULT_APP_SETTINGS.enableSystemTray,
        },
        reloadAfterResume: {
          label: intl.formatMessage(messages.reloadAfterResume),
          value: settings.all.app.reloadAfterResume,
          default: DEFAULT_APP_SETTINGS.reloadAfterResume,
        },
        reloadAfterResumeTime: {
          label: intl.formatMessage(messages.reloadAfterResumeTime),
          value: settings.all.app.reloadAfterResumeTime,
          default: DEFAULT_APP_SETTINGS.reloadAfterResumeTime,
        },
        minimizeToSystemTray: {
          label: intl.formatMessage(messages.minimizeToSystemTray),
          value: settings.all.app.minimizeToSystemTray,
          default: DEFAULT_APP_SETTINGS.minimizeToSystemTray,
        },
        closeToSystemTray: {
          label: intl.formatMessage(messages.closeToSystemTray),
          value: settings.all.app.closeToSystemTray,
          default: DEFAULT_APP_SETTINGS.closeToSystemTray,
        },
        privateNotifications: {
          label: intl.formatMessage(messages.privateNotifications),
          value: settings.all.app.privateNotifications,
          default: DEFAULT_APP_SETTINGS.privateNotifications,
        },
        clipboardNotifications: {
          label: intl.formatMessage(messages.clipboardNotifications),
          value: settings.all.app.clipboardNotifications,
          default: DEFAULT_APP_SETTINGS.clipboardNotifications,
        },
        notifyTaskBarOnMessage: {
          label: intl.formatMessage(messages.notifyTaskBarOnMessage),
          value: settings.all.app.notifyTaskBarOnMessage,
          default: DEFAULT_APP_SETTINGS.notifyTaskBarOnMessage,
        },
        navigationBarBehaviour: {
          label: intl.formatMessage(messages.navigationBarBehaviour),
          value: settings.all.app.navigationBarBehaviour,
          default: DEFAULT_APP_SETTINGS.navigationBarBehaviour,
          options: navigationBarBehaviours,
        },
        searchEngine: {
          label: intl.formatMessage(messages.searchEngine),
          value: settings.all.app.searchEngine,
          default: DEFAULT_APP_SETTINGS.searchEngine,
          options: searchEngines,
        },
        translatorLanguage: {
          label: intl.formatMessage(messages.translatorLanguage),
          value: settings.all.app.translatorLanguage,
          default: DEFAULT_APP_SETTINGS.translatorLanguage,
          options: translatorLanguages,
        },
        hibernateOnStartup: {
          label: intl.formatMessage(messages.hibernateOnStartup),
          value: settings.all.app.hibernateOnStartup,
          default: DEFAULT_APP_SETTINGS.hibernateOnStartup,
        },
        hibernationStrategy: {
          label: intl.formatMessage(messages.hibernationStrategy),
          value: settings.all.app.hibernationStrategy,
          options: hibernationStrategies,
          default: DEFAULT_APP_SETTINGS.hibernationStrategy,
        },
        wakeUpStrategy: {
          label: intl.formatMessage(messages.wakeUpStrategy),
          value: settings.all.app.wakeUpStrategy,
          options: wakeUpStrategies,
          default: DEFAULT_APP_SETTINGS.wakeUpStrategy,
        },
        wakeUpHibernationStrategy: {
          label: intl.formatMessage(messages.wakeUpHibernationStrategy),
          value: settings.all.app.wakeUpHibernationStrategy,
          options: wakeUpHibernationStrategies,
          default: DEFAULT_APP_SETTINGS.wakeUpHibernationStrategy,
        },
        wakeUpHibernationSplay: {
          label: intl.formatMessage(messages.wakeUpHibernationSplay),
          value: settings.all.app.wakeUpHibernationSplay,
          default: DEFAULT_APP_SETTINGS.wakeUpHibernationSplay,
        },
        predefinedTodoServer: {
          label: intl.formatMessage(messages.predefinedTodoServer),
          value: settings.all.app.predefinedTodoServer,
          default: DEFAULT_APP_SETTINGS.predefinedTodoServer,
          options: todoApp,
        },
        customTodoServer: {
          label: intl.formatMessage(messages.customTodoServer),
          value: settings.all.app.customTodoServer,
          default: DEFAULT_APP_SETTINGS.customTodoServer,
        },
        lockingFeatureEnabled: {
          label: intl.formatMessage(messages.enableLock),
          value: settings.all.app.lockingFeatureEnabled || false,
          default: DEFAULT_APP_SETTINGS.lockingFeatureEnabled,
        },
        lockedPassword: {
          label: intl.formatMessage(messages.lockPassword),
          value: lockedPassword,
          default: '',
          type: 'password',
        },
        useTouchIdToUnlock: {
          label: intl.formatMessage(messages.useTouchIdToUnlock),
          value: settings.all.app.useTouchIdToUnlock,
          default: DEFAULT_APP_SETTINGS.useTouchIdToUnlock,
        },
        inactivityLock: {
          label: intl.formatMessage(messages.inactivityLock),
          value: settings.all.app.inactivityLock,
          default: 0,
          type: 'number',
        },
        scheduledDNDEnabled: {
          label: intl.formatMessage(messages.scheduledDNDEnabled),
          value: settings.all.app.scheduledDNDEnabled || false,
          default: DEFAULT_APP_SETTINGS.scheduledDNDEnabled,
        },
        scheduledDNDStart: {
          label: intl.formatMessage(messages.scheduledDNDStart),
          value: settings.all.app.scheduledDNDStart,
          default: '17:00',
          type: 'time',
        },
        scheduledDNDEnd: {
          label: intl.formatMessage(messages.scheduledDNDEnd),
          value: settings.all.app.scheduledDNDEnd,
          default: '09:00',
          type: 'time',
        },
        showDisabledServices: {
          label: intl.formatMessage(messages.showDisabledServices),
          value: settings.all.app.showDisabledServices,
          default: DEFAULT_APP_SETTINGS.showDisabledServices,
        },
        showServiceName: {
          label: intl.formatMessage(messages.showServiceName),
          value: settings.all.app.showServiceName,
          default: DEFAULT_APP_SETTINGS.showServiceName,
        },
        showMessageBadgeWhenMuted: {
          label: intl.formatMessage(messages.showMessageBadgeWhenMuted),
          value: settings.all.app.showMessageBadgeWhenMuted,
          default: DEFAULT_APP_SETTINGS.showMessageBadgeWhenMuted,
        },
        showDragArea: {
          label: intl.formatMessage(messages.showDragArea),
          value: settings.all.app.showDragArea,
          default: DEFAULT_APP_SETTINGS.showDragArea,
        },
        enableSpellchecking: {
          label: intl.formatMessage(messages.enableSpellchecking),
          value: settings.all.app.enableSpellchecking,
          default: DEFAULT_APP_SETTINGS.enableSpellchecking,
        },
        spellcheckerLanguage: {
          label: intl.formatMessage(globalMessages.spellcheckerLanguage),
          value: settings.all.app.spellcheckerLanguage,
          options: spellcheckingLanguages,
          default: DEFAULT_APP_SETTINGS.spellcheckerLanguage,
        },
        userAgentPref: {
          label: intl.formatMessage(globalMessages.userAgentPref),
          value: settings.all.app.userAgentPref,
          default: DEFAULT_APP_SETTINGS.userAgentPref,
          placeholder: defaultUserAgent(),
        },
        darkMode: {
          label: intl.formatMessage(messages.darkMode),
          value: settings.all.app.darkMode,
          default: DEFAULT_APP_SETTINGS.darkMode,
        },
        adaptableDarkMode: {
          label: intl.formatMessage(messages.adaptableDarkMode),
          value: settings.all.app.adaptableDarkMode,
          default: DEFAULT_APP_SETTINGS.adaptableDarkMode,
        },
        universalDarkMode: {
          label: intl.formatMessage(messages.universalDarkMode),
          value: settings.all.app.universalDarkMode,
          default: DEFAULT_APP_SETTINGS.universalDarkMode,
        },
        splitMode: {
          label: intl.formatMessage(messages.splitMode),
          value: settings.all.app.splitMode,
          default: DEFAULT_APP_SETTINGS.splitMode,
        },
        splitColumns: {
          label: `${intl.formatMessage(
            messages.splitColumns,
          )} (${SPLIT_COLUMNS_MIN}-${SPLIT_COLUMNS_MAX})`,
          value: settings.all.app.splitColumns,
          default: DEFAULT_APP_SETTINGS.splitColumns,
        },
        serviceRibbonWidth: {
          label: intl.formatMessage(messages.serviceRibbonWidth),
          value: settings.all.app.serviceRibbonWidth,
          default: DEFAULT_APP_SETTINGS.serviceRibbonWidth,
          options: sidebarWidth,
        },
        sidebarServicesLocation: {
          label: intl.formatMessage(messages.sidebarServicesLocation),
          value: settings.all.app.sidebarServicesLocation,
          default: DEFAULT_APP_SETTINGS.sidebarServicesLocation,
          options: sidebarServicesLocation,
        },
        iconSize: {
          label: intl.formatMessage(messages.iconSize),
          value: settings.all.app.iconSize,
          default: DEFAULT_APP_SETTINGS.iconSize,
          options: iconSizes,
        },
        enableLongPressServiceHint: {
          label: intl.formatMessage(messages.enableLongPressServiceHint),
          value: settings.all.app.enableLongPressServiceHint,
          default: DEFAULT_APP_SETTINGS.enableLongPressServiceHint,
        },
        useHorizontalStyle: {
          label: intl.formatMessage(messages.useHorizontalStyle),
          value: settings.all.app.useHorizontalStyle,
          default: DEFAULT_APP_SETTINGS.useHorizontalStyle,
        },
        hideCollapseButton: {
          label: intl.formatMessage(messages.hideCollapseButton),
          value: settings.all.app.hideCollapseButton,
          default: DEFAULT_APP_SETTINGS.hideCollapseButton,
        },
        hideRecipesButton: {
          label: intl.formatMessage(messages.hideRecipesButton),
          value: settings.all.app.hideRecipesButton,
          default: DEFAULT_APP_SETTINGS.hideRecipesButton,
        },
        hideSplitModeButton: {
          label: intl.formatMessage(messages.hideSplitModeButton),
          value: settings.all.app.hideSplitModeButton,
          default: DEFAULT_APP_SETTINGS.hideSplitModeButton,
        },
        useGrayscaleServices: {
          label: intl.formatMessage(messages.useGrayscaleServices),
          value: settings.all.app.useGrayscaleServices,
          default: DEFAULT_APP_SETTINGS.useGrayscaleServices,
        },
        grayscaleServicesDim: {
          label: intl.formatMessage(messages.grayscaleServicesDim),
          value: settings.all.app.grayscaleServicesDim,
          default: DEFAULT_APP_SETTINGS.grayscaleServicesDim,
        },
        hideWorkspacesButton: {
          label: intl.formatMessage(messages.hideWorkspacesButton),
          value: settings.all.app.hideWorkspacesButton,
          default: DEFAULT_APP_SETTINGS.hideWorkspacesButton,
        },
        hideNotificationsButton: {
          label: intl.formatMessage(messages.hideNotificationsButton),
          value: settings.all.app.hideNotificationsButton,
          default: DEFAULT_APP_SETTINGS.hideNotificationsButton,
        },
        hideSettingsButton: {
          label: intl.formatMessage(messages.hideSettingsButton),
          value: settings.all.app.hideSettingsButton,
          default: DEFAULT_APP_SETTINGS.hideSettingsButton,
        },
        alwaysShowWorkspaces: {
          label: intl.formatMessage(messages.alwaysShowWorkspaces),
          value: settings.all.app.alwaysShowWorkspaces,
          default: DEFAULT_APP_SETTINGS.alwaysShowWorkspaces,
        },
        accentColor: {
          label: intl.formatMessage(messages.accentColor),
          value: settings.all.app.accentColor,
          default: DEFAULT_APP_SETTINGS.accentColor,
        },
        progressbarAccentColor: {
          label: intl.formatMessage(messages.progressbarAccentColor),
          value: settings.all.app.progressbarAccentColor,
          default: DEFAULT_APP_SETTINGS.progressbarAccentColor,
        },
        enableGPUAcceleration: {
          label: intl.formatMessage(messages.enableGPUAcceleration),
          value: settings.all.app.enableGPUAcceleration,
          default: DEFAULT_APP_SETTINGS.enableGPUAcceleration,
        },
        enableGlobalHideShortcut: {
          label: intl.formatMessage(messages.enableGlobalHideShortcut),
          value: settings.all.app.enableGlobalHideShortcut,
          default: DEFAULT_APP_SETTINGS.enableGlobalHideShortcut,
        },
        locale: {
          label: intl.formatMessage(messages.language),
          value: app.locale,
          options: locales,
          default: DEFAULT_APP_SETTINGS.locale,
        },
        beta: {
          label: intl.formatMessage(messages.beta),
          value: user.data.beta,
          default: DEFAULT_APP_SETTINGS.beta,
        },
        automaticUpdates: {
          label: intl.formatMessage(messages.automaticUpdates),
          value: settings.app.automaticUpdates,
          default: DEFAULT_APP_SETTINGS.automaticUpdates,
        },
      },
    };

    if (workspaces.isFeatureActive) {
      config.fields.keepAllWorkspacesLoaded = {
        label: intl.formatMessage(messages.keepAllWorkspacesLoaded),
        value: workspaces.settings.keepAllWorkspacesLoaded,
        default: DEFAULT_SETTING_KEEP_ALL_WORKSPACES_LOADED,
      };
    }

    if (todos.isFeatureActive) {
      config.fields.enableTodos = {
        label: intl.formatMessage(messages.enableTodos),
        value: todos.settings.isFeatureEnabledByUser,
        default: DEFAULT_IS_FEATURE_ENABLED_BY_USER,
      };
    }

    // @ts-ignore: Remove this ignore once mobx-react-form v4 with typescript
    // support has been released.
    return new Form(config);
  }

  render(): ReactElement {
    const { app } = this.props.stores;
    const {
      updateStatus,
      updateVersion,
      updateStatusTypes,
      isClearingAllCache,
      lockingFeatureEnabled,
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
          lockingFeatureEnabled={lockingFeatureEnabled}
          automaticUpdates={this.props.stores.settings.app.automaticUpdates}
          isDarkmodeEnabled={this.props.stores.settings.app.darkMode}
          isAdaptableDarkModeEnabled={
            this.props.stores.settings.app.adaptableDarkMode
          }
          isUseGrayscaleServicesEnabled={
            this.props.stores.settings.app.useGrayscaleServices
          }
          isSplitModeEnabled={this.props.stores.settings.app.splitMode}
          isTodosActivated={this.props.stores.todos.isFeatureEnabledByUser}
          isUsingCustomTodoService={
            this.props.stores.todos.isUsingCustomTodoService
          }
          openProcessManager={() => this.openProcessManager()}
          isOnline={app.isOnline}
          serverURL={importExportURL()}
        />
      </ErrorBoundary>
    );
  }
}

export default injectIntl(
  inject('stores', 'actions')(observer(EditSettingsScreen)),
);
