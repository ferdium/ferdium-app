import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Router, Route, IndexRedirect } from 'react-router';

import AppLayoutContainer from './containers/layout/AppLayoutContainer';
import SettingsWindow from './containers/settings/SettingsWindow';
import RecipesScreen from './containers/settings/RecipesScreen';
import ServicesScreen from './containers/settings/ServicesScreen';
import EditServiceScreen from './containers/settings/EditServiceScreen';
import AccountScreen from './containers/settings/AccountScreen';
import TeamScreen from './containers/settings/TeamScreen';
import EditUserScreen from './containers/settings/EditUserScreen';
import EditSettingsScreen from './containers/settings/EditSettingsScreen';
import InviteSettingsScreen from './containers/settings/InviteScreen';
import SupportferdiumScreen from './containers/settings/SupportScreen';
import WelcomeScreen from './containers/auth/WelcomeScreen';
import LoginScreen from './containers/auth/LoginScreen';
import PasswordScreen from './containers/auth/PasswordScreen';
import ChangeServerScreen from './containers/auth/ChangeServerScreen';
import SignupScreen from './containers/auth/SignupScreen';
import ImportScreen from './containers/auth/ImportScreen';
import SetupAssistentScreen from './containers/auth/SetupAssistantScreen';
import InviteScreen from './containers/auth/InviteScreen';
import AuthLayoutContainer from './containers/auth/AuthLayoutContainer';
import WorkspacesScreen from './features/workspaces/containers/WorkspacesScreen';
import EditWorkspaceScreen from './features/workspaces/containers/EditWorkspaceScreen';
import { WORKSPACES_ROUTES } from './features/workspaces/constants';

import SettingsStore from './stores/SettingsStore';

type Props = {
  stores: {
    settings: typeof SettingsStore;
  };
  history: any;
};

class Routes extends Component<Props> {
  render() {

    const { history } = this.props;

    return (
      <Router history={history}>
        <Route path="/" component={AppLayoutContainer}>
          <Route path="/settings" component={SettingsWindow}>
            <IndexRedirect to="/settings/recipes" />
            <Route path="/settings/recipes" component={RecipesScreen} />
            <Route path="/settings/recipes/:filter" component={RecipesScreen} />
            <Route path="/settings/services" component={ServicesScreen} />
            <Route
              path="/settings/services/:action/:id"
              component={EditServiceScreen}
            />
            <Route path={WORKSPACES_ROUTES.ROOT} component={WorkspacesScreen} />
            <Route
              path={WORKSPACES_ROUTES.EDIT}
              component={EditWorkspaceScreen}
            />
            <Route path="/settings/user" component={AccountScreen} />
            <Route path="/settings/user/edit" component={EditUserScreen} />
            <Route path="/settings/team" component={TeamScreen} />
            <Route path="/settings/app" component={EditSettingsScreen} />
            <Route path="/settings/invite" component={InviteSettingsScreen} />
            <Route path="/settings/support" component={SupportferdiumScreen} />
          </Route>
        </Route>
        <Route path="/auth" component={AuthLayoutContainer}>
          <IndexRedirect to="/auth/welcome" />
          <Route path="/auth/welcome" component={WelcomeScreen} />
          <Route path="/auth/login" component={LoginScreen} />
          <Route path="/auth/server" component={ChangeServerScreen} />
          <Route path="/auth/signup">
            <IndexRedirect to="/auth/signup/form" />
            <Route path="/auth/signup/form" component={SignupScreen} />
            <Route path="/auth/signup/import" component={ImportScreen} />
            <Route path="/auth/signup/setup" component={SetupAssistentScreen} />
            <Route path="/auth/signup/invite" component={InviteScreen} />
          </Route>
          <Route path="/auth/password" component={PasswordScreen} />
          <Route path="/auth/logout" component={LoginScreen} />
        </Route>
        <Route path="*" component={AppLayoutContainer} />
      </Router>
    );
  }
}

export default inject('stores', 'actions')(observer(Routes));
