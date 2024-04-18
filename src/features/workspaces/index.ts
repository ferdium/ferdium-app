import WorkspacesStore from './store';

export const workspaceStore = new WorkspacesStore();

export default function initWorkspaces(stores, actions) {
  // eslint-disable-next-line no-param-reassign
  stores.workspaces = workspaceStore;
  workspaceStore.start(stores, actions);
}
