// Note: This file has now become devoid of all references to values deduced from the remote process - all those now live in the `environment-remote.js` file

import { arch, release } from 'os';

export const isMac = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';

export const electronVersion = process.versions.electron;
export const chromeVersion = process.versions.chrome;
export const nodeVersion = process.versions.node;

export const osArch = arch();
export const osRelease = release();
export const is64Bit = osArch.match(/64/);

// for accelerator, show the shortform that electron/OS understands
// for tooltip, show symbol
const ctrlKey = isMac ? '⌘' : 'Ctrl';
const cmdKey = isMac ? 'Cmd' : 'Ctrl';

export const altKey = (isAccelerator = true) =>
  !isAccelerator && isMac ? '⌥' : 'Alt';
export const shiftKey = (isAccelerator = true) =>
  !isAccelerator && isMac ? '⇧' : 'Shift';

// Platform specific shortcut keys
export const cmdOrCtrlShortcutKey = (isAccelerator = true) =>
  isAccelerator ? cmdKey : ctrlKey;
export const lockFerdiShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${shiftKey(isAccelerator)}+L`;
export const todosToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+T`;
export const workspaceToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+D`;
export const muteFerdiShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${shiftKey(isAccelerator)}+M`;
export const addNewServiceShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+N`;
export const settingsShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${isMac ? ',' : 'P'}`;
