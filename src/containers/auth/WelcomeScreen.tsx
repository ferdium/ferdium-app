import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { StoresProps } from '../../@types/ferdium-components.types';
import Welcome from '../../components/auth/Welcome';

interface IProps extends Partial<StoresProps> {}

@inject('stores', 'actions')
@observer
class WelcomeScreen extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render(): ReactElement {
    const { user, recipePreviews } = this.props.stores!;

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

export default WelcomeScreen;
