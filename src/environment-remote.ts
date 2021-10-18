import { join } from 'path';
import osName from 'os-name';
import { api as electronApi } from './electron-util';
import {
  LIVE_FERDI_API,
  DEV_FRANZ_API,
  LOCAL_API,
  LOCAL_API_WEBSITE,
  DEV_API_FRANZ_WEBSITE,
  LIVE_API_FERDI_WEBSITE,
  LIVE_WS_API,
  LOCAL_WS_API,
  DEV_WS_API,
  LOCAL_TODOS_FRONTEND_URL,
  PRODUCTION_TODOS_FRONTEND_URL,
} from './config';
import {
  chromeVersion,
  electronVersion,
  isWindows,
  nodeVersion,
  osArch,
} from './environment';

// @ts-expect-error Cannot find module './buildInfo.json' or its corresponding type declarations.
import * as buildInfo from './buildInfo.json';

export const { app } = electronApi;
export const ferdiVersion = app.getVersion();
export const ferdiLocale = app.getLocale();

// Set app directory before loading user modules
if (process.env.FERDI_APPDATA_DIR != null) {
  app.setPath('appData', process.env.FERDI_APPDATA_DIR);
  app.setPath('userData', app.getPath('appData'));
} else if (process.env.PORTABLE_EXECUTABLE_DIR != null) {
  app.setPath(
    'appData',
    join(process.env.PORTABLE_EXECUTABLE_DIR, `${app.name}AppData`),
  );
  app.setPath('userData', join(app.getPath('appData'), `${app.name}AppData`));
} else if (isWindows && process.env.APPDATA != null) {
  app.setPath('appData', process.env.APPDATA);
  app.setPath('userData', join(app.getPath('appData'), app.name));
}

export const isDevMode =
  process.env.ELECTRON_IS_DEV !== undefined
    ? Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
    : !app.isPackaged;
if (isDevMode) {
  app.setPath('userData', join(app.getPath('appData'), `${app.name}Dev`));
}

export function userDataPath(...segments: string[]) {
  return join(app.getPath('userData'), ...[segments].flat());
}

export function userDataRecipesPath(...segments: string[]) {
  return userDataPath('recipes', ...[segments].flat());
}

const useLocalAPI = process.env.USE_LOCAL_API;
export const useLiveAPI = process.env.USE_LIVE_API;

let api: string;
let wsApi: string;
let web: string;
let todos: string;
if (!isDevMode || (isDevMode && useLiveAPI)) {
  api = LIVE_FERDI_API;
  wsApi = LIVE_WS_API;
  web = LIVE_API_FERDI_WEBSITE;
  todos = PRODUCTION_TODOS_FRONTEND_URL;
} else if (isDevMode && useLocalAPI) {
  api = LOCAL_API;
  wsApi = LOCAL_WS_API;
  web = LOCAL_API_WEBSITE;
  todos = LOCAL_TODOS_FRONTEND_URL;
} else {
  api = DEV_FRANZ_API;
  wsApi = DEV_WS_API;
  web = DEV_API_FRANZ_WEBSITE;
  todos = PRODUCTION_TODOS_FRONTEND_URL;
}

export const API = api;
export const API_VERSION = 'v1';
export const WS_API = wsApi;
export const WEBSITE = web;
export const TODOS_FRONTEND = todos;

export function aboutAppDetails() {
  return [
    `Version: ${ferdiVersion}`,
    `Electron: ${electronVersion}`,
    `Chrome: ${chromeVersion}`,
    `Node.js: ${nodeVersion}`,
    `Platform: ${osName()}`,
    `Arch: ${osArch}`,
    `Build date: ${new Date(Number(buildInfo.timestamp))}`,
    `Git SHA: ${buildInfo.gitHashShort}`,
    `Git branch: ${buildInfo.gitBranch}`,
  ].join('\n');
}
