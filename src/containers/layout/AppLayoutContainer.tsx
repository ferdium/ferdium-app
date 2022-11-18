import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { ThemeProvider } from 'react-jss';
import { Outlet } from 'react-router-dom';

import { StoresProps } from '../../@types/ferdium-components.types';
import AppLayout from '../../components/layout/AppLayout';
import Sidebar from '../../components/layout/Sidebar';
import Services from '../../components/services/content/Services';
import AppLoader from '../../components/ui/AppLoader';
import WorkspaceDrawer from '../../features/workspaces/components/WorkspaceDrawer';
import { workspaceStore } from '../../features/workspaces';

interface IProps extends StoresProps {}

@inject('stores', 'actions')
@observer
class AppLayoutContainer extends Component<IProps> {
  render(): ReactElement {
    const { app, features, services, ui, settings, requests, user, router } =
      this.props.stores;

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
      // handleIPCMessage,
      setWebviewReference,
      detachService,
      // openWindow,
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
        // handleIPCMessage={handleIPCMessage} // TODO - - [TECH DEBT] check it later
        setWebviewReference={setWebviewReference}
        detachService={detachService}
        // openWindow={openWindow} // TODO - - [TECH DEBT] check it later
        reload={reload}
        openSettings={openSettings}
        update={updateService}
        userHasCompletedSignup={user.hasCompletedSignup}
        isSpellcheckerEnabled={settings.app.enableSpellchecking}
      />
    );

    return (
      <ThemeProvider theme={ui.theme}>
        <AppLayout
          settings={settings}
          isFullScreen={app.isFullScreen}
          showServicesUpdatedInfoBar={ui.showServicesUpdatedInfoBar}
          appUpdateIsDownloaded={
            app.updateStatus === app.updateStatusTypes.DOWNLOADED
          }
          authRequestFailed={app.authRequestFailed}
          sidebar={sidebar}
          workspacesDrawer={workspacesDrawer}
          services={servicesContainer}
          installAppUpdate={installUpdate}
          showRequiredRequestsError={requests.showRequiredRequestsError}
          areRequiredRequestsSuccessful={requests.areRequiredRequestsSuccessful}
          retryRequiredRequests={retryRequiredRequests}
          areRequiredRequestsLoading={requests.areRequiredRequestsLoading}
          updateVersion={app.updateVersion}
        >
          <Outlet />
        </AppLayout>
      </ThemeProvider>
    );
  }
}

export default AppLayoutContainer;
