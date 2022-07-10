import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { StoresProps, GlobalError } from '../../@types/ferdium-components.types';
import Login from '../../components/auth/Login';

interface LoginScreenProps extends StoresProps {
  error: GlobalError;
}

class LoginScreen extends Component<LoginScreenProps> {
  render(): ReactElement {
    const { actions, stores, error } = this.props;
    return (
      <Login
        onSubmit={actions.user.login}
        isSubmitting={stores.user.loginRequest.isExecuting}
        isTokenExpired={stores.user.isTokenExpired}
        isServerLogout={
          stores.user.logoutReason === stores.user.logoutReasonTypes.SERVER
        }
        signupRoute={stores.user.signupRoute}
        passwordRoute={stores.user.passwordRoute}
        error={error}
      />
    );
  }
}

export default inject('stores', 'actions')(observer(LoginScreen));
