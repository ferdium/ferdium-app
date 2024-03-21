import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';

import type { StoresProps } from '../../@types/ferdium-components.types';

import TeamDashboard from '../../components/settings/team/TeamDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import { DEV_API_FRANZ_WEBSITE } from '../../config';

class TeamScreen extends Component<StoresProps> {
  handleWebsiteLink(route: string): void {
    const { actions, stores } = this.props;

    const url = `${DEV_API_FRANZ_WEBSITE}/${route}?authToken=${stores.user.authToken}&utm_source=app&utm_medium=account_dashboard`;

    actions.app.openExternalUrl({ url });
  }

  reloadData(): void {
    const { user } = this.props.stores;

    user.getUserInfoRequest.reload();
  }

  render(): ReactElement {
    const { user, settings } = this.props.stores;

    const isLoadingUserInfo = user.getUserInfoRequest.isExecuting;
    const { server } = settings.app;

    return (
      <ErrorBoundary>
        <TeamDashboard
          isLoading={isLoadingUserInfo}
          userInfoRequestFailed={
            user.getUserInfoRequest.wasExecuted &&
            user.getUserInfoRequest.isError
          }
          retryUserInfoRequest={() => this.reloadData()}
          openTeamManagement={() => this.handleWebsiteLink('/user/team')}
          server={server}
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(TeamScreen));
