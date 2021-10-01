import os from 'os';

import { DEFAULT_ACCENT_COLOR } from '@meetfranz/theme';

import {
  LIVE_FERDI_API,
  DEFAULT_TODO_SERVICE,
  SEARCH_ENGINE_DDG,
  iconSizeBias,
} from './config';

export const isMac = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';

export const electronVersion = process.versions.electron;
export const chromeVersion = process.versions.chrome;
export const nodeVersion = process.versions.node;

export const osPlatform = os.platform();
export const osArch = os.arch();
export const osRelease = os.release();
export const is64Bit = osArch.match(/64/);

// for accelerator, show the shortform that electron/OS understands
// for tooltip, show symbol
const ctrlKey = isMac ? '⌘' : 'Ctrl';
const cmdKey = isMac ? 'Cmd' : 'Ctrl';

export const altKey = (isAccelerator = true) =>
  !isAccelerator && isMac ? '⌥' : 'Alt';
export const shiftKey = (isAccelerator = true) =>
  !isAccelerator && isMac ? '⇧' : 'Shift';

// Platform specific shortcut keys
export const cmdOrCtrlShortcutKey = (isAccelerator = true) =>
  isAccelerator ? cmdKey : ctrlKey;
export const lockFerdiShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${shiftKey(isAccelerator)}+L`;
export const todosToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+T`;
export const workspaceToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+D`;
export const muteFerdiShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${shiftKey(isAccelerator)}+M`;
export const addNewServiceShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+N`;
export const settingsShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${isMac ? ',' : 'P'}`;

export const DEFAULT_APP_SETTINGS = {
  autoLaunchInBackground: false,
  runInBackground: true,
  reloadAfterResume: true,
  enableSystemTray: true,
  startMinimized: false,
  confirmOnQuit: false,
  minimizeToSystemTray: false,
  closeToSystemTray: false,
  privateNotifications: false,
  clipboardNotifications: true,
  notifyTaskBarOnMessage: false,
  showDisabledServices: true,
  showMessageBadgeWhenMuted: true,
  showDragArea: false,
  enableSpellchecking: true,
  spellcheckerLanguage: 'en-us',
  darkMode: false,
  splitMode: false,
  locale: '',
  fallbackLocale: 'en-US',
  beta: false,
  isAppMuted: false,
  enableGPUAcceleration: true,

  // Ferdi specific options
  server: LIVE_FERDI_API,
  predefinedTodoServer: DEFAULT_TODO_SERVICE,
  autohideMenuBar: false,
  lockingFeatureEnabled: false,
  locked: false,
  lockedPassword: '',
  useTouchIdToUnlock: true,
  scheduledDNDEnabled: false,
  scheduledDNDStart: '17:00',
  scheduledDNDEnd: '09:00',
  hibernateOnStartup: true,
  hibernationStrategy: '300', // seconds
  wakeUpStrategy: '300', // seconds
  inactivityLock: 0,
  automaticUpdates: true,
  universalDarkMode: true,
  userAgentPref: '',
  adaptableDarkMode: true,
  accentColor: DEFAULT_ACCENT_COLOR,
  serviceRibbonWidth: 68,
  iconSize: iconSizeBias,
  sentry: false,
  nightly: false,
  navigationBarBehaviour: 'custom',
  searchEngine: SEARCH_ENGINE_DDG,
  useVerticalStyle: false,
  alwaysShowWorkspaces: false,
  liftSingleInstanceLock: false,
};
