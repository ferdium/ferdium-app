import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { DefaultProps } from 'src/@types/ferdium-components.types';
import Invite from '../../components/auth/Invite';

class InviteScreen extends Component<DefaultProps> {
  render(): ReactElement {
    const { actions } = this.props;

    return <Invite onSubmit={actions.user.invite} embed={false} />;
  }
}

export default inject('stores', 'actions')(observer(InviteScreen));
