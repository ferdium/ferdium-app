import { inject, observer } from 'mobx-react';
import { Component } from 'react';

import type { StoresProps } from '../../../@types/ferdium-components.types';
import ErrorBoundary from '../../../components/util/ErrorBoundary';
import { deleteWorkspaceRequest, updateWorkspaceRequest } from '../api';
import EditWorkspaceForm from '../components/EditWorkspaceForm';
import { workspaceStore } from '../index';
import Workspace from '../models/Workspace';

class EditWorkspaceScreen extends Component<StoresProps> {
  onDelete = () => {
    const { workspaceBeingEdited } = workspaceStore;
    const { actions } = this.props;
    if (!workspaceBeingEdited) return;
    actions.workspaces.delete({ workspace: workspaceBeingEdited });
  };

  onSave = values => {
    const { workspaceBeingEdited } = workspaceStore;
    const { actions } = this.props;
    const workspace = new Workspace({
      saving: true,
      ...workspaceBeingEdited,
      ...values,
    });
    actions.workspaces.update({ workspace });
  };

  render() {
    const { workspaceBeingEdited } = workspaceStore;
    const { stores } = this.props;
    if (!workspaceBeingEdited) return null;
    return (
      <ErrorBoundary>
        <EditWorkspaceForm
          workspace={workspaceBeingEdited}
          services={stores.services.all}
          onDelete={this.onDelete}
          onSave={this.onSave}
          updateWorkspaceRequest={updateWorkspaceRequest}
          deleteWorkspaceRequest={deleteWorkspaceRequest}
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(EditWorkspaceScreen));
