import { computed, action, observable, makeObservable } from 'mobx';
import localStorage from 'mobx-localstorage';

import { ThemeType } from '../../themes';
import { todoActions } from './actions';
import {
  CUSTOM_TODO_SERVICE,
  TODO_SERVICE_RECIPE_IDS,
  DEFAULT_TODOS_WIDTH,
  TODOS_MIN_WIDTH,
  DEFAULT_TODOS_VISIBLE,
  DEFAULT_IS_TODO_FEATURE_ENABLED_BY_USER,
} from '../../config';
import { isValidExternalURL } from '../../helpers/url-helpers';
import FeatureStore from '../utils/FeatureStore';
import { createReactions } from '../../stores/lib/Reaction';
import { createActionBindings } from '../utils/ActionBinding';
import { IPC, TODOS_ROUTES } from './constants';
import UserAgent from '../../models/UserAgent';

const debug = require('../../preload-safe-debug')(
  'Ferdium:feature:todos:store',
);

export default class TodoStore extends FeatureStore {
  @observable stores = null;

  @observable isFeatureActive = false;

  @observable webview = null;

  @observable userAgentModel = new UserAgent();

  isInitialized = false;

  constructor() {
    super();

    makeObservable(this);
  }

  @computed get width() {
    const width = this.settings.width || DEFAULT_TODOS_WIDTH;

    return width < TODOS_MIN_WIDTH ? TODOS_MIN_WIDTH : width;
  }

  @computed get isTodosPanelForceHidden() {
    return !this.isFeatureEnabledByUser;
  }

  @computed get isTodosPanelVisible() {
    if (this.settings.isTodosPanelVisible === undefined) {
      return DEFAULT_TODOS_VISIBLE;
    }
    return this.settings.isTodosPanelVisible;
  }

  @computed get isFeatureEnabledByUser() {
    return this.settings.isFeatureEnabledByUser;
  }

  @computed get settings() {
    return localStorage.getItem('todos') || {};
  }

  @computed get userAgent() {
    return this.userAgentModel.userAgent;
  }

  @computed get isUsingPredefinedTodoServer() {
    return (
      this.stores &&
      this.stores.settings.app.predefinedTodoServer !== CUSTOM_TODO_SERVICE
    );
  }

  @computed get todoUrl() {
    if (!this.stores) {
      return null;
    }
    return this.isUsingPredefinedTodoServer
      ? this.stores.settings.app.predefinedTodoServer
      : this.stores.settings.app.customTodoServer;
  }

  @computed get isTodoUrlValid() {
    return (
      !this.isUsingPredefinedTodoServer || isValidExternalURL(this.todoUrl)
    );
  }

  @computed get todoRecipeId() {
    if (
      this.isFeatureEnabledByUser &&
      this.isUsingPredefinedTodoServer &&
      this.todoUrl in TODO_SERVICE_RECIPE_IDS
    ) {
      return TODO_SERVICE_RECIPE_IDS[this.todoUrl];
    }
    return null;
  }

  // ========== PUBLIC API ========= //

  @action start(stores, actions) {
    debug('TodoStore::start');
    this.stores = stores;
    this.actions = actions;

    // ACTIONS

    this._registerActions(
      createActionBindings([
        [todoActions.resize, this._resize],
        [todoActions.toggleTodosPanel, this._toggleTodosPanel],
        [todoActions.setTodosWebview, this._setTodosWebview],
        [todoActions.handleHostMessage, this._handleHostMessage],
        [todoActions.handleClientMessage, this._handleClientMessage],
        [
          todoActions.toggleTodosFeatureVisibility,
          this._toggleTodosFeatureVisibility,
        ],
        [todoActions.openDevTools, this._openDevTools],
        [todoActions.reload, this._reload],
      ]),
    );

    // REACTIONS

    this._allReactions = createReactions([
      this._updateTodosConfig,
      this._firstLaunchReaction,
      this._routeCheckReaction,
    ]);

    this._registerReactions(this._allReactions);

    this.isFeatureActive = true;
  }

  @action stop() {
    super.stop();
    debug('TodoStore::stop');
    this.reset();
    this.isFeatureActive = false;
  }

  // ========== PRIVATE METHODS ========= //

  _updateSettings = changes => {
    localStorage.setItem('todos', {
      ...this.settings,
      ...changes,
    });
  };

  // Actions

  @action _resize = ({ width }) => {
    this._updateSettings({
      width,
    });
  };

  @action _toggleTodosPanel = () => {
    this._updateSettings({
      isTodosPanelVisible: !this.isTodosPanelVisible,
    });
  };

  @action _setTodosWebview = ({ webview }) => {
    debug('_setTodosWebview', webview);
    if (this.webview !== webview) {
      this.webview = webview;
      this.userAgentModel.setWebviewReference(webview);
    }
  };

  @action _handleHostMessage = message => {
    debug('_handleHostMessage', message);
    if (message.action === 'todos:create') {
      this.webview.send(IPC.TODOS_HOST_CHANNEL, message);
    }
  };

  @action _handleClientMessage = ({ channel, message = {} }) => {
    debug('_handleClientMessage', channel, message);
    switch (message.action) {
      case 'todos:initialized':
        this._onTodosClientInitialized();
        break;
      case 'todos:goToService':
        this._goToService(message.data);
        break;
      default:
        debug('Other message received', channel, message);
        if (this.stores.services.isTodosServiceAdded) {
          this.actions.service.handleIPCMessage({
            serviceId: this.stores.services.isTodosServiceAdded.id,
            channel,
            args: message,
          });
        }
    }
  };

  _handleNewWindowEvent = ({ url }) => {
    this.actions.app.openExternalUrl({ url });
  };

  @action _toggleTodosFeatureVisibility = () => {
    debug('_toggleTodosFeatureVisibility');

    const isFeatureEnabled = !this.settings.isFeatureEnabledByUser;
    this._updateSettings({
      isFeatureEnabledByUser: isFeatureEnabled,
      isTodosPanelVisible: isFeatureEnabled,
    });
  };

  _openDevTools = () => {
    debug('_openDevTools');

    const webview = document.querySelector('#todos-panel webview');
    if (webview) webview.openDevTools();
  };

  _reload = () => {
    debug('_reload');

    const webview = document.querySelector('#todos-panel webview');
    if (webview) webview.reload();
  };

  // Todos client message handlers

  _onTodosClientInitialized = async () => {
    const { authToken } = this.stores.user;
    const { isDarkThemeActive } = this.stores.ui;
    const { locale } = this.stores.app;
    if (!this.webview) return;
    await this.webview.send(IPC.TODOS_HOST_CHANNEL, {
      action: 'todos:configure',
      data: {
        authToken,
        locale,
        theme: isDarkThemeActive ? ThemeType.dark : ThemeType.default,
      },
    });

    if (!this.isInitialized) {
      this.webview.addEventListener('new-window', this._handleNewWindowEvent);

      this.isInitialized = true;
    }
  };

  _goToService = ({ url, serviceId }) => {
    if (url) {
      this.stores.services.one(serviceId).webview.loadURL(url);
    }
    this.actions.service.setActive({ serviceId });
  };

  // Reactions

  _updateTodosConfig = () => {
    // Resend the config if any part changes in Franz:
    this._onTodosClientInitialized();
  };

  _firstLaunchReaction = () => {
    const { stats } = this.stores.settings.all;

    if (this.settings.isFeatureEnabledByUser === undefined) {
      this._updateSettings({
        isFeatureEnabledByUser: DEFAULT_IS_TODO_FEATURE_ENABLED_BY_USER,
      });
    }

    // Hide todos layer on first app start but show on second
    if (stats.appStarts <= 1) {
      this._updateSettings({
        isTodosPanelVisible: false,
      });
    } else if (stats.appStarts <= 2) {
      this._updateSettings({
        isTodosPanelVisible: true,
      });
    }
  };

  _routeCheckReaction = () => {
    const { pathname } = this.stores.router.location;

    if (pathname === TODOS_ROUTES.TARGET) {
      debug('Router is on todos route, show todos panel');
      // todosStore.start(stores, actions);
      this.stores.router.push('/');

      if (!this.isTodosPanelVisible) {
        this._updateSettings({
          isTodosPanelVisible: true,
        });
      }
    }
  };
}
