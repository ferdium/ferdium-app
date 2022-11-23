import PropTypes from 'prop-types';
import Workspace from './models/Workspace';
import { createActionsFromDefinitions } from '../../actions/lib/actions';

type WorkspaceArg = { workspace: Workspace };
export interface WorkspaceActions {
  openWorkspaceSettings: () => void;
  toggleWorkspaceDrawer: () => void;
  deactivate: () => void;
  activate: (options: any) => void;
  edit: (workspaceArg: WorkspaceArg) => void;
  create: ({ name }: { name: string }) => void;
  delete: (workspaceArg: WorkspaceArg) => void;
  update: (workspaceArg: WorkspaceArg) => void;
  toggleKeepAllWorkspacesLoadedSetting: () => void;
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
