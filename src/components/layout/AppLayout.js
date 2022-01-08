import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import { TitleBar } from 'electron-react-titlebar/renderer';
import injectSheet from 'react-jss';
import { ipcRenderer } from 'electron';

import { mdiFlash, mdiPowerPlug } from '@mdi/js';
import InfoBar from '../ui/InfoBar';
import { Component as BasicAuth } from '../../features/basicAuth';
import { Component as QuickSwitch } from '../../features/quickSwitch';
import { Component as PublishDebugInfo } from '../../features/publishDebugInfo';
import ErrorBoundary from '../util/ErrorBoundary';

// import globalMessages from '../../i18n/globalMessages';

import { isWindows, isMac } from '../../environment';
import WorkspaceSwitchingIndicator from '../../features/workspaces/components/WorkspaceSwitchingIndicator';
import { workspaceStore } from '../../features/workspaces';
import AppUpdateInfoBar from '../AppUpdateInfoBar';
import Todos from '../../features/todos/containers/TodosScreen';
import { Icon } from '../ui/icon';

import LockedScreen from '../../containers/auth/LockedScreen';

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

let transition = 'none';

if (window && window.matchMedia('(prefers-reduced-motion: no-preference)')) {
  transition = 'transform 0.5s ease';
}

const styles = theme => ({
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
    height: '23px',
    position: 'absolute',
    top: 0,
  },
});

const toggleFullScreen = () => {
  ipcRenderer.send('window.toolbar-double-clicked');
};

class AppLayout extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    sidebar: PropTypes.element.isRequired,
    workspacesDrawer: PropTypes.element.isRequired,
    services: PropTypes.element.isRequired,
    children: PropTypes.element,
    showServicesUpdatedInfoBar: PropTypes.bool.isRequired,
    appUpdateIsDownloaded: PropTypes.bool.isRequired,
    authRequestFailed: PropTypes.bool.isRequired,
    installAppUpdate: PropTypes.func.isRequired,
    showRequiredRequestsError: PropTypes.bool.isRequired,
    areRequiredRequestsSuccessful: PropTypes.bool.isRequired,
    retryRequiredRequests: PropTypes.func.isRequired,
    areRequiredRequestsLoading: PropTypes.bool.isRequired,
  };

  state = {
    shouldShowAppUpdateInfoBar: true,
    shouldShowServicesUpdatedInfoBar: true,
  };

  static defaultProps = {
    children: [],
  };

  render() {
    const {
      classes,
      isFullScreen,
      workspacesDrawer,
      sidebar,
      services,
      children,
      showServicesUpdatedInfoBar,
      appUpdateIsDownloaded,
      authRequestFailed,
      installAppUpdate,
      settings,
      showRequiredRequestsError,
      areRequiredRequestsSuccessful,
      retryRequiredRequests,
      areRequiredRequestsLoading,
    } = this.props;

    const { intl } = this.props;

    const { locked, automaticUpdates } = settings.app;
    if (locked) {
      return <LockedScreen />;
    }

    return (
      <ErrorBoundary>
        <div className="app">
          {isWindows && !isFullScreen && (
            <TitleBar
              menu={window['ferdi'].menu.template}
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
              {!areRequiredRequestsSuccessful && showRequiredRequestsError && (
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
              {automaticUpdates && showServicesUpdatedInfoBar &&
                this.state.shouldShowServicesUpdatedInfoBar && (
                  <InfoBar
                    type="primary"
                    ctaLabel={intl.formatMessage(messages.buttonReloadServices)}
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
              {automaticUpdates && appUpdateIsDownloaded && this.state.shouldShowAppUpdateInfoBar && (
                <AppUpdateInfoBar
                  onInstallUpdate={installAppUpdate}
                  onHide={() => {
                    this.setState({ shouldShowAppUpdateInfoBar: false });
                  }}
                />
              )}
              <BasicAuth />
              <QuickSwitch />
              <PublishDebugInfo />
              {services}
              {children}
            </div>
            <Todos />
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(observer(AppLayout)),
);
