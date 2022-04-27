/**
 * Get API base URL from store
 */
import { API_VERSION } from '../environment-remote';
import {
  DEV_API_FRANZ_WEBSITE,
  LIVE_FRANZ_API,
  LOCAL_HOSTNAME,
  LOCAL_SERVER,
  SERVER_NOT_LOADED,
} from '../config';

// Note: This cannot be used from the internal-server since we are not running within the context of a browser window
const apiBase = (withVersion = true) => {
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

  return withVersion ? `${url}/${API_VERSION}` : url;
};

export default apiBase;

export function termsBase() {
  return (window as any).ferdium.stores.settings.all.app.server !== LIVE_FRANZ_API
    ? (window as any).ferdium.stores.settings.all.app.server
    : DEV_API_FRANZ_WEBSITE;
}
