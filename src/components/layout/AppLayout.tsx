import { ipcRenderer } from 'electron';
import { TitleBar } from 'electron-react-titlebar/renderer';
import { observer } from 'mobx-react';
import type React from 'react';
import { Component, type PropsWithChildren } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import injectSheet, { type WithStylesProps } from 'react-jss';

import { mdiFlash, mdiPowerPlug } from '@mdi/js';
import { Outlet } from 'react-router-dom';
import { Component as BasicAuth } from '../../features/basicAuth';
import { Component as PublishDebugInfo } from '../../features/publishDebugInfo';
import { Component as QuickSwitch } from '../../features/quickSwitch';
import { updateVersionParse } from '../../helpers/update-helpers';
import InfoBar from '../ui/InfoBar';
import ErrorBoundary from '../util/ErrorBoundary';

import { isMac, isSnap, isWindows } from '../../environment';
import Todos from '../../features/todos/containers/TodosScreen';
import { workspaceStore } from '../../features/workspaces';
import WorkspaceSwitchingIndicator from '../../features/workspaces/components/WorkspaceSwitchingIndicator';
import AppUpdateInfoBar from '../AppUpdateInfoBar';
import Icon from '../ui/icon';

import LockedScreen from '../../containers/auth/LockedScreen';
import type SettingsStore from '../../stores/SettingsStore';

const messages = defineMessages({
  servicesUpdated: {
    id: 'infobar.servicesUpdated',
    defaultMessage: 'Your services have been updated.',
  },
  buttonReloadServices: {
    id: 'infobar.buttonReloadServices',
    defaultMessage: 'Reload services',
  },
  requiredRequestsFailed: {
    id: 'infobar.requiredRequestsFailed',
    defaultMessage: 'Could not load services and user information',
  },
  authRequestFailed: {
    id: 'infobar.authRequestFailed',
    defaultMessage:
      'There were errors while trying to perform an authenticated request. Please try logging out and back in if this error persists.',
  },
});

const transition = window?.matchMedia('(prefers-reduced-motion: no-preference)')
  ? 'transform 0.5s ease'
  : 'none';

const styles = (theme: { workspaces: { drawer: { width: any } } }) => ({
  appContent: {
    // width: `calc(100% + ${theme.workspaces.drawer.width}px)`,
    width: '100%',
    transition,
    transform() {
      return workspaceStore.isWorkspaceDrawerOpen
        ? 'translateX(0)'
        : `translateX(-${theme.workspaces.drawer.width}px)`;
    },
  },
  titleBar: {
    display: 'block',
    zIndex: 1,
    width: '100%',
    height: '10px',
    position: 'absolute',
    top: 0,
  },
});

const toggleFullScreen = () => {
  ipcRenderer.send('window.toolbar-double-clicked');
};

interface IProps extends WrappedComponentProps, WithStylesProps<typeof styles> {
  settings: SettingsStore;
  updateVersion: string;
  isFullScreen: boolean;
  sidebar: React.ReactElement;
  workspacesDrawer: React.ReactElement;
  services: React.ReactElement;
  showServicesUpdatedInfoBar: boolean;
  appUpdateIsDownloaded: boolean;
  authRequestFailed: boolean;
  installAppUpdate: () => void;
  showRequiredRequestsError: boolean;
  areRequiredRequestsSuccessful: boolean;
  retryRequiredRequests: () => void;
  areRequiredRequestsLoading: boolean;
}

interface IState {
  shouldShowAppUpdateInfoBar: boolean;
  shouldShowServicesUpdatedInfoBar: boolean;
}

@observer
class AppLayout extends Component<PropsWithChildren<IProps>, IState> {
  constructor(props) {
    super(props);

    this.state = {
      shouldShowAppUpdateInfoBar: true,
      shouldShowServicesUpdatedInfoBar: true,
    };
  }

  render() {
    const {
      classes,
      isFullScreen,
      workspacesDrawer,
      sidebar,
      services,
      showServicesUpdatedInfoBar,
      appUpdateIsDownloaded,
      authRequestFailed,
      installAppUpdate,
      settings,
      showRequiredRequestsError,
      areRequiredRequestsSuccessful,
      retryRequiredRequests,
      areRequiredRequestsLoading,
      updateVersion,
    } = this.props;

    const { intl } = this.props;

    const { locked, automaticUpdates } = settings.app;
    if (locked) {
      return <LockedScreen />;
    }

    return (
      <>
        {isMac && !isFullScreen && <div className="window-draggable" />}
        <ErrorBoundary>
          <div className="app">
            {isWindows && !isFullScreen && (
              <TitleBar
                menu={window['ferdium'].menu.template}
                icon="assets/images/logo.svg"
              />
            )}
            {isMac && !isFullScreen && (
              <span
                onDoubleClick={toggleFullScreen}
                className={classes.titleBar}
              />
            )}
            <div className={`app__content ${classes.appContent}`}>
              {workspacesDrawer}
              {sidebar}
              <div className="app__service">
                <WorkspaceSwitchingIndicator />
                {!areRequiredRequestsSuccessful &&
                  showRequiredRequestsError && (
                    <InfoBar
                      type="danger"
                      ctaLabel="Try again"
                      ctaLoading={areRequiredRequestsLoading}
                      sticky
                      onClick={retryRequiredRequests}
                    >
                      <Icon icon={mdiFlash} />
                      {intl.formatMessage(messages.requiredRequestsFailed)}
                    </InfoBar>
                  )}
                {authRequestFailed && (
                  <InfoBar
                    type="danger"
                    ctaLabel="Try again"
                    ctaLoading={areRequiredRequestsLoading}
                    sticky
                    onClick={retryRequiredRequests}
                  >
                    <Icon icon={mdiFlash} />
                    {intl.formatMessage(messages.authRequestFailed)}
                  </InfoBar>
                )}
                {automaticUpdates &&
                  showServicesUpdatedInfoBar &&
                  this.state.shouldShowServicesUpdatedInfoBar && (
                    <InfoBar
                      type="primary"
                      ctaLabel={intl.formatMessage(
                        messages.buttonReloadServices,
                      )}
                      onClick={() => window.location.reload()}
                      onHide={() => {
                        this.setState({
                          shouldShowServicesUpdatedInfoBar: false,
                        });
                      }}
                    >
                      <Icon icon={mdiPowerPlug} />
                      {intl.formatMessage(messages.servicesUpdated)}
                    </InfoBar>
                  )}
                {automaticUpdates &&
                  (appUpdateIsDownloaded || isSnap) &&
                  this.state.shouldShowAppUpdateInfoBar && (
                    <AppUpdateInfoBar
                      onInstallUpdate={installAppUpdate}
                      updateVersionParsed={updateVersionParse(updateVersion)}
                      onHide={() => {
                        this.setState({ shouldShowAppUpdateInfoBar: false });
                      }}
                    />
                  )}
                <BasicAuth />
                <QuickSwitch />
                <PublishDebugInfo />
                {services}
                <Outlet />
              </div>
              <Todos />
            </div>
          </div>
        </ErrorBoundary>
      </>
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(AppLayout),
);
