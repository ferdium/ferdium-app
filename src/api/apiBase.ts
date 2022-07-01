/**
 * Get API base URL from store
 */
import { API_VERSION } from '../environment-remote';
import {
  DEV_API_FRANZ_WEBSITE,
  LIVE_FRANZ_API,
  LIVE_FERDIUM_API,
  LOCAL_HOSTNAME,
  LOCAL_SERVER,
  SERVER_NOT_LOADED,
} from '../config';
import { fixUrl } from '../helpers/url-helpers';

// Note: This cannot be used from the internal-server since we are not running within the context of a browser window
export default function apiBase(withVersion = true) {
  if (
    !(window as any).ferdium ||
    !(window as any).ferdium.stores.settings ||
    !(window as any).ferdium.stores.settings.all ||
    !(window as any).ferdium.stores.settings.all.app.server
  ) {
    // Stores have not yet been loaded - return SERVER_NOT_LOADED to force a retry when stores are loaded
    return SERVER_NOT_LOADED;
  }
  const url =
    (window as any).ferdium.stores.settings.all.app.server === LOCAL_SERVER
      ? `http://${LOCAL_HOSTNAME}:${
          (window as any).ferdium.stores.requests.localServerPort
        }`
      : (window as any).ferdium.stores.settings.all.app.server;

  return fixUrl(withVersion ? `${url}/${API_VERSION}` : url);
};

export function serverBase() {

  const serverType = (window as any).ferdium.stores.settings.all.app.server;
  const noServer = 'You are using Ferdium without a server';

  let terms;
  switch (serverType) {
    case LIVE_FRANZ_API:
      terms = DEV_API_FRANZ_WEBSITE;
      break;
    case noServer:
      terms = LIVE_FERDIUM_API;
      break;
    default:
      terms = serverType;
  }

  return fixUrl(terms);
}

export function serverName(): string {

  const serverType = (window as any).ferdium.stores.settings.all.app.server;
  const noServer = 'You are using Ferdium without a server';

  let nameServer;
  switch (serverType) {
    case LIVE_FRANZ_API:
      nameServer = 'Franz Server';
      break;
    case LIVE_FERDIUM_API:
      nameServer = 'Ferdium Server';
      break;
    case noServer:
      nameServer = 'no Server';
      break;
    default:
      nameServer = 'a Custom Server';
  }

  return nameServer;
}
