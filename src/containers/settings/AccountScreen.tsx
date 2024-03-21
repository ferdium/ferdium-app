import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';

import type { StoresProps } from '../../@types/ferdium-components.types';

import AccountDashboard from '../../components/settings/account/AccountDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import { LIVE_FRANZ_API } from '../../config';
import { WEBSITE } from '../../environment-remote';

class AccountScreen extends Component<StoresProps> {
  reloadData(): void {
    const { user } = this.props.stores;

    user.getUserInfoRequest.reload();
  }

  handleWebsiteLink(route: string): void {
    const { actions, stores } = this.props;

    const api: string = stores.settings.all.app.server;

    const url: string =
      api === LIVE_FRANZ_API
        ? stores.user.getAuthURL(
            `${WEBSITE}${route}?utm_source=app&utm_medium=account_dashboard`,
          )
        : `${api}${route}`;

    actions.app.openExternalUrl({ url });
  }

  render(): ReactElement {
    const { user, settings } = this.props.stores;
    const { user: userActions } = this.props.actions;

    const isLoadingUserInfo = user.getUserInfoRequest.isExecuting;

    return (
      <ErrorBoundary>
        <AccountDashboard
          server={settings.all.app.server}
          user={user.data}
          isLoading={isLoadingUserInfo}
          userInfoRequestFailed={
            user.getUserInfoRequest.wasExecuted &&
            user.getUserInfoRequest.isError
          }
          retryUserInfoRequest={() => this.reloadData()}
          deleteAccount={userActions.delete}
          isLoadingDeleteAccount={user.deleteAccountRequest.isExecuting}
          isDeleteAccountSuccessful={
            user.deleteAccountRequest.wasExecuted &&
            !user.deleteAccountRequest.isError
          }
          openEditAccount={() => this.handleWebsiteLink('/user/profile')}
          openInvoices={() => this.handleWebsiteLink('/user/invoices')}
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(AccountScreen));
