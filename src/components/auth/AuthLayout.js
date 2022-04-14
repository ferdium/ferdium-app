import { cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { TitleBar } from 'electron-react-titlebar/renderer';

import { injectIntl } from 'react-intl';
import { mdiFlash } from '@mdi/js';
import Link from '../ui/Link';
import InfoBar from '../ui/InfoBar';

import { Component as PublishDebugInfo } from '../../features/publishDebugInfo';

import {
  oneOrManyChildElements,
  globalError as globalErrorPropType,
} from '../../prop-types';
import globalMessages from '../../i18n/globalMessages';

import { isWindows } from '../../environment';
import AppUpdateInfoBar from '../AppUpdateInfoBar';
import { GITHUB_ferdium_URL } from '../../config';
import { Icon } from '../ui/icon';

class AuthLayout extends Component {
  static propTypes = {
    children: oneOrManyChildElements.isRequired,
    error: globalErrorPropType.isRequired,
    isOnline: PropTypes.bool.isRequired,
    isAPIHealthy: PropTypes.bool.isRequired,
    retryHealthCheck: PropTypes.func.isRequired,
    isHealthCheckLoading: PropTypes.bool.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    installAppUpdate: PropTypes.func.isRequired,
    appUpdateIsDownloaded: PropTypes.bool.isRequired,
  };

  state = {
    shouldShowAppUpdateInfoBar: true,
  };

  render() {
    const {
      children,
      error,
      isOnline,
      isAPIHealthy,
      retryHealthCheck,
      isHealthCheckLoading,
      isFullScreen,
      installAppUpdate,
      appUpdateIsDownloaded,
    } = this.props;

    const { intl } = this.props;

    return (
      <>
        {isWindows && !isFullScreen && (
          <TitleBar
            menu={window['ferdium'].menu.template}
            icon="assets/images/logo.svg"
          />
        )}
        <div className="auth">
          {!isOnline && (
            <InfoBar type="warning">
              <Icon icon={mdiFlash} />
              {intl.formatMessage(globalMessages.notConnectedToTheInternet)}
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
          {isOnline && !isAPIHealthy && (
            <InfoBar
              type="danger"
              ctaLabel="Try again"
              ctaLoading={isHealthCheckLoading}
              sticky
              onClick={retryHealthCheck}
            >
              <Icon icon={mdiFlash} />
              {intl.formatMessage(globalMessages.APIUnhealthy)}
            </InfoBar>
          )}
          <div className="auth__layout">
            {/* Inject globalError into children  */}
            {cloneElement(children, {
              error,
            })}
          </div>
          {/* </div> */}
          <Link
            to={`${GITHUB_ferdium_URL}/ferdium`}
            className="auth__adlk"
            target="_blank"
          >
            <img src="./assets/images/adlk.svg" alt="" />
          </Link>
        </div>
        <PublishDebugInfo />
      </>
    );
  }
}

export default injectIntl(observer(AuthLayout));
