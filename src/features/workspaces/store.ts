import { action, computed, makeObservable, observable } from 'mobx';
import localStorage from 'mobx-localstorage';
import matchRoute from '../../helpers/routing-helpers';
import { createReactions } from '../../stores/lib/Reaction';
import { createActionBindings } from '../utils/ActionBinding';
import FeatureStore from '../utils/FeatureStore';
import workspaceActions from './actions';
import {
  createWorkspaceRequest,
  deleteWorkspaceRequest,
  getUserWorkspacesRequest,
  updateWorkspaceRequest,
} from './api';
import { WORKSPACES_ROUTES } from './constants';

import type { Actions } from '../../actions/lib/actions';
import { KEEP_WS_LOADED_USID } from '../../config';
import type Workspace from './models/Workspace';

const debug = require('../../preload-safe-debug')(
  'Ferdium:feature:workspaces:store',
);

export default class WorkspacesStore extends FeatureStore {
  @observable isFeatureActive = false;

  @observable activeWorkspace: Workspace | undefined;

  @observable nextWorkspace: Workspace | undefined;

  @observable workspaceBeingEdited: any = null; // TODO: [TS DEBT] fix type later

  @observable isSwitchingWorkspace = false;

  @observable isWorkspaceDrawerOpen = false;

  @observable isSettingsRouteActive = false;

  stores: any; // TODO: [TS DEBT] fix type later

  actions: Actions | undefined;

  constructor() {
    super();

    makeObservable(this);
  }

  @computed get workspaces() {
    if (!this.isFeatureActive) return [];
    return getUserWorkspacesRequest.result || [];
  }

  @computed get settings() {
    return localStorage.getItem('workspaces') || {};
  }

  @computed get userHasWorkspaces() {
    return getUserWorkspacesRequest.wasExecuted && this.workspaces.length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  @computed get isUserAllowedToUseFeature() {
    return true;
  }

  @computed get isAnyWorkspaceActive() {
    return !!this.activeWorkspace;
  }

  // ========== PRIVATE PROPERTIES ========= //

  _wasDrawerOpenBeforeSettingsRoute = false;

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
      [workspaceActions.activate, this._setActivateWorkspace],
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
    this._setActiveWorkspace(null);
    this._setNextWorkspace(null);
    this.workspaceBeingEdited = null;
    this._setIsSwitchingWorkspace(false);
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
    const workspace = await createWorkspaceRequest.execute(name).promise;
    await getUserWorkspacesRequest.result.push(workspace);
    this._edit({ workspace });
  };

  @action _delete = async ({ workspace }) => {
    await deleteWorkspaceRequest.execute(workspace).promise;
    await getUserWorkspacesRequest.result.remove(workspace);
    this.stores.router.push('/settings/workspaces');
    if (this.activeWorkspace === workspace) {
      this._deactivateActiveWorkspace();
    }
  };

  @action _update = async ({ workspace }) => {
    await updateWorkspaceRequest.execute(workspace).promise;
    // Path local result optimistically
    const localWorkspace = this._getWorkspaceById(workspace.id);
    Object.assign(localWorkspace, workspace);
    this.stores.router.push('/settings/workspaces');
  };

  @action _setNextWorkspace(workspace) {
    this.nextWorkspace = workspace;
  }

  @action _setIsSwitchingWorkspace(bool) {
    this.isSwitchingWorkspace = bool;
  }

  @action _setActiveWorkspace(workspace) {
    this.activeWorkspace = workspace;
  }

  @action _setActivateWorkspace = ({ workspace }) => {
    // Indicate that we are switching to another workspace
    this._setIsSwitchingWorkspace(true);
    this._setNextWorkspace(workspace);
    // Delay switching to next workspace so that the services loading does not drag down UI
    setTimeout(() => {
      this._setActiveWorkspace(workspace);
      this._updateSettings({ lastActiveWorkspace: workspace.id });
    }, 100);
    // Indicate that we are done switching to the next workspace
    setTimeout(() => {
      this._setIsSwitchingWorkspace(false);
      this._setNextWorkspace(null);
      if (this.stores.settings.app.splitMode) {
        const serviceNames = new Set(
          this.getWorkspaceServices(workspace).map(service => service.name),
        );
        for (const wrapper of document.querySelectorAll<HTMLDivElement>(
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
    this._setIsSwitchingWorkspace(true);
    this._setNextWorkspace(null);
    this._updateSettings({ lastActiveWorkspace: null });
    // Delay switching to next workspace so that the services loading does not drag down UI
    setTimeout(() => {
      this._setActiveWorkspace(null);
    }, 100);
    // Indicate that we are done switching to the default workspace
    setTimeout(() => {
      this._setIsSwitchingWorkspace(false);
      if (this.stores.settings.app.splitMode) {
        for (const wrapper of document.querySelectorAll<HTMLDivElement>(
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
    if (!this.actions) {
      return;
    }
    this.actions.ui.openSettings({ path: 'workspaces' });
  };

  @action reorderServicesOfActiveWorkspace = async ({ oldIndex, newIndex }) => {
    if (!this.activeWorkspace) {
      return;
    }

    const { services = [] } = this.activeWorkspace;
    // Move services from the old to the new position
    services.splice(newIndex, 0, services.splice(oldIndex, 1)[0]);
    await updateWorkspaceRequest.execute(this.activeWorkspace).promise;
  };

  @action _setOpenDrawerWithSettings() {
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
  }

  @action _setWorkspaceBeingEdited(match) {
    this.workspaceBeingEdited = this._getWorkspaceById(match.id);
  }

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
      this._setWorkspaceBeingEdited(match);
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
      if (!isActiveServiceInWorkspace && this.actions) {
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
        if (workspace) this._setActivateWorkspace({ workspace });
      }
    }
  };

  _openDrawerWithSettingsReaction = () => {
    this._setOpenDrawerWithSettings();
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
