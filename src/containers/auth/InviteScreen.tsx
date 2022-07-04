import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { StoresProps } from '../../@types/ferdium-components.types';
import Invite from '../../components/auth/Invite';

class InviteScreen extends Component<StoresProps> {
  render(): ReactElement {
    const { actions } = this.props;

    return <Invite onSubmit={actions.user.invite} embed={false} />;
  }
}

export default inject('stores', 'actions')(observer(InviteScreen));
