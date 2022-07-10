import { computed, observable, action, makeObservable } from 'mobx';
import localStorage from 'mobx-localstorage';
import matchRoute from '../../helpers/routing-helpers';
import workspaceActions from './actions';
import FeatureStore from '../utils/FeatureStore';
import {
  createWorkspaceRequest,
  deleteWorkspaceRequest,
  getUserWorkspacesRequest,
  updateWorkspaceRequest,
} from './api';
import { WORKSPACES_ROUTES } from './constants';
import { createReactions } from '../../stores/lib/Reaction';
import { createActionBindings } from '../utils/ActionBinding';

import { KEEP_WS_LOADED_USID } from '../../config';

const debug = require('../../preload-safe-debug')('Ferdium:feature:workspaces:store');

export default class WorkspacesStore extends FeatureStore {
  @observable isFeatureActive = false;

  @observable activeWorkspace = null;

  @observable nextWorkspace = null;

  @observable workspaceBeingEdited = null;

  @observable isSwitchingWorkspace = false;

  @observable isWorkspaceDrawerOpen = false;

  @observable isSettingsRouteActive = null;

  constructor() {
    super();

    makeObservable(this);
  }

  @computed get workspaces() {
    if (!this.isFeatureActive) return [];
    return getUserWorkspacesRequest.result || [];
  }

  @computed get isLoadingWorkspaces() {
    if (!this.isFeatureActive) return false;
    return getUserWorkspacesRequest.isExecutingFirstTime;
  }

  @computed get settings() {
    return localStorage.getItem('workspaces') || {};
  }

  @computed get userHasWorkspaces() {
    return getUserWorkspacesRequest.wasExecuted && this.workspaces.length > 0;
  }

  @computed get isUserAllowedToUseFeature() {
    return true;
  }

  @computed get isAnyWorkspaceActive() {
    return !!this.activeWorkspace;
  }

  // ========== PRIVATE PROPERTIES ========= //

  _wasDrawerOpenBeforeSettingsRoute = null;

  _allActions = [];

  _allReactions = [];

  // ========== PUBLIC API ========= //

  @action start(stores, actions) {
    debug('WorkspacesStore::start');
    this.stores = stores;
    this.actions = actions;

    // ACTIONS

    this._allActions = createActionBindings([
      [workspaceActions.toggleWorkspaceDrawer, this._toggleWorkspaceDrawer],
      [workspaceActions.openWorkspaceSettings, this._openWorkspaceSettings],
      [workspaceActions.edit, this._edit],
      [workspaceActions.create, this._create],
      [workspaceActions.delete, this._delete],
      [workspaceActions.update, this._update],
      [workspaceActions.activate, this._setActiveWorkspace],
      [workspaceActions.deactivate, this._deactivateActiveWorkspace],
      [
        workspaceActions.toggleKeepAllWorkspacesLoadedSetting,
        this._toggleKeepAllWorkspacesLoadedSetting,
      ],
    ]);
    this._registerActions(this._allActions);

    // REACTIONS

    this._allReactions = createReactions([
      this._openDrawerWithSettingsReaction,
      this._cleanupInvalidServiceReferences,
      this._setActiveServiceOnWorkspaceSwitchReaction,
      this._activateLastUsedWorkspaceReaction,
      this._setWorkspaceBeingEditedReaction,
    ]);
    this._registerReactions(this._allReactions);

    this.isFeatureActive = true;
  }

  @action reset() {
    this.activeWorkspace = null;
    this.nextWorkspace = null;
    this.workspaceBeingEdited = null;
    this.isSwitchingWorkspace = false;
    this.isWorkspaceDrawerOpen = false;
  }

  @action stop() {
    super.stop();
    debug('WorkspacesStore::stop');
    this.reset();
    this.isFeatureActive = false;
  }

  filterServicesByActiveWorkspace = services => {
    const { activeWorkspace, isFeatureActive } = this;
    if (isFeatureActive && activeWorkspace) {
      return this.getWorkspaceServices(activeWorkspace);
    }
    return services;
  };

  getWorkspaceServices(workspace) {
    const { services } = this.stores;
    return workspace.services.map(id => services.one(id)).filter(s => !!s);
  }

  // ========== PRIVATE METHODS ========= //

  _getWorkspaceById = id => this.workspaces.find(w => w.id === id);

  _updateSettings = changes => {
    localStorage.setItem('workspaces', {
      ...this.settings,
      ...changes,
    });
  };

  // Actions

  @action _edit = ({ workspace }) => {
    this.stores.router.push(`/settings/workspaces/edit/${workspace.id}`);
  };

  @action _create = async ({ name }) => {
    const workspace = await createWorkspaceRequest.execute(name);
    await getUserWorkspacesRequest.result.push(workspace);
    this._edit({ workspace });
  };

  @action _delete = async ({ workspace }) => {
    await deleteWorkspaceRequest.execute(workspace);
    await getUserWorkspacesRequest.result.remove(workspace);
    this.stores.router.push('/settings/workspaces');
    if (this.activeWorkspace === workspace) {
      this._deactivateActiveWorkspace();
    }
  };

  @action _update = async ({ workspace }) => {
    await updateWorkspaceRequest.execute(workspace);
    // Path local result optimistically
    const localWorkspace = this._getWorkspaceById(workspace.id);
    Object.assign(localWorkspace, workspace);
    this.stores.router.push('/settings/workspaces');
  };

  @action _setActiveWorkspace = ({ workspace }) => {
    // Indicate that we are switching to another workspace
    this.isSwitchingWorkspace = true;
    this.nextWorkspace = workspace;
    // Delay switching to next workspace so that the services loading does not drag down UI
    setTimeout(() => {
      this.activeWorkspace = workspace;
      this._updateSettings({ lastActiveWorkspace: workspace.id });
    }, 100);
    // Indicate that we are done switching to the next workspace
    setTimeout(() => {
      this.isSwitchingWorkspace = false;
      this.nextWorkspace = null;
      if (this.stores.settings.app.splitMode) {
        const serviceNames = new Set(
          this.getWorkspaceServices(workspace).map(service => service.name),
        );
        for (const wrapper of document.querySelectorAll(
          '.services__webview-wrapper',
        )) {
          wrapper.style.display = serviceNames.has(wrapper.dataset.name)
            ? ''
            : 'none';
        }
      }
    }, 500);
  };

  @action _deactivateActiveWorkspace = () => {
    // Indicate that we are switching to default workspace
    this.isSwitchingWorkspace = true;
    this.nextWorkspace = null;
    this._updateSettings({ lastActiveWorkspace: null });
    // Delay switching to next workspace so that the services loading does not drag down UI
    setTimeout(() => {
      this.activeWorkspace = null;
    }, 100);
    // Indicate that we are done switching to the default workspace
    setTimeout(() => {
      this.isSwitchingWorkspace = false;
      if (this.stores.settings.app.splitMode) {
        for (const wrapper of document.querySelectorAll(
          '.services__webview-wrapper',
        )) {
          wrapper.style.display = '';
        }
      }
    }, 500);
  };

  @action _toggleWorkspaceDrawer = () => {
    this.isWorkspaceDrawerOpen = !this.isWorkspaceDrawerOpen;
  };

  @action _openWorkspaceSettings = () => {
    this.actions.ui.openSettings({ path: 'workspaces' });
  };

  @action reorderServicesOfActiveWorkspace = async ({ oldIndex, newIndex }) => {
    const { activeWorkspace } = this;
    const { services } = activeWorkspace;
    // Move services from the old to the new position
    services.splice(newIndex, 0, services.splice(oldIndex, 1)[0]);
    await updateWorkspaceRequest.execute(activeWorkspace);
  };

  _toggleKeepAllWorkspacesLoadedSetting = async () => {
    this._updateSettings({
      keepAllWorkspacesLoaded: !this.settings.keepAllWorkspacesLoaded,
    });
  };

  // Reactions

  _setWorkspaceBeingEditedReaction = () => {
    const { pathname } = this.stores.router.location;
    const match = matchRoute('/settings/workspaces/edit/:id', pathname);
    if (match) {
      this.workspaceBeingEdited = this._getWorkspaceById(match.id);
    }
  };

  _setActiveServiceOnWorkspaceSwitchReaction = () => {
    if (!this.isFeatureActive) return;
    if (this.activeWorkspace) {
      const activeService = this.stores.services.active;
      const workspaceServices = this.getWorkspaceServices(this.activeWorkspace);
      if (workspaceServices.length <= 0) return;
      const isActiveServiceInWorkspace =
        workspaceServices.includes(activeService);
      if (!isActiveServiceInWorkspace) {
        this.actions.service.setActive({
          serviceId: workspaceServices[0].id,
          keepActiveRoute: true,
        });
      }
    }
  };

  _activateLastUsedWorkspaceReaction = () => {
    debug('_activateLastUsedWorkspaceReaction');
    if (!this.activeWorkspace && this.userHasWorkspaces) {
      const { lastActiveWorkspace } = this.settings;
      if (lastActiveWorkspace) {
        const workspace = this._getWorkspaceById(lastActiveWorkspace);
        if (workspace) this._setActiveWorkspace({ workspace });
      }
    }
  };

  _openDrawerWithSettingsReaction = () => {
    const { router } = this.stores;
    const isWorkspaceSettingsRoute = router.location.pathname.includes(
      WORKSPACES_ROUTES.ROOT,
    );
    const isSwitchingToSettingsRoute =
      !this.isSettingsRouteActive && isWorkspaceSettingsRoute;
    const isLeavingSettingsRoute =
      !isWorkspaceSettingsRoute && this.isSettingsRouteActive;

    if (isSwitchingToSettingsRoute) {
      this.isSettingsRouteActive = true;
      this._wasDrawerOpenBeforeSettingsRoute = this.isWorkspaceDrawerOpen;
      if (!this._wasDrawerOpenBeforeSettingsRoute) {
        workspaceActions.toggleWorkspaceDrawer();
      }
    } else if (isLeavingSettingsRoute) {
      this.isSettingsRouteActive = false;
      if (
        !this._wasDrawerOpenBeforeSettingsRoute &&
        this.isWorkspaceDrawerOpen
      ) {
        workspaceActions.toggleWorkspaceDrawer();
      }
    }
  };

  _cleanupInvalidServiceReferences = () => {
    const { services } = this.stores;
    const { allServicesRequest } = services;
    const servicesHaveBeenLoaded =
      allServicesRequest.wasExecuted && !allServicesRequest.isError;
    // Loop through all workspaces and remove invalid service ids (locally)
    for (const workspace of this.workspaces) {
      for (const serviceId of workspace.services) {
        if (
          servicesHaveBeenLoaded &&
          !services.one(serviceId) &&
          serviceId !== KEEP_WS_LOADED_USID
        ) {
          workspace.services.remove(serviceId);
        }
      }
    }
  };
}
