import { inject, observer } from 'mobx-react';
import { Component, type ReactNode } from 'react';

import type { StoresProps } from '../../@types/ferdium-components.types';
import Invite from '../../components/auth/Invite';
import ErrorBoundary from '../../components/util/ErrorBoundary';

class InviteScreen extends Component<StoresProps> {
  componentWillUnmount(): void {
    this.props.stores.user.inviteRequest.reset();
  }

  render(): ReactNode {
    const { actions } = this.props;
    const { user } = this.props.stores;

    return (
      <ErrorBoundary>
        <Invite
          onSubmit={actions.user.invite}
          isLoadingInvite={user.inviteRequest.isExecuting}
          isInviteSuccessful={
            user.inviteRequest.wasExecuted && !user.inviteRequest.isError
          }
          embed
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(InviteScreen));
