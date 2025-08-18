import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { ThemeProvider } from 'react-jss';
import { Outlet } from 'react-router-dom';
import type { StoresProps } from '../../@types/ferdium-components.types';
import AuthLayout from '../../components/auth/AuthLayout';
import AppLoader from '../../components/ui/AppLoader';

const messages = defineMessages({
  loggingOut: {
    id: 'auth.loggingOut',
    defaultMessage: 'Logging you out...',
  },
});

interface IProps extends StoresProps, WrappedComponentProps {}

@inject('stores', 'actions')
@observer
class AuthLayoutContainer extends Component<IProps> {
  render(): ReactElement {
    const { stores, actions, intl } = this.props;
    const { app, features, globalError, user } = stores;

    const isLoadingBaseFeatures =
      features.defaultFeaturesRequest.isExecuting &&
      !features.defaultFeaturesRequest.wasExecuted;

    if (isLoadingBaseFeatures) {
      return (
        <ThemeProvider theme={stores.ui.theme}>
          <AppLoader theme={stores.ui.theme} />
        </ThemeProvider>
      );
    }

    const { isLoggingOut } = user;
    if (isLoggingOut) {
      return (
        <ThemeProvider theme={stores.ui.theme}>
          <AppLoader
            theme={stores.ui.theme}
            texts={[intl.formatMessage(messages.loggingOut)]}
          />
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={stores.ui.theme}>
        <AuthLayout
          error={globalError.response}
          isOnline={app.isOnline}
          isAPIHealthy={!app.healthCheckRequest.isError}
          retryHealthCheck={actions.app.healthCheck}
          isHealthCheckLoading={app.healthCheckRequest.isExecuting}
          isFullScreen={app.isFullScreen}
          installAppUpdate={actions.app.installUpdate}
          appUpdateIsDownloaded={
            app.updateStatus === app.updateStatusTypes.DOWNLOADED
          }
          updateVersion={app.updateVersion}
          isUpdateAvailable={
            app.updateStatus === app.updateStatusTypes.AVAILABLE
          }
        >
          <Outlet />
        </AuthLayout>
      </ThemeProvider>
    );
  }
}

export default injectIntl(AuthLayoutContainer);
