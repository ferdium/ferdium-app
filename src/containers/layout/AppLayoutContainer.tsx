import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { ThemeProvider } from 'react-jss';
import { Route, Routes } from 'react-router-dom';

import { StoresProps } from '../../@types/ferdium-components.types';
import WorkspacesScreen from '../../features/workspaces/containers/WorkspacesScreen';
import { WORKSPACES_ROUTES } from '../../features/workspaces/constants';
import EditWorkspaceScreen from '../../features/workspaces/containers/EditWorkspaceScreen';
import AppLayout from '../../components/layout/AppLayout';
import Sidebar from '../../components/layout/Sidebar';
import Services from '../../components/services/content/Services';
import AppLoader from '../../components/ui/AppLoader';
import WorkspaceDrawer from '../../features/workspaces/components/WorkspaceDrawer';
import { workspaceStore } from '../../features/workspaces';
import SettingsWindow from '../settings/SettingsWindow';
import RecipesScreen from '../settings/RecipesScreen';
import EditUserScreen from '../settings/EditUserScreen';
import AccountScreen from '../settings/AccountScreen';
import EditServiceScreen from '../settings/EditServiceScreen';
import EditSettingsScreen from '../settings/EditSettingsScreen';
import InviteSettingsScreen from '../settings/InviteScreen';
import SupportFerdiumScreen from '../settings/SupportScreen';
import ServicesScreen from '../settings/ServicesScreen';
import TeamScreen from '../settings/TeamScreen';

interface AppLayoutContainerProps extends StoresProps {}

class AppLayoutContainer extends Component<AppLayoutContainerProps> {
  render(): ReactElement {
    const {
      app,
      features,
      services,
      ui,
      settings,
      globalError,
      requests,
      user,
      router,
    } = this.props.stores;

    /* HOTFIX for:
      [mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: 'Reaction[bound ]' TypeError: Cannot read properties of null (reading 'push')
      at RouterStore.push (store.js:25)
      at UserStore._requireAuthenticatedUser
    */
    if (!user.isLoggedIn) {
      router.push('/auth/welcome');
    }

    const {
      setActive,
      handleIPCMessage,
      setWebviewReference,
      detachService,
      openWindow,
      reorder,
      reload,
      toggleNotifications,
      toggleAudio,
      toggleDarkMode,
      deleteService,
      updateService,
      hibernate,
      awake,
    } = this.props.actions.service;

    const { retryRequiredRequests } = this.props.actions.requests;

    const { installUpdate, toggleMuteApp, toggleCollapseMenu } =
      this.props.actions.app;

    const { openSettings, closeSettings } = this.props.actions.ui;

    const isLoadingFeatures =
      features.featuresRequest.isExecuting &&
      !features.featuresRequest.wasExecuted;

    const isLoadingServices =
      services.allServicesRequest.isExecuting &&
      services.allServicesRequest.isExecutingFirstTime;

    const isLoadingSettings = !settings.loaded;

    if (isLoadingSettings || isLoadingFeatures || isLoadingServices) {
      return (
        <ThemeProvider theme={ui.theme}>
          <AppLoader theme={ui.theme} />
        </ThemeProvider>
      );
    }

    const workspacesDrawer = (
      <WorkspaceDrawer
        // eslint-disable-next-line no-confusing-arrow
        getServicesForWorkspace={workspace =>
          workspace
            ? workspaceStore.getWorkspaceServices(workspace).map(s => s.name)
            : services.all.map(s => s.name)
        }
      />
    );

    const sidebar = (
      <Sidebar
        services={services.allDisplayed}
        setActive={setActive}
        isAppMuted={settings.all.app.isAppMuted}
        isMenuCollapsed={settings.all.app.isMenuCollapsed}
        openSettings={openSettings}
        closeSettings={closeSettings}
        reorder={reorder}
        reload={reload}
        toggleNotifications={toggleNotifications}
        toggleAudio={toggleAudio}
        toggleDarkMode={toggleDarkMode}
        deleteService={deleteService}
        updateService={updateService}
        hibernateService={hibernate}
        wakeUpService={awake}
        toggleMuteApp={toggleMuteApp}
        toggleCollapseMenu={toggleCollapseMenu}
        toggleWorkspaceDrawer={
          this.props.actions.workspaces.toggleWorkspaceDrawer
        }
        isWorkspaceDrawerOpen={workspaceStore.isWorkspaceDrawerOpen}
        showServicesUpdatedInfoBar={ui.showServicesUpdatedInfoBar}
        showMessageBadgeWhenMutedSetting={
          settings.all.app.showMessageBadgeWhenMuted
        }
        showServiceNameSetting={settings.all.app.showServiceName}
        showMessageBadgesEvenWhenMuted={ui.showMessageBadgesEvenWhenMuted}
        isTodosServiceActive={services.isTodosServiceActive || false}
      />
    );

    const servicesContainer = (
      <Services
        services={services.allDisplayedUnordered}
        handleIPCMessage={handleIPCMessage}
        setWebviewReference={setWebviewReference}
        detachService={detachService}
        openWindow={openWindow}
        reload={reload}
        openSettings={openSettings}
        update={updateService}
        userHasCompletedSignup={user.hasCompletedSignup}
        isSpellcheckerEnabled={settings.app.enableSpellchecking}
      />
    );

    console.log('AppLayoutContainer');

    return (
      <ThemeProvider theme={ui.theme}>
        <AppLayout
          settings={settings}
          isFullScreen={app.isFullScreen}
          isOnline={app.isOnline}
          showServicesUpdatedInfoBar={ui.showServicesUpdatedInfoBar}
          appUpdateIsDownloaded={
            app.updateStatus === app.updateStatusTypes.DOWNLOADED
          }
          authRequestFailed={app.authRequestFailed}
          sidebar={sidebar}
          workspacesDrawer={workspacesDrawer}
          services={servicesContainer}
          installAppUpdate={installUpdate}
          globalError={globalError.error}
          showRequiredRequestsError={requests.showRequiredRequestsError}
          areRequiredRequestsSuccessful={requests.areRequiredRequestsSuccessful}
          retryRequiredRequests={retryRequiredRequests}
          areRequiredRequestsLoading={requests.areRequiredRequestsLoading}
        >
          <Routes>
            <Route
              path="/settings"
              element={<SettingsWindow {...this.props} />}
            />
            <Route
              path="/settings/recipes"
              element={<RecipesScreen {...this.props} />}
            />
            <Route
              path="/settings/recipes/:filter"
              element={<RecipesScreen {...this.props} />}
            />
            <Route
              path="/settings/services"
              element={<ServicesScreen {...this.props} />}
            />
            <Route
              path="/settings/services/:action/:id"
              element={<EditServiceScreen {...this.props} />}
            />
            <Route
              path={WORKSPACES_ROUTES.ROOT}
              element={<WorkspacesScreen {...this.props} />}
            />
            <Route
              path={WORKSPACES_ROUTES.EDIT}
              element={<EditWorkspaceScreen {...this.props} />}
            />
            <Route
              path="/settings/user"
              element={<AccountScreen {...this.props} />}
            />
            <Route
              path="/settings/user/edit"
              element={<EditUserScreen {...this.props} />}
            />
            <Route
              path="/settings/team"
              element={<TeamScreen {...this.props} />}
            />
            <Route
              path="/settings/app"
              element={<EditSettingsScreen {...this.props} />}
            />
            <Route
              path="/settings/invite"
              element={<InviteSettingsScreen {...this.props} />}
            />
            <Route
              path="/settings/support"
              element={<SupportFerdiumScreen {...this.props} />}
            />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    );
  }
}

export default inject('stores', 'actions')(observer(AppLayoutContainer));
