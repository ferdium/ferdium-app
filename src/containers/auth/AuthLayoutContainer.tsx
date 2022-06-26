import { Component, ReactElement, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { ThemeProvider } from 'react-jss';

import { DefaultProps } from 'src/@types/ferdium-components.types';
import { Location } from 'mobx-react-router';
import AuthLayout from '../../components/auth/AuthLayout';
import AppLoader from '../../components/ui/AppLoader';

interface AuthLayoutContainerProps extends DefaultProps {
  location: Location;
  children: ReactNode[] | ReactNode;
}

class AuthLayoutContainer extends Component<AuthLayoutContainerProps> {
  render(): ReactElement {
    const { stores, actions, children, location } = this.props;
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
          <AppLoader theme={stores.ui.theme} texts={['Logging you out...']} />
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={stores.ui.theme}>
        <AuthLayout
          error={globalError.response}
          pathname={location.pathname}
          isOnline={app.isOnline}
          isAPIHealthy={!app.healthCheckRequest.isError}
          retryHealthCheck={actions.app.healthCheck}
          isHealthCheckLoading={app.healthCheckRequest.isExecuting}
          isFullScreen={app.isFullScreen}
          installAppUpdate={actions.app.installUpdate}
          appUpdateIsDownloaded={
            app.updateStatus === app.updateStatusTypes.DOWNLOADED
          }
        >
          {children}
        </AuthLayout>
      </ThemeProvider>
    );
  }
}

export default inject('stores', 'actions')(observer(AuthLayoutContainer));
