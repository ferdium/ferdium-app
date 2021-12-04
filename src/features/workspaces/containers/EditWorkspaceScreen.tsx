import { Component } from 'react';
import { inject, observer } from 'mobx-react';

import ErrorBoundary from '../../../components/util/ErrorBoundary';
import EditWorkspaceForm from '../components/EditWorkspaceForm';
import Workspace from '../models/Workspace';
import { workspaceStore } from '../index';
import { deleteWorkspaceRequest, updateWorkspaceRequest } from '../api';
import { ServicesStore, WorkspacesStore } from '../../../stores.types';

type Props = {
  actions: {
    workspaces: WorkspacesStore;
  };
  stores: {
    services: ServicesStore;
  };
};

class EditWorkspaceScreen extends Component<Props> {
  // @ts-expect-error Not all code paths return a value.
  onDelete = () => {
    const { workspaceBeingEdited } = workspaceStore;
    const { actions } = this.props;
    if (!workspaceBeingEdited) return null;
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
