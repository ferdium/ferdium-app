import WorkspacesStore from './store';

export const workspaceStore = new WorkspacesStore();

export default function initWorkspaces(stores, actions) {
  stores.workspaces = workspaceStore;
  workspaceStore.start(stores, actions);
}
