import PropTypes from 'prop-types';
import Workspace from './models/Workspace';
import { createActionsFromDefinitions } from '../../actions/lib/actions';

export interface WorkspaceActions {
  openWorkspaceSettings: () => void;
  toggleWorkspaceDrawer: () => void;
  deactivate: () => void;
  activate: (options: any) => void;
  edit: ({ workspace }: { workspace: Workspace }) => void;
}

export default createActionsFromDefinitions<WorkspaceActions>(
  {
    edit: {
      workspace: PropTypes.instanceOf(Workspace).isRequired,
    },
    create: {
      name: PropTypes.string.isRequired,
    },
    delete: {
      workspace: PropTypes.instanceOf(Workspace).isRequired,
    },
    update: {
      workspace: PropTypes.instanceOf(Workspace).isRequired,
    },
    activate: {
      workspace: PropTypes.instanceOf(Workspace).isRequired,
    },
    deactivate: {},
    toggleWorkspaceDrawer: {},
    openWorkspaceSettings: {},
    toggleKeepAllWorkspacesLoadedSetting: {},
  },
  PropTypes.checkPropTypes,
);
