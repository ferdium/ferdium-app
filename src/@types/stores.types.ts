/* eslint-disable no-use-before-define */
import Workspace from '../features/workspaces/models/Workspace';
import Recipe from '../models/Recipe';
import Service from '../models/Service';
import User from '../models/User';
import Request from '../stores/lib/Request';
import CachedRequest from '../stores/lib/CachedRequest';
import Reaction from '../stores/lib/Reaction';

// TODO: This file will be removed in the future when all stores are
// correctly typed and the use of these interfaces are obsolete.

export interface FerdiumStores {
  app: AppStore;
  communityRecipes: CommunityRecipesStore;
  features: FeaturesStore;
  globalError: GlobalErrorStore;
  recipePreviews: RecipePreviewsStore;
  recipes: RecipeStore;
  requests: RequestsStore;
  router: RouterStore;
  services: ServicesStore;
  settings: SettingsStore;
  todos: TodosStore;
  ui: UIStore;
  user: UserStore;
  workspaces: WorkspacesStore;
}

export interface Stores {
  app: AppStore;
  communityRecipes: CommunityRecipesStore;
  features: FeaturesStore;
  globalError: GlobalErrorStore;
  recipePreviews: RecipePreviewsStore;
  recipes: RecipeStore;
  requests: RequestsStore;
  router: RouterStore;
  services: ServicesStore;
  settings: SettingsStore;
  todos: TodosStore;
  ui: UIStore;
  user: UserStore;
  workspaces: WorkspacesStore;
}

interface Actions {
  app: AppStore;
  recipePreviews: RecipePreviewsStore;
  recipes: RecipeStore;
  requests: RequestsStore;
  services: ServicesStore;
  settings: SettingsStore;
  todos: TodosStore;
  ui: UIStore;
  user: UserStore;
  workspaces: WorkspacesStore;
}

interface Api {
  app: AppStore;
  features: FeaturesStore;
  // eslint-disable-next-line @typescript-eslint/ban-types
  local: {};
  recipePreviews: RecipePreviewsStore;
  recipes: RecipeStore;
  services: ServicesStore;
  user: UserStore;
}

interface TypedStore {
  actions: Actions;
  api: Api;
  stores: Stores;
  _reactions: Reaction[];
  _status: any;
  actionStatus: () => void;
  initialize: () => void;
  tearDown: () => void;
  resetStatus: () => void;
}

export interface AppStore extends TypedStore {
  accentColor: string;
  adaptableDarkMode: boolean;
  progressbarAccentColor: string;
  authRequestFailed: () => void;
  autoLaunchOnStart: () => void;
  automaticUpdates: boolean;
  clearAppCacheRequest: () => void;
  clipboardNotifications: boolean;
  darkMode: boolean;
  enableSpellchecking: boolean;
  enableTranslator: boolean;
  fetchDataInterval: 4;
  get(key: string): any;
  getAppCacheSizeRequest: () => void;
  healthCheckRequest: () => void;
  isClearingAllCache: () => void;
  isAppMuted: boolean;
  isFocused: () => void;
  isFullScreen: () => void;
  isOnline: boolean;
  isSystemDarkModeEnabled: () => void;
  isSystemMuteOverridden: () => void;
  locale: string;
  lockedPassword: string;
  reloadAfterResume: boolean;
  reloadAfterResumeTime: number;
  searchEngine: string;
  translatorEngine: string;
  translatorLanguage: string;
  spellcheckerLanguage: string;
  splitMode: boolean;
  splitColumns: number;
  timeOfflineStart: () => void;
  timeSuspensionStart: () => void;
  updateStatus: () => void;
  updateStatusTypes: {
    CHECKING: 'CHECKING';
    AVAILABLE: 'AVAILABLE';
    NOT_AVAILABLE: 'NOT_AVAILABLE';
    DOWNLOADED: 'DOWNLOADED';
    FAILED: 'FAILED';
  };
  universalDarkMode: boolean;
  isDownloading: () => boolean;
  cacheSize: () => void;
  debugInfo: () => void;
  enableLongPressServiceHint: boolean;
}

interface CommunityRecipesStore extends TypedStore {
  communityRecipes: () => void;
}

interface FeaturesStore extends TypedStore {
  anonymousFeatures: () => void;
  defaultFeaturesRequest: () => void;
  features: () => void;
  featuresRequest: CachedRequest;
  _monitorLoginStatus: () => void;
  _updateFeatures: () => void;
  _setupFeatures: () => void;
}

interface GlobalErrorStore extends TypedStore {
  error: () => void;
  messages: () => void;
  response: () => void;
  _handleRequests: () => void;
}

interface RecipePreviewsStore extends TypedStore {
  allRecipePreviewsRequest: () => void;
  searchRecipePreviewsRequest: () => void;
  all: Recipe[];
  dev: Recipe[];
  searchResults: () => void;
}

interface RecipeStore extends TypedStore {
  allRecipesRequest: () => void;
  getRecipeUpdatesRequest: () => void;
  installRecipeRequest: () => void;
  isInstalled: (id: string) => boolean;
  active: () => void;
  all: Recipe[];
  one: (id: string) => Recipe;
  recipeIdForServices: () => void;
  _install({ recipeId }): Promise<Recipe>;
}

interface RequestsStore extends TypedStore {
  localServerPort: number;
  localServerToken: string | undefined;
  retries: number;
  retryDelay: number;
  servicesRequest: () => void;
  showRequiredRequestsError: () => void;
  userInfoRequest: () => void;
  areRequiredRequestsLoading: () => void;
  areRequiredRequestsSuccessful: () => void;
}

interface RouterStore {
  go: () => void;
  goBack: () => void;
  goForward: () => void;
  history: () => void;
  location: {
    pathname: string;
    search: string;
    action: string;
    key: string;
    state: any;
    query: any;
    hash?: string;
    basename?: string;
  };
  push(path: string): void;
  replace: () => void;
}

interface ServicesStore extends TypedStore {
  clearCacheRequest: () => void;
  createServiceRequest: CachedRequest;
  deleteServiceRequest: () => void;
  allServicesRequest: CachedRequest;
  filterNeedle: string;
  lastUsedServices: () => void;
  reorderServicesRequest: () => void;
  serviceMaintenanceTick: () => void;
  updateServiceRequest: () => void;
  active: () => void;
  activeSettings: () => void;
  all: Service[];
  allDisplayed: () => void;
  allDisplayedUnordered: () => void;
  enabled: () => void;
  filtered: () => void;
  isTodosServiceActive: () => void;
  isTodosServiceAdded: () => void;
}

// TODO: Create actual type based on the default config in config.ts
interface ISettings {
  [key: string]: any;
}

interface SettingsStore extends TypedStore {
  update: (value: any) => void;
  remove: (value: any) => void;
  fileSystemSettingsTypes: any[];
  loaded: boolean;
  _fileSystemSettingsCache: () => void;
  all: ISettings;
  app: AppStore;
  migration: () => void;
  proxy: () => void;
  service: ServicesStore;
  stats: () => void;
}

interface TodosStore extends TypedStore {
  isFeatureActive: () => void;
  isInitialized: true;
  userAgentModel: () => void;
  webview: () => void;
  _allReactions: any[];
  _firstLaunchReaction: () => void;
  _goToService: () => void;
  _handleNewWindowEvent: () => void;
  _onTodosClientInitialized: () => void;
  _openDevTools: () => void;
  _reload: () => void;
  _routeCheckReaction: () => void;
  _updateSettings: () => void;
  _updateTodosConfig: () => void;
  isFeatureEnabledByUser: () => void;
  isTodoUrlValid: () => void;
  isTodosPanelForceHidden: () => void;
  isTodosEnabled: boolean;
  isTodosPanelVisible: () => void;
  isUsingPredefinedTodoServer: () => void;
  settings: {
    isFeatureEnabledByUser: boolean;
  };
  todoRecipeId: () => void;
  todoUrl: () => void;
  userAgent: () => void;
  width: () => void;
  _handleClientMessage: () => void;
  _handleHostMessage: () => void;
  _resize: () => void;
  _setTodosWebview: () => void;
  _toggleTodosFeatureVisibility: () => void;
  _toggleTodosPanel: () => void;
}

interface UIStore extends TypedStore {
  isOsDarkThemeActive: () => void;
  showServicesUpdatedInfoBar: boolean;
  isDarkThemeActive: () => void;
  isSplitModeActive: () => void;
  splitColumnsNo: () => void;
  showMessageBadgesEvenWhenMuted: boolean;
  theme: () => void;
}

interface UserStore extends TypedStore {
  BASE_ROUTE: '/auth';
  CHANGE_SERVER_ROUTE: '/auth/server';
  IMPORT_ROUTE: '/auth/signup/import';
  INVITE_ROUTE: '/auth/signup/invite';
  LOGIN_ROUTE: '/auth/login';
  LOGOUT_ROUTE: '/auth/logout';
  PASSWORD_ROUTE: '/auth/password';
  SETUP_ROUTE: '/auth/signup/setup';
  SIGNUP_ROUTE: '/auth/signup';
  WELCOME_ROUTE: '/auth/welcome';
  accountType: () => void;
  authToken: () => void;
  deleteAccountRequest: () => void;
  getLegacyServicesRequest: () => void;
  getUserInfoRequest: CachedRequest;
  hasCompletedSignup: () => void;
  id: () => void;
  importLegacyServices: () => Promise<void>;
  inviteRequest: () => void;
  isImportLegacyServicesCompleted: boolean;
  isImportLegacyServicesExecuting: boolean;
  isLoggingOut: () => void;
  loginRequest: () => void;
  logoutReason: () => void;
  logoutReasonTypes: { SERVER: 'SERVER' };
  passwordRequest: Request;
  retrievePassword: Promise<void>;
  signupRequest: () => void;
  updateUserInfoRequest: () => void;
  userData: () => void;
  _requireAuthenticatedUser: () => void;
  _importLegacyServices: () => void;
  _retrievePassword: () => void;
  changeServerRoute: () => void;
  data: User;
  isLoggedIn: boolean;
  isTokenExpired: boolean;
  loginRoute: string;
  passwordRoute: string;
  signupRoute: string;
  team: () => void;
}

interface WorkspacesStore extends TypedStore {
  activeWorkspace: () => void;
  delete: ({ workspace }) => void;
  update: ({ workspace }) => void;
  create: ({ workspace }) => void;
  edit: ({ workspace }) => void;
  saving: boolean;
  filterServicesByActiveWorkspace: (services: Service[]) => Service[];
  isFeatureActive: () => void;
  isAnyWorkspaceActive: boolean;
  isSettingsRouteActive: () => void;
  isSwitchingWorkspace: () => void;
  isWorkspaceDrawerOpen: () => void;
  nextWorkspace: () => void;
  workspaces: Workspace[];
  workspaceBeingEdited: () => void;
  reorderServicesOfActiveWorkspace: ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: string;
    newIndex: string;
  }) => void;
  settings: any;
  _activateLastUsedWorkspaceReaction: () => void;
  _allActions: any[];
  _allReactions: any[];
  _cleanupInvalidServiceReferences: () => void;
  _getWorkspaceById: () => void;
  _openDrawerWithSettingsReaction: () => void;
  _setActiveServiceOnWorkspaceSwitchReaction: () => void;
  _setWorkspaceBeingEditedReaction: () => void;
  _toggleKeepAllWorkspacesLoadedSetting: () => void;
  _updateSettings: () => void;
  _wasDrawerOpenBeforeSettingsRoute: null;
}
