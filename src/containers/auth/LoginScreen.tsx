import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import type {
  GlobalError,
  StoresProps,
} from '../../@types/ferdium-components.types';
import Login from '../../components/auth/Login';

interface IProps extends StoresProps {
  error: GlobalError;
}

@inject('stores', 'actions')
@observer
class LoginScreen extends Component<IProps> {
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

export default LoginScreen;
