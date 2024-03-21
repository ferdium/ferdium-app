import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import type { StoresProps } from '../../../@types/ferdium-components.types';
import ErrorBoundary from '../../../components/util/ErrorBoundary';
import {
  createWorkspaceRequest,
  deleteWorkspaceRequest,
  getUserWorkspacesRequest,
  updateWorkspaceRequest,
} from '../api';
import WorkspacesDashboard from '../components/WorkspacesDashboard';
import { workspaceStore } from '../index';
import type Workspace from '../models/Workspace';

interface IProps extends StoresProps {}

@inject('stores', 'actions')
@observer
class WorkspacesScreen extends Component<IProps> {
  render() {
    const { actions } = this.props;
    return (
      <ErrorBoundary>
        <WorkspacesDashboard
          workspaces={workspaceStore.workspaces}
          getUserWorkspacesRequest={getUserWorkspacesRequest}
          createWorkspaceRequest={createWorkspaceRequest}
          deleteWorkspaceRequest={deleteWorkspaceRequest}
          updateWorkspaceRequest={updateWorkspaceRequest}
          onCreateWorkspaceSubmit={data => actions.workspaces.create(data)}
          onWorkspaceClick={(workspace: Workspace) =>
            actions.workspaces.edit({ workspace })
          }
        />
      </ErrorBoundary>
    );
  }
}

export default WorkspacesScreen;
