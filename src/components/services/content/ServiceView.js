/* eslint-disable react/jsx-no-useless-fragment */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { autorun } from 'mobx';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import TopBarProgress from 'react-topbar-progress-indicator';

import ServiceModel from '../../../models/Service';
import StatusBarTargetUrl from '../../ui/StatusBarTargetUrl';
import WebviewLoader from '../../ui/WebviewLoader';
import WebviewCrashHandler from './WebviewCrashHandler';
import WebviewErrorHandler from './ErrorHandlers/WebviewErrorHandler';
import ServiceDisabled from './ServiceDisabled';
import ServiceWebview from './ServiceWebview';
import SettingsStore from '../../../stores/SettingsStore';
import WebControlsScreen from '../../../features/webControls/containers/WebControlsScreen';
import { CUSTOM_WEBSITE_RECIPE_ID } from '../../../config';

class ServiceView extends Component {
  static propTypes = {
    service: PropTypes.instanceOf(ServiceModel).isRequired,
    setWebviewReference: PropTypes.func.isRequired,
    detachService: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    enable: PropTypes.func.isRequired,
    isActive: PropTypes.bool,
    stores: PropTypes.shape({
      settings: PropTypes.instanceOf(SettingsStore).isRequired,
    }).isRequired,
    isSpellcheckerEnabled: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isActive: false,
  };

  state = {
    forceRepaint: false,
    targetUrl: '',
    statusBarVisible: false,
  };

  hibernationTimer = null;

  autorunDisposer = null;

  forceRepaintTimeout = null;

  componentDidMount() {
    this.autorunDisposer = autorun(() => {
      if (this.props.service.isActive) {
        this.setState({ forceRepaint: true });
        this.forceRepaintTimeout = setTimeout(() => {
          this.setState({ forceRepaint: false });
        }, 100);
      }
    });
  }

  componentWillUnmount() {
    this.autorunDisposer();
    clearTimeout(this.forceRepaintTimeout);
    clearTimeout(this.hibernationTimer);
  }

  render() {
    const {
      detachService,
      service,
      setWebviewReference,
      reload,
      edit,
      enable,
      stores,
      isSpellcheckerEnabled,
    } = this.props;

    const { navigationBarBehaviour, navigationBarManualActive } =
      stores.settings.app;

    const showNavBar =
      navigationBarBehaviour === 'always' ||
      (navigationBarBehaviour === 'custom' &&
        service.recipe.id === CUSTOM_WEBSITE_RECIPE_ID) ||
      navigationBarManualActive;

    const webviewClasses = classnames({
      services__webview: true,
      'services__webview-wrapper': true,
      'is-active': service.isActive,
      'services__webview--force-repaint': this.state.forceRepaint,
    });

    let statusBar = null;
    if (this.state.statusBarVisible) {
      statusBar = <StatusBarTargetUrl text={this.state.targetUrl} />;
    }

    return (
      <div
        className={webviewClasses}
        data-name={service.name}
        style={{ order: service.order }}
      >
        {service.isActive && service.isEnabled && (
          <>
            {service.hasCrashed && (
              <WebviewCrashHandler
                name={service.recipe.name}
                webview={service.webview}
                reload={reload}
              />
            )}
            {service.isEnabled &&
              service.isLoading &&
              service.isFirstLoad &&
              !service.isHibernating &&
              !service.isServiceAccessRestricted && (
                <WebviewLoader loaded={false} name={service.name} />
              )}
            {service.isProgressbarEnabled &&
              service.isLoadingPage &&
              !service.isFirstLoad && <TopBarProgress />}
            {service.isError && (
              <WebviewErrorHandler
                name={service.recipe.name}
                errorMessage={service.errorMessage}
                reload={reload}
                edit={edit}
              />
            )}
          </>
        )}
        {!service.isEnabled ? (
          <>
            {service.isActive && (
              <ServiceDisabled
                name={service.name !== '' ? service.name : service.recipe.name}
                webview={service.webview}
                enable={enable}
              />
            )}
          </>
        ) : (
          <>
            {!service.isHibernating ? (
              <>
                {showNavBar && <WebControlsScreen service={service} />}
                <ServiceWebview
                  service={service}
                  setWebviewReference={setWebviewReference}
                  detachService={detachService}
                  isSpellcheckerEnabled={isSpellcheckerEnabled}
                />
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <span
                  role="img"
                  aria-label="Sleeping Emoji"
                  style={{ fontSize: 42 }}
                >
                  😴
                </span>
                <br />
                <br />
                This service is currently hibernating.
                <br />
                Try switching services or reloading Ferdium.
              </div>
            )}
          </>
        )}
        {statusBar}
      </div>
    );
  }
}

export default inject('stores', 'actions')(observer(ServiceView));
