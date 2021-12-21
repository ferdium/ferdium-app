export interface FerdiStores {
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

interface Stores {
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
  local: {};
  recipePreviews: RecipePreviewsStore;
  recipes: RecipeStore;
  services: ServicesStore;
  user: UserStore;
}

interface AppStore {
  actions: Actions;
  accentColor: string;
  api: Api;
  authRequestFailed: () => void;
  autoLaunchOnStart: () => void;
  clearAppCacheRequest: () => void;
  dictionaries: [];
  fetchDataInterval: 4;
  getAppCacheSizeRequest: () => void;
  healthCheckRequest: () => void;
  isClearingAllCache: () => void;
  isFocused: () => void;
  isFullScreen: () => void;
  isOnline: () => void;
  isSystemDarkModeEnabled: () => void;
  isSystemMuteOverridden: () => void;
  locale: () => void;
  stores: Stores;
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
  _reactions: any[];
  _status: () => void;
  actionStatus: () => void;
  cacheSize: () => void;
  debugInfo: () => void;
}

interface CommunityRecipesStore {
  actions: Actions;
  stores: Stores;
  _actions: [];
  _reactions: [];
  communityRecipes: () => void;
}

interface FeaturesStore {
  actions: Actions;
  api: Api;
  defaultFeaturesRequest: () => void;
  features: () => void;
  featuresRequest: () => void;
  stores: Stores;
  _reactions: any[];
  _status: () => void;
  _updateFeatures: () => void;
  actionStatus: () => void;
  anonymousFeatures: () => void;
}

interface GlobalErrorStore {
  actions: Actions;
  api: Api;
  error: () => void;
  messages: () => void;
  response: () => void;
  stores: Stores;
  _handleRequests: () => void;
  _reactions: [];
  _status: () => void;
  actionStatus: () => void;
}

interface RecipePreviewsStore {
  actions: Actions;
  allRecipePreviewsRequest: () => void;
  api: Api;
  searchRecipePreviewsRequest: () => void;
  stores: Stores;
  _reactions: [];
  _status: () => void;
  actionStatus: () => void;
  all: () => void;
  dev: () => void;
  searchResults: () => void;
}

interface RecipeStore {
  actions: Actions;
  allRecipesRequest: () => void;
  api: Api;
  getRecipeUpdatesRequest: () => void;
  installRecipeRequest: () => void;
  stores: Stores;
  _reactions: any[];
  _status: () => void;
  actionStatus: () => void;
  active: () => void;
  all: () => void;
  recipeIdForServices: () => void;
}

interface RequestsStore {
  actions: Actions;
  api: Api;
  localServerPort: () => void;
  retries: number;
  retryDelay: number;
  servicesRequest: () => void;
  showRequiredRequestsError: () => void;
  stores: Stores;
  userInfoRequest: () => void;
  _reactions: any[];
  _status: () => void;
  actionStatus: () => void;
  areRequiredRequestsLoading: () => void;
  areRequiredRequestsSuccessful: () => void;
}

interface RouterStore {
  go: () => void;
  goBack: () => void;
  goForward: () => void;
  history: () => void;
  location: () => void;
  push: () => void;
  replace: () => void;
}

export interface ServicesStore {
  actions: Actions;
  api: Api;
  clearCacheRequest: () => void;
  createServiceRequest: () => void;
  deleteServiceRequest: () => void;
  filterNeedle: () => void;
  lastUsedServices: () => void;
  reorderServicesRequest: () => void;
  serviceMaintenanceTick: () => void;
  stores: Stores;
  updateServiceRequest: () => void;
  _reactions: any[];
  _status: () => void;
  actionStatus: () => void;
  active: () => void;
  activeSettings: () => void;
  all: () => void;
  allDisplayed: () => void;
  allDisplayedUnordered: () => void;
  enabled: () => void;
  filtered: () => void;
  isTodosServiceActive: () => void;
  isTodosServiceAdded: () => void;
}

interface SettingsStore {
  actions: Actions;
  api: Api;
  fileSystemSettingsTypes: any[];
  loaded: boolean;
  stores: Stores;
  updateAppSettingsRequest: () => void;
  _fileSystemSettingsCache: () => void;
  _reactions: [];
  _status: () => void;
  actionStatus: () => void;
  all: () => void;
  app: AppStore;
  migration: () => void;
  proxy: () => void;
  service: ServicesStore;
  stats: () => void;
}

interface TodosStore {
  actions: Actions;
  api: Api;
  isFeatureActive: () => void;
  isInitialized: true;
  stores: Stores;
  userAgentModel: () => void;
  webview: () => void;
  _actions: any[];
  _allReactions: any[];
  _firstLaunchReaction: () => void;
  _goToService: () => void;
  _handleNewWindowEvent: () => void;
  _onTodosClientInitialized: () => void;
  _openDevTools: () => void;
  _reactions: any[];
  _reload: () => void;
  _routeCheckReaction: () => void;
  _updateSettings: () => void;
  _updateTodosConfig: () => void;
  isFeatureEnabledByUser: () => void;
  isTodoUrlValid: () => void;
  isTodosPanelForceHidden: () => void;
  isTodosPanelVisible: () => void;
  isUsingPredefinedTodoServer: () => void;
  settings: () => void;
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

interface UIStore {
  actions: Actions;
  api: Api;
  isOsDarkThemeActive: () => void;
  showServicesUpdatedInfoBar: () => void;
  stores: Stores;
  _reactions: [];
  _status: () => void;
  actionStatus: () => void;
  isDarkThemeActive: () => void;
  isSplitModeActive: () => void;
  splitColumnsNo: () => void;
  showMessageBadgesEvenWhenMuted: () => void;
  theme: () => void;
}

interface UserStore {
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
  actionStatus: () => void;
  actions: Actions;
  api: Api;
  authToken: () => void;
  deleteAccountRequest: () => void;
  fetchUserInfoInterval: null;
  getLegacyServicesRequest: () => void;
  getUserInfoRequest: () => void;
  hasCompletedSignup: () => void;
  id: () => void;
  inviteRequest: () => void;
  isImportLegacyServicesCompleted: () => void;
  isImportLegacyServicesExecuting: () => void;
  isLoggingOut: () => void;
  loginRequest: () => void;
  logoutReason: () => void;
  logoutReasonTypes: { SERVER: 'SERVER' };
  passwordRequest: () => void;
  signupRequest: () => void;
  stores: Stores;
  updateUserInfoRequest: () => void;
  userData: () => void;
  _reactions: any[];
  _requireAuthenticatedUser: () => void;
  _status: () => void;
  changeServerRoute: () => void;
  data: () => void;
  importRoute: () => void;
  inviteRoute: () => void;
  isLoggedIn: () => void;
  isTokenExpired: () => void;
  legacyServices: () => void;
  loginRoute: () => void;
  logoutRoute: () => void;
  passwordRoute: () => void;
  setupRoute: () => void;
  signupRoute: () => void;
  team: () => void;
}

export interface WorkspacesStore {
  activeWorkspace: () => void;
  delete: ({ workspace }) => void;
  update: ({ workspace }) => void;
  create: ({ workspace }) => void;
  edit: ({ workspace }) => void;
  saving: boolean;
  filterServicesByActiveWorkspace: () => void;
  isFeatureActive: () => void;
  isSettingsRouteActive: () => void;
  isSwitchingWorkspace: () => void;
  isWorkspaceDrawerOpen: () => void;
  nextWorkspace: () => void;
  stores: Stores;
  workspaceBeingEdited: () => void;
  _actions: any[];
  _activateLastUsedWorkspaceReaction: () => void;
  _allActions: any[];
  _allReactions: any[];
  _cleanupInvalidServiceReferences: () => void;
  _getWorkspaceById: () => void;
  _openDrawerWithSettingsReaction: () => void;
  _reactions: any[];
  _setActiveServiceOnWorkspaceSwitchReaction: () => void;
  _setWorkspaceBeingEditedReaction: () => void;
  _toggleKeepAllWorkspacesLoadedSetting: () => void;
  _updateSettings: () => void;
  _wasDrawerOpenBeforeSettingsRoute: null;
}
