import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { RouterStore } from '@superwf/mobx-react-router';

import { NavLink } from 'react-router-dom';
import { LOCAL_SERVER, LIVE_FERDIUM_API, LIVE_FRANZ_API } from '../../../config';
import UIStore from '../../../stores/UIStore';
import SettingsStore from '../../../stores/SettingsStore';
import UserStore from '../../../stores/UserStore';
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
  supportFerdium: {
    id: 'settings.navigation.supportFerdium',
    defaultMessage: 'About Ferdium',
  },
  logout: {
    id: 'settings.navigation.logout',
    defaultMessage: 'Logout',
  },
});

class SettingsNavigation extends Component {
  static propTypes = {
    stores: PropTypes.shape({
      ui: PropTypes.instanceOf(UIStore).isRequired,
      user: PropTypes.instanceOf(UserStore).isRequired,
      settings: PropTypes.instanceOf(SettingsStore).isRequired,
      router: PropTypes.instanceOf(RouterStore).isRequired,
    }).isRequired,
    actions: PropTypes.shape({
      settings: PropTypes.instanceOf(SettingsStore).isRequired,
    }).isRequired,
    serviceCount: PropTypes.number.isRequired,
    workspaceCount: PropTypes.number.isRequired,
  };

  handleLogout() {
    const isUsingWithoutAccount =
      this.props.stores.settings.app.server === LOCAL_SERVER;

    // Remove current auth token
    localStorage.removeItem('authToken');

    if (isUsingWithoutAccount) {
      // Reset server back to Ferdium API
      this.props.actions.settings.update({
        type: 'app',
        data: {
          server: LIVE_FERDIUM_API,
        },
      });
    }
    this.props.stores.user.isLoggingOut = true;

    this.props.stores.router.push('/auth/welcome');

    // Reload Ferdium, otherwise many settings won't sync correctly with the server
    // after logging into another account
    window.location.reload();
  }

  render() {
    const { serviceCount, workspaceCount, stores } = this.props;
    const { intl } = this.props;
    const isUsingWithoutAccount = stores.settings.app.server === LOCAL_SERVER;
    const isUsingFranzServer = stores.settings.app.server === LIVE_FRANZ_API;

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
          {stores.settings.app.automaticUpdates &&
            (stores.ui.showServicesUpdatedInfoBar ||
              stores.app.updateStatus ===
                stores.app.updateStatusTypes.AVAILABLE ||
              stores.app.updateStatus ===
                stores.app.updateStatusTypes.DOWNLOADED) && (
              <span className="update-available">•</span>
            )}
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
          to="/auth/logout"
          className="settings-navigation__link"
          onClick={this.handleLogout.bind(this)}
        >
          {!isUsingWithoutAccount
            ? intl.formatMessage(messages.logout)
            : 'Exit session'}
        </button>
      </div>
    );
  }
}

export default injectIntl(inject('stores', 'actions')(observer(SettingsNavigation)));
