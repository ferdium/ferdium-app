// Note: This file has now become devoid of all references to values deduced from the runtime process - all those now live in the `environment.js` file

import ms from 'ms';
import { defineMessages } from 'react-intl';

import { shiftKey } from './environment';

export const DEFAULT_ACCENT_COLOR = '#7367F0';

export const CHECK_INTERVAL = ms('1h'); // How often should we perform checks

export const LOCAL_HOSTNAME = 'localhost';
export const LOCAL_PORT = 46_569;
export const LOCAL_API = 'http://localhost:3000';
export const DEV_FRANZ_API = 'https://dev.franzinfra.com';

export const LIVE_FERDIUM_API = 'https://api.ferdium.org';
export const LIVE_FRANZ_API = 'https://api.franzinfra.com';

// URL used to submit debugger information, see https://github.com/ferdium/debugger
export const DEBUG_API = 'https://debug.ferdium.org';

export const LOCAL_WS_API = 'ws://localhost:3000';
export const DEV_WS_API = 'wss://dev.franzinfra.com';
export const LIVE_WS_API = 'wss://api.franzinfra.com';

export const LOCAL_API_WEBSITE = 'http://localhost:3333';
export const DEV_API_FRANZ_WEBSITE = 'https://meetfranz.com';
export const LIVE_API_FERDIUM_WEBSITE = 'https://ferdium.org';
export const LIVE_API_FERDIUM_LIBRETRANSLATE =
  'https://translator.ferdium.org/translate';

export const LOCAL_TODOS_FRONTEND_URL = 'http://localhost:4000';
export const PRODUCTION_TODOS_FRONTEND_URL = 'https://app.franztodos.com';

export const CDN_URL = 'https://cdn.franzinfra.com';

export const KEEP_WS_LOADED_USID = '0a0aa000-0a0a-49a0-a000-a0a0a0a0a0a0';

// Configuration messages for internationalization
export const configMessages = defineMessages({
  // WEBRTC_IP_HANDLING_POLICY
  webrtcExposePublicAndLocal: {
    id: 'config.webrtc.exposePublicAndLocal',
    defaultMessage: 'Expose user public and local IPs',
  },
  webrtcExposePublicOnly: {
    id: 'config.webrtc.exposePublicOnly',
    defaultMessage: 'Expose user public IP, but not expose user local IP',
  },
  webrtcExposePublicAndLocalDefaultRoute: {
    id: 'config.webrtc.exposePublicAndLocalDefaultRoute',
    defaultMessage:
      'Expose user public and local IPs (only use default route used by http)',
  },
  webrtcDoNotExpose: {
    id: 'config.webrtc.doNotExpose',
    defaultMessage: 'Do not expose public or local IPs',
  },

  // HIBERNATION_STRATEGIES
  hibernationExtremelyFast: {
    id: 'config.hibernation.extremelyFast',
    defaultMessage: 'Extremely Fast Hibernation (10sec)',
  },
  hibernationVeryFast: {
    id: 'config.hibernation.veryFast',
    defaultMessage: 'Very Fast Hibernation (30sec)',
  },
  hibernationFast: {
    id: 'config.hibernation.fast',
    defaultMessage: 'Fast Hibernation (1min)',
  },
  hibernationNormal: {
    id: 'config.hibernation.normal',
    defaultMessage: 'Normal Hibernation (5min)',
  },
  hibernationSlow: {
    id: 'config.hibernation.slow',
    defaultMessage: 'Slow Hibernation (10min)',
  },
  hibernationVerySlow: {
    id: 'config.hibernation.verySlow',
    defaultMessage: 'Very Slow Hibernation (30min)',
  },
  hibernationExtremelySlow: {
    id: 'config.hibernation.extremelySlow',
    defaultMessage: 'Extremely Slow Hibernation (1hour)',
  },

  // WAKE_UP_STRATEGIES
  wakeUpNever: {
    id: 'config.wakeUp.never',
    defaultMessage: 'Never wake up',
  },
  wakeUp10sec: {
    id: 'config.wakeUp.10sec',
    defaultMessage: 'Wake up after 10sec',
  },
  wakeUp30sec: {
    id: 'config.wakeUp.30sec',
    defaultMessage: 'Wake up after 30sec',
  },
  wakeUp1min: {
    id: 'config.wakeUp.1min',
    defaultMessage: 'Wake up after 1min',
  },
  wakeUp5min: {
    id: 'config.wakeUp.5min',
    defaultMessage: 'Wake up after 5min',
  },
  wakeUp10min: {
    id: 'config.wakeUp.10min',
    defaultMessage: 'Wake up after 10min',
  },
  wakeUp30min: {
    id: 'config.wakeUp.30min',
    defaultMessage: 'Wake up after 30min',
  },
  wakeUp1hour: {
    id: 'config.wakeUp.1hour',
    defaultMessage: 'Wake up after 1hour',
  },

  // WAKE_UP_HIBERNATION_STRATEGIES
  wakeUpHibernationUseMain: {
    id: 'config.wakeUpHibernation.useMain',
    defaultMessage: 'Use main hibernation strategy',
  },

  // NAVIGATION_BAR_BEHAVIOURS
  navigationBarCustom: {
    id: 'config.navigationBar.custom',
    defaultMessage: 'Show navigation bar on custom websites only',
  },
  navigationBarAlways: {
    id: 'config.navigationBar.always',
    defaultMessage: 'Show navigation bar on all services',
  },
  navigationBarNever: {
    id: 'config.navigationBar.never',
    defaultMessage: 'Never show navigation bar',
  },

  // SIDEBAR_WIDTH
  sidebarExtremelySlim: {
    id: 'config.sidebar.extremelySlim',
    defaultMessage: 'Extremely slim sidebar',
  },
  sidebarVerySlim: {
    id: 'config.sidebar.verySlim',
    defaultMessage: 'Very slim sidebar',
  },
  sidebarSlim: {
    id: 'config.sidebar.slim',
    defaultMessage: 'Slim sidebar',
  },
  sidebarNormal: {
    id: 'config.sidebar.normal',
    defaultMessage: 'Normal sidebar',
  },
  sidebarWide: {
    id: 'config.sidebar.wide',
    defaultMessage: 'Wide sidebar',
  },
  sidebarVeryWide: {
    id: 'config.sidebar.veryWide',
    defaultMessage: 'Very wide sidebar',
  },
  sidebarExtremelyWide: {
    id: 'config.sidebar.extremelyWide',
    defaultMessage: 'Extremely wide sidebar',
  },

  // SIDEBAR_SERVICES_LOCATION
  sidebarLocationTopLeft: {
    id: 'config.sidebarLocation.topLeft',
    defaultMessage: 'Top/Left',
  },
  sidebarLocationCenter: {
    id: 'config.sidebarLocation.center',
    defaultMessage: 'Center',
  },
  sidebarLocationBottomRight: {
    id: 'config.sidebarLocation.bottomRight',
    defaultMessage: 'Bottom/Right',
  },

  // ICON_SIZES
  iconSizeVerySmall: {
    id: 'config.iconSize.verySmall',
    defaultMessage: 'Very small icons',
  },
  iconSizeSmall: {
    id: 'config.iconSize.small',
    defaultMessage: 'Small icons',
  },
  iconSizeNormal: {
    id: 'config.iconSize.normal',
    defaultMessage: 'Normal icons',
  },
  iconSizeLarge: {
    id: 'config.iconSize.large',
    defaultMessage: 'Large icons',
  },
  iconSizeVeryLarge: {
    id: 'config.iconSize.veryLarge',
    defaultMessage: 'Very large icons',
  },
});

const defaultWebRTCIPHandlingPolicy = 'default';
const publicWebRTCIPHandlingPolicy = 'default_public_interface_only';
const publicPrivateWebRTCIPHandlingPolicy =
  'default_public_and_private_interfaces';
const disableWebRTCIPHandlingPolicy = 'disable_non_proxied_udp';

// NOTE: For internationalized version, use getI18nConfigObjects().WEBRTC_IP_HANDLING_POLICY
export const WEBRTC_IP_HANDLING_POLICY = {
  [defaultWebRTCIPHandlingPolicy]: 'Expose user public and local IPs',
  [publicWebRTCIPHandlingPolicy]:
    'Expose user public IP, but not expose user local IP',
  [publicPrivateWebRTCIPHandlingPolicy]:
    'Expose user public and local IPs (only use default route used by http)',
  [disableWebRTCIPHandlingPolicy]: 'Do not expose public or local IPs',
};

export const SCREENSHARE_CANCELLED_BY_USER =
  'desktop-capturer-selection__cancel';

// NOTE: For internationalized version, use getI18nConfigObjects().HIBERNATION_STRATEGIES
export const HIBERNATION_STRATEGIES = {
  10: 'Extremely Fast Hibernation (10sec)',
  30: 'Very Fast Hibernation (30sec)',
  60: 'Fast Hibernation (1min)',
  300: 'Normal Hibernation (5min)',
  600: 'Slow Hibernation (10min)',
  1800: 'Very Slow Hibernation (30min)',
  3600: 'Extremely Slow Hibernation (1hour)',
};

// NOTE: For internationalized version, use getI18nConfigObjects().WAKE_UP_STRATEGIES
export const WAKE_UP_STRATEGIES = {
  0: 'Never wake up',
  10: 'Wake up after 10sec',
  30: 'Wake up after 30sec',
  60: 'Wake up after 1min',
  300: 'Wake up after 5min',
  600: 'Wake up after 10min',
  1800: 'Wake up after 30min',
  3600: 'Wake up after 1hour',
};

// NOTE: For internationalized version, use getI18nConfigObjects().WAKE_UP_HIBERNATION_STRATEGIES
export const WAKE_UP_HIBERNATION_STRATEGIES = {
  0: 'Use main hibernation strategy',
  10: 'Extremely Fast Hibernation (10sec)',
  30: 'Very Fast Hibernation (30sec)',
  60: 'Fast Hibernation (1min)',
  300: 'Normal Hibernation (5min)',
  600: 'Slow Hibernation (10min)',
  1800: 'Very Slow Hibernation (30min)',
  3600: 'Extremely Slow Hibernation (1hour)',
};

// NOTE: For internationalized version, use getI18nConfigObjects().NAVIGATION_BAR_BEHAVIOURS
export const NAVIGATION_BAR_BEHAVIOURS = {
  custom: 'Show navigation bar on custom websites only',
  always: 'Show navigation bar on all services',
  never: 'Never show navigation bar',
};

const SEARCH_ENGINE_STARTPAGE = 'startPage';
const SEARCH_ENGINE_GOOGLE = 'google';
const SEARCH_ENGINE_DDG = 'duckDuckGo';
const SEARCH_ENGINE_BING = 'bing';
export const SEARCH_ENGINE_NAMES = {
  [SEARCH_ENGINE_STARTPAGE]: 'Startpage',
  [SEARCH_ENGINE_GOOGLE]: 'Google',
  [SEARCH_ENGINE_DDG]: 'DuckDuckGo',
  [SEARCH_ENGINE_BING]: 'Bing',
};

export const TRANSLATOR_ENGINE_GOOGLE = 'Google';
export const TRANSLATOR_ENGINE_LIBRETRANSLATE = 'LibreTranslate';
export const TRANSLATOR_ENGINE_NAMES = {
  [TRANSLATOR_ENGINE_LIBRETRANSLATE]:
    'Ferdium Translator (Powered by LibreTranslate)',
  [TRANSLATOR_ENGINE_GOOGLE]: 'Google',
};

export const LIBRETRANSLATE_TRANSLATOR_LANGUAGES = {
  ar: 'Arabic',
  zh: 'Chinese',
  en: 'English',
  fr: 'French',
  de: 'German',
  hi: 'Hindi',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  es: 'Spanish',
  tr: 'Turkish',
  vi: 'Vietnamese',
};

export const GOOGLE_TRANSLATOR_LANGUAGES = {
  af: 'Afrikaans',
  sq: 'Albanian',
  ar: 'Arabic',
  hy: 'Armenian',
  az: 'Azerbaijani',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  ca: 'Catalan',
  ceb: 'Cebuano',
  ny: 'Chichewa',
  'zh-cn': 'Chinese Simplified',
  'zh-tw': 'Chinese Traditional',
  co: 'Corsican',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  tl: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  fy: 'Frisian',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  ha: 'Hausa',
  haw: 'Hawaiian',
  iw: 'Hebrew',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Hungarian',
  is: 'Icelandic',
  ig: 'Igbo',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  jw: 'Javanese',
  kn: 'Kannada',
  kk: 'Kazakh',
  km: 'Khmer',
  ko: 'Korean',
  ku: 'Kurdish (Kurmanji)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  lt: 'Lithuanian',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  mn: 'Mongolian',
  my: 'Myanmar (Burmese)',
  ne: 'Nepali',
  no: 'Norwegian',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  ma: 'Punjabi',
  ro: 'Romanian',
  ru: 'Russian',
  sm: 'Samoan',
  gd: 'Scots Gaelic',
  sr: 'Serbian',
  st: 'Sesotho',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  su: 'Sudanese',
  sw: 'Swahili',
  sv: 'Swedish',
  tg: 'Tajik',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zu: 'Zulu',
};

export const SEARCH_ENGINE_URLS = {
  [SEARCH_ENGINE_STARTPAGE]: ({ searchTerm }) =>
    `https://www.startpage.com/sp/search?query=${searchTerm}`,
  [SEARCH_ENGINE_GOOGLE]: ({ searchTerm }) =>
    `https://www.google.com/search?q=${searchTerm}`,
  [SEARCH_ENGINE_DDG]: ({ searchTerm }) =>
    `https://duckduckgo.com/?q=${searchTerm}`,
  [SEARCH_ENGINE_BING]: ({ searchTerm }) =>
    `https://www.bing.com/search?q=${searchTerm}`,
};

export const CUSTOM_TODO_SERVICE = 'isUsingCustomTodoService';

const TODO_TODOIST_URL = 'https://todoist.com/app';
const TODO_FRANZ_TODOS_URL = 'https://app.franztodos.com';
const TODO_TICKTICK_URL = 'https://ticktick.com/signin';
const TODO_MSTODO_URL = 'https://todo.microsoft.com/?app#';
const TODO_HABITICA_URL = 'https://habitica.com/login';
const TODO_NOZBE_URL = 'https://app.nozbe.com/#login';
const TODO_RTM_URL = 'https://www.rememberthemilk.com/';
const TODO_ANYDO_URL = 'https://desktop.any.do/';
const TODO_GOOGLETASKS_URL =
  'https://tasks.google.com/embed/?origin=https%3A%2F%2Fcalendar.google.com&fullWidth=1';
const TODO_GOOGLEKEEP_URL = 'https://keep.google.com/';

export const TODO_SERVICE_RECIPE_IDS = {
  [TODO_TODOIST_URL]: 'todoist',
  [TODO_FRANZ_TODOS_URL]: 'franz-todos',
  [TODO_TICKTICK_URL]: 'TickTick',
  [TODO_MSTODO_URL]: 'mstodo',
  [TODO_HABITICA_URL]: 'habitica',
  [TODO_ANYDO_URL]: 'anydo',
  [TODO_GOOGLEKEEP_URL]: 'googlekeep',
};

export const TODO_APPS = {
  [TODO_TODOIST_URL]: 'Todoist',
  [TODO_FRANZ_TODOS_URL]: 'Franz Todo',
  [TODO_TICKTICK_URL]: 'TickTick',
  [TODO_MSTODO_URL]: 'Microsoft To Do',
  [TODO_HABITICA_URL]: 'Habitica',
  [TODO_NOZBE_URL]: 'Nozbe',
  [TODO_RTM_URL]: 'Remember The Milk',
  [TODO_ANYDO_URL]: 'Any.do',
  [TODO_GOOGLETASKS_URL]: 'Google Tasks',
  [TODO_GOOGLEKEEP_URL]: 'Google Keep',
  [CUSTOM_TODO_SERVICE]: 'Other service',
};

// NOTE: For internationalized version, use getI18nConfigObjects().SIDEBAR_WIDTH
export const SIDEBAR_WIDTH = {
  35: 'Extremely slim sidebar',
  45: 'Very slim sidebar',
  55: 'Slim sidebar',
  68: 'Normal sidebar',
  80: 'Wide sidebar',
  90: 'Very wide sidebar',
  100: 'Extremely wide sidebar',
};

export const SIDEBAR_SERVICES_LOCATION_TOPLEFT = 0;
export const SIDEBAR_SERVICES_LOCATION_CENTER = 1;
export const SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT = 2;
// NOTE: For internationalized version, use getI18nConfigObjects().SIDEBAR_SERVICES_LOCATION
export const SIDEBAR_SERVICES_LOCATION = {
  [SIDEBAR_SERVICES_LOCATION_TOPLEFT]: 'Top/Left',
  [SIDEBAR_SERVICES_LOCATION_CENTER]: 'Center',
  [SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT]: 'Bottom/Right',
};

// NOTE: For internationalized version, use getI18nConfigObjects().ICON_SIZES
export const ICON_SIZES = {
  0: 'Very small icons',
  10: 'Small icons',
  20: 'Normal icons',
  30: 'Large icons',
  40: 'Very large icons',
};
// We need a bias to push all icon sizes into positive numbers
// otherwise the settings screen won't sort the sizes correctly.
// The bias should always be the "Normal icons" value
export const iconSizeBias = 20;

export const DEFAULT_WINDOW_OPTIONS = {
  width: 800,
  height: 600,
  x: 0,
  y: 0,
};

export const GITHUB_FRANZ_URL = 'https://github.com/meetfranz';
export const GITHUB_FERDIUM_URL = 'https://github.com/ferdium';
export const FERDIUM_SERVICE_REQUEST = `${GITHUB_FERDIUM_URL}/ferdium-app/issues`;
export const FERDIUM_TRANSLATION = 'https://crowdin.com/project/ferdium-app';
export const FERDIUM_DEV_DOCS =
  'https://github.com/ferdium/ferdium-recipes/blob/main/docs/integration.md';

export const FILE_SYSTEM_SETTINGS_TYPES = ['app', 'proxy', 'shortcuts'];

export const LOCAL_SERVER = 'You are using Ferdium without a server';
export const SERVER_NOT_LOADED = 'Ferdium::SERVER_NOT_LOADED';

export const ALLOWED_PROTOCOLS = ['https:', 'http:', 'ftp:', 'ferdium:'];

export const DEFAULT_TODOS_WIDTH = 300;
export const TODOS_MIN_WIDTH = 200;
export const DEFAULT_TODOS_VISIBLE = false;
export const DEFAULT_IS_TODO_FEATURE_ENABLED_BY_USER = false;
export const TODOS_PARTITION_ID = 'persist:todos';

export const CUSTOM_WEBSITE_RECIPE_ID = 'franz-custom-website';

export const DEFAULT_SERVICE_ORDER = 99; // something high enough that it gets added to the end of the already-added services on the left sidebar

export const SPLIT_COLUMNS_MIN = 1;
export const SPLIT_COLUMNS_MAX = 5;

export const DEFAULT_LOADER_COLOR = '#FFFFFF';

export const DEFAULT_APP_SETTINGS = {
  autoLaunchOnStart: false,
  autoLaunchInBackground: false,
  runInBackground: true,
  reloadAfterResume: true,
  reloadAfterResumeTime: 10,
  enableSystemTray: true,
  startMinimized: false,
  confirmOnQuit: false,
  minimizeToSystemTray: false,
  closeToSystemTray: false,
  privateNotifications: false,
  clipboardNotifications: true,
  notifyTaskBarOnMessage: false,
  showDisabledServices: true,
  isTwoFactorAutoCatcherEnabled: false,
  twoFactorAutoCatcherMatcher: 'token, code, sms, verify',
  showServiceName: false,
  showMessageBadgeWhenMuted: true,
  showDragArea: false,
  enableSpellchecking: true,
  enableTranslator: false,
  spellcheckerLanguage: 'en-us',
  darkMode: false,
  navigationBarManualActive: false,
  splitMode: false,
  splitColumns: 3,
  fallbackLocale: 'en-US',
  beta: false,
  isAppMuted: false,
  enableGPUAcceleration: true,
  enableGlobalHideShortcut: false,

  // Ferdium specific options
  server: LIVE_FERDIUM_API,
  predefinedTodoServer: TODO_TODOIST_URL,
  autohideMenuBar: false,
  isLockingFeatureEnabled: false,
  locked: false,
  lockedPassword: '',
  useTouchIdToUnlock: true,
  scheduledDNDEnabled: false,
  scheduledDNDStart: '17:00',
  scheduledDNDEnd: '09:00',
  hibernateOnStartup: true,
  hibernationStrategy: '300', // seconds
  wakeUpStrategy: '300', // seconds
  wakeUpHibernationStrategy: '0', // seconds -- 0 means do the same as hibernationStrategy
  wakeUpHibernationSplay: true,
  inactivityLock: 0,
  automaticUpdates: true,
  universalDarkMode: true,
  userAgentPref: '',
  downloadFolderPath: '',
  adaptableDarkMode: true,
  accentColor: DEFAULT_ACCENT_COLOR,
  progressbarAccentColor: DEFAULT_ACCENT_COLOR,
  serviceRibbonWidth: 68,
  sidebarServicesLocation: SIDEBAR_SERVICES_LOCATION_TOPLEFT,
  iconSize: iconSizeBias,
  sentry: true,
  navigationBarBehaviour: 'custom',
  webRTCIPHandlingPolicy: disableWebRTCIPHandlingPolicy,
  searchEngine: SEARCH_ENGINE_STARTPAGE,
  translatorLanguage: 'en',
  translatorEngine: TRANSLATOR_ENGINE_LIBRETRANSLATE,
  useHorizontalStyle: false,
  hideCollapseButton: false,
  isMenuCollapsed: false,
  hideRecipesButton: false,
  hideSplitModeButton: true,
  useGrayscaleServices: false,
  grayscaleServicesDim: 50,
  hideWorkspacesButton: false,
  hideNotificationsButton: false,
  hideSettingsButton: false,
  hideDownloadButton: false,
  alwaysShowWorkspaces: false,
  useCompactWorkspaceDrawer: false,
  hideAllServicesWorkspace: false,
  liftSingleInstanceLock: false,
  enableLongPressServiceHint: false,
  isTodosFeatureEnabled: true,
  customTodoServer: '',
  locale: 'en-US',
  keepAllWorkspacesLoaded: false,
  useSelfSignedCertificates: false,
  sandboxServices: true,
};

export const DEFAULT_SERVICE_SETTINGS = {
  isEnabled: true,
  isHibernationEnabled: false,
  isWakeUpEnabled: true,
  isNotificationEnabled: true,
  isBadgeEnabled: true,
  isMediaBadgeEnabled: false,
  trapLinkClicks: false,
  useFavicon: false,
  isMuted: false,
  customIcon: false,
  isDarkModeEnabled: false,
  isProgressbarEnabled: false,
  // Note: Do NOT change these default values. If they change, then the corresponding changes in the recipes needs to be done
  hasDirectMessages: true,
  hasIndirectMessages: false,
  hasNotificationSound: false,
  hasTeamId: false,
  hasCustomUrl: false,
  hasHostedOption: false,
  allowFavoritesDelineationInUnreadCount: false,
  disablewebsecurity: false,
  spellcheckerLanguage: false,
  onlyShowFavoritesInUnreadCount: false,
  isProxyFeatureEnabled: false,
  proxyHost: '',
  proxyPort: 0,
  proxyUser: '',
  proxyPassword: '',
  darkReaderBrightness: 100,
  darkReaderContrast: 90,
  darkReaderSepia: 10,
};

export const DEFAULT_SHORTCUTS = {
  activateNextService: 'Ctrl+tab',
  activatePreviousService: `Ctrl+${shiftKey()}+tab`,
  activateServiceUsesAlt: false,
};

// Helper function to get internationalized config objects
export const getI18nConfigObjects = (intl: any) => ({
  WEBRTC_IP_HANDLING_POLICY: {
    [defaultWebRTCIPHandlingPolicy]: intl.formatMessage(
      configMessages.webrtcExposePublicAndLocal,
    ),
    [publicWebRTCIPHandlingPolicy]: intl.formatMessage(
      configMessages.webrtcExposePublicOnly,
    ),
    [publicPrivateWebRTCIPHandlingPolicy]: intl.formatMessage(
      configMessages.webrtcExposePublicAndLocalDefaultRoute,
    ),
    [disableWebRTCIPHandlingPolicy]: intl.formatMessage(
      configMessages.webrtcDoNotExpose,
    ),
  },

  HIBERNATION_STRATEGIES: {
    10: intl.formatMessage(configMessages.hibernationExtremelyFast),
    30: intl.formatMessage(configMessages.hibernationVeryFast),
    60: intl.formatMessage(configMessages.hibernationFast),
    300: intl.formatMessage(configMessages.hibernationNormal),
    600: intl.formatMessage(configMessages.hibernationSlow),
    1800: intl.formatMessage(configMessages.hibernationVerySlow),
    3600: intl.formatMessage(configMessages.hibernationExtremelySlow),
  },

  WAKE_UP_STRATEGIES: {
    0: intl.formatMessage(configMessages.wakeUpNever),
    10: intl.formatMessage(configMessages.wakeUp10sec),
    30: intl.formatMessage(configMessages.wakeUp30sec),
    60: intl.formatMessage(configMessages.wakeUp1min),
    300: intl.formatMessage(configMessages.wakeUp5min),
    600: intl.formatMessage(configMessages.wakeUp10min),
    1800: intl.formatMessage(configMessages.wakeUp30min),
    3600: intl.formatMessage(configMessages.wakeUp1hour),
  },

  WAKE_UP_HIBERNATION_STRATEGIES: {
    0: intl.formatMessage(configMessages.wakeUpHibernationUseMain),
    10: intl.formatMessage(configMessages.hibernationExtremelyFast),
    30: intl.formatMessage(configMessages.hibernationVeryFast),
    60: intl.formatMessage(configMessages.hibernationFast),
    300: intl.formatMessage(configMessages.hibernationNormal),
    600: intl.formatMessage(configMessages.hibernationSlow),
    1800: intl.formatMessage(configMessages.hibernationVerySlow),
    3600: intl.formatMessage(configMessages.hibernationExtremelySlow),
  },

  NAVIGATION_BAR_BEHAVIOURS: {
    custom: intl.formatMessage(configMessages.navigationBarCustom),
    always: intl.formatMessage(configMessages.navigationBarAlways),
    never: intl.formatMessage(configMessages.navigationBarNever),
  },

  SIDEBAR_WIDTH: {
    35: intl.formatMessage(configMessages.sidebarExtremelySlim),
    45: intl.formatMessage(configMessages.sidebarVerySlim),
    55: intl.formatMessage(configMessages.sidebarSlim),
    68: intl.formatMessage(configMessages.sidebarNormal),
    80: intl.formatMessage(configMessages.sidebarWide),
    90: intl.formatMessage(configMessages.sidebarVeryWide),
    100: intl.formatMessage(configMessages.sidebarExtremelyWide),
  },

  SIDEBAR_SERVICES_LOCATION: {
    [SIDEBAR_SERVICES_LOCATION_TOPLEFT]: intl.formatMessage(
      configMessages.sidebarLocationTopLeft,
    ),
    [SIDEBAR_SERVICES_LOCATION_CENTER]: intl.formatMessage(
      configMessages.sidebarLocationCenter,
    ),
    [SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT]: intl.formatMessage(
      configMessages.sidebarLocationBottomRight,
    ),
  },

  ICON_SIZES: {
    0: intl.formatMessage(configMessages.iconSizeVerySmall),
    10: intl.formatMessage(configMessages.iconSizeSmall),
    20: intl.formatMessage(configMessages.iconSizeNormal),
    30: intl.formatMessage(configMessages.iconSizeLarge),
    40: intl.formatMessage(configMessages.iconSizeVeryLarge),
  },
});
