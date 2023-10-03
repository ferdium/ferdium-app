import { join } from 'node:path';
import { api as electronApi } from './electron-util';
import {
  LIVE_FERDIUM_API,
  DEV_FRANZ_API,
  LOCAL_API,
  LOCAL_API_WEBSITE,
  DEV_API_FRANZ_WEBSITE,
  LIVE_API_FERDIUM_WEBSITE,
  LIVE_WS_API,
  LOCAL_WS_API,
  DEV_WS_API,
  LOCAL_TODOS_FRONTEND_URL,
  PRODUCTION_TODOS_FRONTEND_URL,
} from './config';
import { isWindows } from './environment';

export const { app } = electronApi;
export const ferdiumVersion: string = app.getVersion();
export const ferdiumLocale: string = app.getLocale();

// Set app directory before loading user modules
if (process.env.FERDIUM_APPDATA_DIR != null) {
  app.setPath('appData', process.env.FERDIUM_APPDATA_DIR);
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

export const isDevMode: boolean =
  process.env.ELECTRON_IS_DEV === undefined
    ? !app.isPackaged
    : Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
if (isDevMode) {
  app.setPath('userData', join(app.getPath('appData'), `${app.name}Dev`));
}

export function userDataPath(...segments: string[]): string {
  return join(app.getPath('userData'), ...[segments].flat());
}

export function userDataRecipesPath(...segments: string[]): string {
  return userDataPath('recipes', ...[segments].flat());
}

const useLocalAPI = process.env.USE_LOCAL_API;
export const useLiveAPI = process.env.USE_LIVE_API;

let api: string;
let wsApi: string;
let web: string;
let todos: string;
if (!isDevMode || (isDevMode && useLiveAPI)) {
  api = LIVE_FERDIUM_API;
  wsApi = LIVE_WS_API;
  web = LIVE_API_FERDIUM_WEBSITE;
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

export const API: string = api;
export const API_VERSION: string = 'v1';
export const WS_API: string = wsApi;
export const WEBSITE: string = web;
export const TODOS_FRONTEND: string = todos;
