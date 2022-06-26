import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';

import { DefaultProps } from 'src/@types/ferdium-components.types';
import Welcome from '../../components/auth/Welcome';

class WelcomeScreen extends Component<DefaultProps> {
  render(): ReactElement {
    const { user, recipePreviews } = this.props.stores;

    return (
      <Welcome
        loginRoute={user.loginRoute}
        signupRoute={user.signupRoute}
        changeServerRoute={user.changeServerRoute}
        recipes={recipePreviews.featured}
      />
    );
  }
}

export default inject('stores', 'actions')(observer(WelcomeScreen));
