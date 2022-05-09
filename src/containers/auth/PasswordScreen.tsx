import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Password from '../../components/auth/Password';
import UserStore from '../../stores/UserStore';

interface IProps {
  actions: {
    user: UserStore,
  },
  stores: {
    user: UserStore,
  }
};

class PasswordScreen extends Component<IProps> {
  render() {
    const { actions, stores } = this.props;

    return (
      <Password
        onSubmit={actions.user.retrievePassword}
        isSubmitting={stores.user.passwordRequest.isExecuting}
        signupRoute={stores.user.signupRoute}
        loginRoute={stores.user.loginRoute}
        status={stores.user.actionStatus}
      />
    );
  }
}

export default inject('stores', 'actions')(observer(PasswordScreen));
