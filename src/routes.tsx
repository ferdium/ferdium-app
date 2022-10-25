import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Navigate,
  Routes,
  Route,
  unstable_HistoryRouter as HistoryRouter,
} from 'react-router-dom';
import { HashHistory } from 'history';
import AppLayoutContainer from './containers/layout/AppLayoutContainer';
import SettingsWindow from './containers/settings/SettingsWindow';
import ReleaseNotesWindow from './containers/settings/ReleaseNotesWindow';
import RecipesScreen from './containers/settings/RecipesScreen';
import ServicesScreen from './containers/settings/ServicesScreen';
import EditServiceScreen from './containers/settings/EditServiceScreen';
import AccountScreen from './containers/settings/AccountScreen';
import TeamScreen from './containers/settings/TeamScreen';
import EditUserScreen from './containers/settings/EditUserScreen';
import EditSettingsScreen from './containers/settings/EditSettingsScreen';
import InviteSettingsScreen from './containers/settings/InviteScreen';
import SupportFerdiumScreen from './containers/settings/SupportScreen';
import ReleaseNotesScreen from './containers/settings/ReleaseNotesScreen';
import WelcomeScreen from './containers/auth/WelcomeScreen';
import LoginScreen from './containers/auth/LoginScreen';
import AuthReleaseNotesScreen from './containers/auth/AuthReleaseNotesScreen';
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
import { StoresProps } from './@types/ferdium-components.types';

interface IProps extends StoresProps {
  history: HashHistory;
}

@inject('stores', 'actions')
@observer
class FerdiumRoutes extends Component<IProps> {
  render(): ReactElement {
    const { history, stores, actions } = this.props;
    const routeProps: StoresProps = { stores, actions };
    const errorProps = { error: this.props.stores.globalError.error || {} };

    return (
      <HistoryRouter history={history}>
        <Routes>
          <Route path="/auth" element={<AuthLayoutContainer {...routeProps} />}>
            <Route
              path="/auth"
              element={<Navigate to="/auth/welcome" replace />}
            />
            <Route
              path="/auth/welcome"
              element={<WelcomeScreen {...routeProps} />}
            />
            <Route
              path="/auth/login"
              element={<LoginScreen {...routeProps} {...errorProps} />}
            />
            <Route
              path="/auth/server"
              element={<ChangeServerScreen {...routeProps} />}
            />
            <Route path="/auth/signup">
              <Route
                path="/auth/signup"
                element={<Navigate to="/auth/signup/form" replace />}
              />
              <Route
                path="/auth/signup/form"
                element={<SignupScreen {...routeProps} {...errorProps} />}
              />
              <Route
                path="/auth/signup/import"
                element={<ImportScreen {...routeProps} />}
              />
              <Route
                path="/auth/signup/setup"
                element={<SetupAssistentScreen {...routeProps} />}
              />
              <Route
                path="/auth/signup/invite"
                element={<InviteScreen {...routeProps} />}
              />
            </Route>
            <Route
              path="/auth/password"
              element={<PasswordScreen {...routeProps} />}
            />
            <Route
              path="/auth/logout"
              element={<LoginScreen {...routeProps} {...errorProps} />}
            />
            <Route
              path="/auth/releasenotes"
              element={
                <AuthReleaseNotesScreen {...routeProps} {...errorProps} />
              }
            />
          </Route>

          <Route path="/" element={<AppLayoutContainer {...routeProps} />}>
            <Route
              path="/releasenotes"
              element={<ReleaseNotesWindow {...this.props} />}
            >
              <Route
                path="/releasenotes"
                element={<ReleaseNotesScreen {...this.props} />}
              />
            </Route>
            <Route
              path="/settings"
              element={<SettingsWindow {...this.props} />}
            >
              <Route
                path="/settings/recipes"
                element={<RecipesScreen {...this.props} />}
              />
              <Route
                path="/settings/recipes/:filter"
                element={<RecipesScreen {...this.props} />}
              />
              <Route
                path="/settings/services"
                element={<ServicesScreen {...this.props} />}
              />
              <Route
                path="/settings/services/:action/:id"
                element={<EditServiceScreen {...this.props} />}
              />
              <Route
                path={WORKSPACES_ROUTES.ROOT}
                element={<WorkspacesScreen {...this.props} />}
              />
              <Route
                path={WORKSPACES_ROUTES.EDIT}
                element={<EditWorkspaceScreen {...this.props} />}
              />
              <Route
                path="/settings/user"
                element={<AccountScreen {...this.props} />}
              />
              <Route
                path="/settings/user/edit"
                element={<EditUserScreen {...this.props} />}
              />
              <Route
                path="/settings/team"
                element={<TeamScreen {...this.props} />}
              />
              <Route
                path="/settings/app"
                element={<EditSettingsScreen {...this.props} />}
              />
              <Route
                path="/settings/invite"
                element={<InviteSettingsScreen {...this.props} />}
              />
              <Route
                path="/settings/support"
                element={<SupportFerdiumScreen {...this.props} />}
              />
              <Route
                path="/settings/releasenotes"
                element={<ReleaseNotesScreen {...this.props} />}
              />
            </Route>
          </Route>
        </Routes>
      </HistoryRouter>
    );
  }
}

export default FerdiumRoutes;
