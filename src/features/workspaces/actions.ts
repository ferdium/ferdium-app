import PropTypes from 'prop-types';
import { createActionsFromDefinitions } from '../../actions/lib/actions';
import Workspace from './models/Workspace';

type WorkspaceArg = { workspace: Workspace };

interface WorkspaceActions {
  openWorkspaceSettings: () => void;
  toggleWorkspaceDrawer: () => void;
  deactivate: () => void;
  activate: (options: any) => void;
  edit: (workspaceArg: WorkspaceArg) => void;
  create: ({ name }: { name: string }) => void;
  delete: (workspaceArg: WorkspaceArg) => void;
  update: (workspaceArg: WorkspaceArg) => void;
  toggleKeepAllWorkspacesLoadedSetting: () => void;
  reorder: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
  saveIcon: ({ workspaceId, iconPath }: { workspaceId: string; iconPath: string }) => void;
  deleteIcon: ({ workspaceId }: { workspaceId: string }) => void;
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
    reorder: {
      oldIndex: PropTypes.number.isRequired,
      newIndex: PropTypes.number.isRequired,
    },
    saveIcon: {
      workspaceId: PropTypes.string.isRequired,
      iconPath: PropTypes.string.isRequired,
    },
    deleteIcon: {
      workspaceId: PropTypes.string.isRequired,
    },
  },
  PropTypes.checkPropTypes,
);
