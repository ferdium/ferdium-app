import { mdiFlash } from '@mdi/js';
import type { Response } from 'electron';
import { TitleBar } from 'electron-react-titlebar/renderer';
import { observer } from 'mobx-react';
import {
  Component,
  type MouseEventHandler,
  type ReactElement,
  cloneElement,
} from 'react';
import { type WrappedComponentProps, injectIntl } from 'react-intl';
import { serverName } from '../../api/apiBase';
import { GITHUB_FERDIUM_URL } from '../../config';
import { isWindows } from '../../environment';
import { Component as PublishDebugInfo } from '../../features/publishDebugInfo';
import { updateVersionParse } from '../../helpers/update-helpers';
import globalMessages from '../../i18n/globalMessages';
import AppUpdateInfoBar from '../AppUpdateInfoBar';
import InfoBar from '../ui/InfoBar';
import Link from '../ui/Link';
import Icon from '../ui/icon';

export interface IProps extends WrappedComponentProps {
  children: ReactElement;
  error: Response;
  isOnline: boolean;
  isAPIHealthy: boolean;
  retryHealthCheck: MouseEventHandler<HTMLButtonElement>;
  isHealthCheckLoading: boolean;
  isFullScreen: boolean;
  installAppUpdate: MouseEventHandler<HTMLButtonElement>;
  appUpdateIsDownloaded: boolean;
  updateVersion: string;
}

interface IState {
  shouldShowAppUpdateInfoBar: boolean;
}

@observer
class AuthLayout extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      shouldShowAppUpdateInfoBar: true,
    };
  }

  render(): ReactElement {
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
      updateVersion,
      intl,
    } = this.props;

    let serverNameParse = serverName();
    serverNameParse =
      serverNameParse === 'Custom' ? 'your Custom Server' : serverNameParse;

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
              updateVersionParsed={updateVersionParse(updateVersion)}
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
              {intl.formatMessage(globalMessages.APIUnhealthy, {
                serverNameParse,
              })}
            </InfoBar>
          )}
          <div className="auth__layout">
            {/* Inject globalError into children  */}
            {/* eslint-disable-next-line @eslint-react/no-clone-element */}
            {cloneElement(children, { error })}
          </div>
          {/* </div> */}
          <Link
            to={`${GITHUB_FERDIUM_URL}/ferdium-app`}
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

export default injectIntl(AuthLayout);
