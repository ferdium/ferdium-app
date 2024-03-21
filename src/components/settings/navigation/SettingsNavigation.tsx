import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { NavLink } from 'react-router-dom';
import type { StoresProps } from '../../../@types/ferdium-components.types';
import {
  LIVE_FERDIUM_API,
  LIVE_FRANZ_API,
  LOCAL_SERVER,
} from '../../../config';
import globalMessages from '../../../i18n/globalMessages';

const messages = defineMessages({
  availableServices: {
    id: 'settings.navigation.availableServices',
    defaultMessage: 'Available services',
  },
  yourServices: {
    id: 'settings.navigation.yourServices',
    defaultMessage: 'Your services',
  },
  yourWorkspaces: {
    id: 'settings.navigation.yourWorkspaces',
    defaultMessage: 'Your workspaces',
  },
  account: {
    id: 'settings.navigation.account',
    defaultMessage: 'Account',
  },
  team: {
    id: 'settings.navigation.team',
    defaultMessage: 'Manage Team',
  },
  releaseNotes: {
    id: 'settings.navigation.releaseNotes',
    defaultMessage: 'Release Notes',
  },
  supportFerdium: {
    id: 'settings.navigation.supportFerdium',
    defaultMessage: 'About Ferdium',
  },
  logout: {
    id: 'settings.navigation.logout',
    defaultMessage: 'Logout',
  },
});

interface IProps extends Partial<StoresProps>, WrappedComponentProps {
  serviceCount: number;
  workspaceCount: number;
}

@inject('stores', 'actions')
@observer
class SettingsNavigation extends Component<IProps> {
  handleLogout(): void {
    const isUsingWithoutAccount =
      this.props.stores!.settings.app.server === LOCAL_SERVER;

    // Remove current auth token
    localStorage.removeItem('authToken');

    if (isUsingWithoutAccount) {
      // Reset server back to Ferdium API
      this.props.actions!.settings.update({
        type: 'app',
        data: {
          server: LIVE_FERDIUM_API,
        },
      });
    }
    this.props.stores!.user.isLoggingOut = true;

    this.props.stores!.router.push('/auth/welcome');

    // Reload Ferdium, otherwise many settings won't sync correctly with the server
    // after logging into another account
    window.location.reload();
  }

  render() {
    const { serviceCount, workspaceCount, stores, intl } = this.props;
    const isUsingWithoutAccount = stores!.settings.app.server === LOCAL_SERVER;
    const isUsingFranzServer = stores!.settings.app.server === LIVE_FRANZ_API;

    return (
      <div className="settings-navigation">
        <NavLink
          to="/settings/recipes"
          className={({ isActive }) =>
            isActive
              ? 'settings-navigation__link is-active'
              : 'settings-navigation__link'
          }
        >
          {intl.formatMessage(messages.availableServices)}
        </NavLink>
        <NavLink
          to="/settings/services"
          className={({ isActive }) =>
            isActive
              ? 'settings-navigation__link is-active'
              : 'settings-navigation__link'
          }
        >
          {intl.formatMessage(messages.yourServices)}{' '}
          <span className="badge">{serviceCount}</span>
        </NavLink>
        <NavLink
          to="/settings/workspaces"
          className={({ isActive }) =>
            isActive
              ? 'settings-navigation__link is-active'
              : 'settings-navigation__link'
          }
        >
          {intl.formatMessage(messages.yourWorkspaces)}{' '}
          <span className="badge">{workspaceCount}</span>
        </NavLink>
        {!isUsingWithoutAccount && (
          <NavLink
            to="/settings/user"
            className={({ isActive }) =>
              isActive
                ? 'settings-navigation__link is-active'
                : 'settings-navigation__link'
            }
          >
            {intl.formatMessage(messages.account)}
          </NavLink>
        )}
        {isUsingFranzServer && (
          <NavLink
            to="/settings/team"
            className={({ isActive }) =>
              isActive
                ? 'settings-navigation__link is-active'
                : 'settings-navigation__link'
            }
          >
            {intl.formatMessage(messages.team)}
          </NavLink>
        )}
        <NavLink
          to="/settings/app"
          className={({ isActive }) =>
            isActive
              ? 'settings-navigation__link is-active'
              : 'settings-navigation__link'
          }
        >
          {intl.formatMessage(globalMessages.settings)}
          {stores!.settings.app.automaticUpdates &&
            (stores!.ui.showServicesUpdatedInfoBar ||
              stores!.app.updateStatus ===
                stores!.app.updateStatusTypes.AVAILABLE ||
              stores!.app.updateStatus ===
                stores!.app.updateStatusTypes.DOWNLOADED) && (
              <span className="update-available">•</span>
            )}
        </NavLink>
        <NavLink
          to="/settings/releasenotes"
          className={({ isActive }) =>
            isActive
              ? 'settings-navigation__link is-active'
              : 'settings-navigation__link'
          }
        >
          {intl.formatMessage(messages.releaseNotes)}
        </NavLink>
        <NavLink
          to="/settings/support"
          className={({ isActive }) =>
            isActive
              ? 'settings-navigation__link is-active'
              : 'settings-navigation__link'
          }
        >
          {intl.formatMessage(messages.supportFerdium)}
        </NavLink>
        <span className="settings-navigation__expander" />
        <button
          type="button"
          // @ts-expect-error  Fix me
          to="/auth/logout" // TODO: [TS DEBT] Need to check if button take this prop
          className="settings-navigation__link"
          onClick={this.handleLogout.bind(this)}
        >
          {isUsingWithoutAccount
            ? 'Exit session'
            : intl.formatMessage(messages.logout)}
        </button>
      </div>
    );
  }
}

export default injectIntl(SettingsNavigation);
