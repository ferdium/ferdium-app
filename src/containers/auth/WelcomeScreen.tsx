import { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Welcome from '../../components/auth/Welcome';
import UserStore from '../../stores/UserStore';
import RecipePreviewsStore from '../../stores/RecipePreviewsStore';

interface IProps {
  stores: {
    user: UserStore,
    recipePreviews: RecipePreviewsStore,
  },
};

class WelcomeScreen extends Component<IProps> {
  render() {
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
