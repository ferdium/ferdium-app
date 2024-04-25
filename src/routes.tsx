import type { HashHistory } from 'history';
import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  unstable_HistoryRouter as HistoryRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import type { StoresProps } from './@types/ferdium-components.types';
import type { Actions } from './actions/lib/actions';
import AuthLayoutContainer from './containers/auth/AuthLayoutContainer';
import AuthReleaseNotesScreen from './containers/auth/AuthReleaseNotesScreen';
import ChangeServerScreen from './containers/auth/ChangeServerScreen';
import InviteScreen from './containers/auth/InviteScreen';
import LoginScreen from './containers/auth/LoginScreen';
import PasswordScreen from './containers/auth/PasswordScreen';
import SetupAssistantScreen from './containers/auth/SetupAssistantScreen';
import SignupScreen from './containers/auth/SignupScreen';
import WelcomeScreen from './containers/auth/WelcomeScreen';
import DownloadManagerScreen from './containers/download-manager/DownloadManagerScreen';
import DownloadManagerWindow from './containers/download-manager/DownloadManagerWindow';
import AppLayoutContainer from './containers/layout/AppLayoutContainer';
import AccountScreen from './containers/settings/AccountScreen';
import EditServiceScreen from './containers/settings/EditServiceScreen';
import EditSettingsScreen from './containers/settings/EditSettingsScreen';
import EditUserScreen from './containers/settings/EditUserScreen';
import InviteSettingsScreen from './containers/settings/InviteScreen';
import RecipesScreen from './containers/settings/RecipesScreen';
import ReleaseNotesScreen from './containers/settings/ReleaseNotesScreen';
import ReleaseNotesWindow from './containers/settings/ReleaseNotesWindow';
import ServicesScreen from './containers/settings/ServicesScreen';
import SettingsWindow from './containers/settings/SettingsWindow';
import SupportFerdiumScreen from './containers/settings/SupportScreen';
import TeamScreen from './containers/settings/TeamScreen';
import { WORKSPACES_ROUTES } from './features/workspaces/constants';
import EditWorkspaceScreen from './features/workspaces/containers/EditWorkspaceScreen';
import WorkspacesScreen from './features/workspaces/containers/WorkspacesScreen';
import type { RealStores } from './stores';

interface IProps {
  history: HashHistory;
  actions?: Actions;
  stores?: RealStores;
}

@inject('stores', 'actions')
@observer
class FerdiumRoutes extends Component<IProps> {
  render(): ReactElement {
    const { history, stores, actions } = this.props;
    const routeProps: StoresProps = { stores: stores!, actions: actions! };
    const errorProps = { error: routeProps.stores.globalError.error || {} };

    return (
      // @ts-expect-error Fix me
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
                path="/auth/signup/setup"
                element={<SetupAssistantScreen {...routeProps} />}
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
                // @ts-expect-error Fix me
                element={<ReleaseNotesScreen {...this.props} />}
              />
            </Route>
            <Route
              path="/downloadmanager"
              element={<DownloadManagerWindow {...this.props} />}
            >
              <Route
                path="/downloadmanager"
                element={<DownloadManagerScreen {...this.props} />}
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
                // @ts-expect-error Fix me
                element={<ServicesScreen {...this.props} />}
              />
              <Route
                path="/settings/services/:action/:id"
                element={<EditServiceScreen {...this.props} />}
              />
              <Route
                path={WORKSPACES_ROUTES.ROOT}
                // @ts-expect-error Fix me
                element={<WorkspacesScreen {...this.props} />}
              />
              <Route
                path={WORKSPACES_ROUTES.EDIT}
                // @ts-expect-error Fix me
                element={<EditWorkspaceScreen {...this.props} />}
              />
              <Route
                path="/settings/user"
                // @ts-expect-error Fix me
                element={<AccountScreen {...this.props} />}
              />
              <Route
                path="/settings/user/edit"
                // @ts-expect-error Fix me
                element={<EditUserScreen {...this.props} />}
              />
              <Route
                path="/settings/team"
                // @ts-expect-error Fix me
                element={<TeamScreen {...this.props} />}
              />
              <Route
                path="/settings/app"
                // @ts-expect-error Fix me
                element={<EditSettingsScreen {...this.props} />}
              />
              <Route
                path="/settings/invite"
                // @ts-expect-error Fix me
                element={<InviteSettingsScreen {...this.props} />}
              />
              <Route
                path="/settings/support"
                // @ts-expect-error Fix me
                element={<SupportFerdiumScreen {...this.props} />}
              />
              <Route
                path="/settings/releasenotes"
                // @ts-expect-error Fix me
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
