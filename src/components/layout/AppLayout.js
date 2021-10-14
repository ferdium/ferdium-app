import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import { TitleBar } from 'electron-react-titlebar/renderer';
import injectSheet from 'react-jss';

import InfoBar from '../ui/InfoBar';
import { Component as BasicAuth } from '../../features/basicAuth';
import { Component as QuickSwitch } from '../../features/quickSwitch';
import { Component as NightlyBuilds } from '../../features/nightlyBuilds';
import { Component as PublishDebugInfo } from '../../features/publishDebugInfo';
import ErrorBoundary from '../util/ErrorBoundary';

// import globalMessages from '../../i18n/globalMessages';

import { isWindows } from '../../environment';
import WorkspaceSwitchingIndicator from '../../features/workspaces/components/WorkspaceSwitchingIndicator';
import { workspaceStore } from '../../features/workspaces';
import AppUpdateInfoBar from '../AppUpdateInfoBar';
import Todos from '../../features/todos/containers/TodosScreen';

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
});

@injectSheet(styles)
@observer
class AppLayout extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    sidebar: PropTypes.element.isRequired,
    workspacesDrawer: PropTypes.element.isRequired,
    services: PropTypes.element.isRequired,
    children: PropTypes.element,
    showServicesUpdatedInfoBar: PropTypes.bool.isRequired,
    appUpdateIsDownloaded: PropTypes.bool.isRequired,
    authRequestFailed: PropTypes.bool.isRequired,
    reloadServicesAfterUpdate: PropTypes.func.isRequired,
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
      reloadServicesAfterUpdate,
      installAppUpdate,
      showRequiredRequestsError,
      areRequiredRequestsSuccessful,
      retryRequiredRequests,
      areRequiredRequestsLoading,
    } = this.props;

    const { intl } = this.props;

    return (
      <ErrorBoundary>
        <div className="app">
          {isWindows && !isFullScreen && (
            <TitleBar
              menu={window.ferdi.menu.template}
              icon="assets/images/logo.svg"
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
                  <span className="mdi mdi-flash" />
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
                  <span className="mdi mdi-flash" />
                  {intl.formatMessage(messages.authRequestFailed)}
                </InfoBar>
              )}
              {showServicesUpdatedInfoBar &&
                this.state.shouldShowServicesUpdatedInfoBar && (
                  <InfoBar
                    type="primary"
                    ctaLabel={intl.formatMessage(messages.buttonReloadServices)}
                    onClick={reloadServicesAfterUpdate}
                    onHide={() => {
                      this.setState({
                        shouldShowServicesUpdatedInfoBar: false,
                      });
                    }}
                  >
                    <span className="mdi mdi-power-plug" />
                    {intl.formatMessage(messages.servicesUpdated)}
                  </InfoBar>
                )}
              {appUpdateIsDownloaded && this.state.shouldShowAppUpdateInfoBar && (
                <AppUpdateInfoBar
                  onInstallUpdate={installAppUpdate}
                  onHide={() => {
                    this.setState({ shouldShowAppUpdateInfoBar: false });
                  }}
                />
              )}
              <BasicAuth />
              <QuickSwitch />
              <NightlyBuilds />
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

export default injectIntl(AppLayout);
