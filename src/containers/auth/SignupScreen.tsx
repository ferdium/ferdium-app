import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';

import {
  StoresProps,
  GlobalError,
} from '../../@types/ferdium-components.types';
import Signup from '../../components/auth/Signup';

interface SignUpScreenComponents extends StoresProps {
  error: GlobalError;
}

class SignupScreen extends Component<SignUpScreenComponents> {
  onSignup(values: any): void {
    const { actions } = this.props;

    actions.user.signup(values);
  }

  render(): ReactElement {
    const { stores, error } = this.props;

    return (
      <Signup
        onSubmit={values => this.onSignup(values)}
        isSubmitting={stores.user.signupRequest.isExecuting}
        loginRoute={stores.user.loginRoute}
        error={error}
      />
    );
  }
}

export default inject('stores', 'actions')(observer(SignupScreen));
