import { Children, Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { ThemeProvider } from 'react-jss';

import AppStore from '../../stores/AppStore';
import RecipesStore from '../../stores/RecipesStore';
import ServicesStore from '../../stores/ServicesStore';
import FeaturesStore from '../../stores/FeaturesStore';
import UIStore from '../../stores/UIStore';
import SettingsStore from '../../stores/SettingsStore';
import UserStore from '../../stores/UserStore';
import RequestStore from '../../stores/RequestStore';
import GlobalErrorStore from '../../stores/GlobalErrorStore';

import { oneOrManyChildElements } from '../../prop-types';
import AppLayout from '../../components/layout/AppLayout';
import Sidebar from '../../components/layout/Sidebar';
import Services from '../../components/services/content/Services';
import AppLoader from '../../components/ui/AppLoader';

import { workspaceActions } from '../../features/workspaces/actions';
import WorkspaceDrawer from '../../features/workspaces/components/WorkspaceDrawer';
import { workspaceStore } from '../../features/workspaces';

class AppLayoutContainer extends Component {
  static defaultProps = {
    children: null,
  };

  render() {
    const {
      app,
      features,
      services,
      ui,
      settings,
      globalError,
      requests,
      user,
      router
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

    const { installUpdate, toggleMuteApp } = this.props.actions.app;

    const { openSettings, closeSettings } = this.props.actions.ui;

    const { children } = this.props;

    const isLoadingFeatures =
      features.featuresRequest.isExecuting &&
      !features.featuresRequest.wasExecuted;

    const isLoadingServices =
      services.allServicesRequest.isExecuting &&
      services.allServicesRequest.isExecutingFirstTime;

    const isLoadingSettings = !settings.loaded;

    if (
      isLoadingSettings ||
      isLoadingFeatures ||
      isLoadingServices
    ) {
      return (
        <ThemeProvider theme={ui.theme}>
          <AppLoader />
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
        toggleWorkspaceDrawer={workspaceActions.toggleWorkspaceDrawer}
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
          {Children.count(children) > 0 ? children : null}
        </AppLayout>
      </ThemeProvider>
    );
  }
}

AppLayoutContainer.propTypes = {
  stores: PropTypes.shape({
    services: PropTypes.instanceOf(ServicesStore).isRequired,
    features: PropTypes.instanceOf(FeaturesStore).isRequired,
    recipes: PropTypes.instanceOf(RecipesStore).isRequired,
    app: PropTypes.instanceOf(AppStore).isRequired,
    ui: PropTypes.instanceOf(UIStore).isRequired,
    settings: PropTypes.instanceOf(SettingsStore).isRequired,
    user: PropTypes.instanceOf(UserStore).isRequired,
    requests: PropTypes.instanceOf(RequestStore).isRequired,
    globalError: PropTypes.instanceOf(GlobalErrorStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    service: PropTypes.instanceOf(ServicesStore).isRequired,
    ui: PropTypes.instanceOf(UIStore).isRequired,
    app: PropTypes.instanceOf(AppStore).isRequired,
    requests: PropTypes.instanceOf(RequestStore).isRequired,
  }).isRequired,
  // eslint-disable-next-line react/require-default-props
  children: oneOrManyChildElements,
};

export default inject('stores', 'actions')(observer(AppLayoutContainer));
