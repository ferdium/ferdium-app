/*
  eslint-disable global-require --
  This file contains a workaround for situations were global require is problematic.
*/

/**
 * Make sure we don't try to load `debug` in the preload script.
 *
 * Doing so would trigger the bug https://github.com/electron/electron/issues/31689
 * because `debug` will try to access `localStorage` to save the log level:
 * https://www.npmjs.com/package/debug#user-content-browser-support
 *
 * We check for the presence of `ipcRenderer`, a render-only electron API,
 * to detect whether we're in the renderer process.
 * We serve the user interface from the `file://` origin, so any different origin
 * must be a preload script.
 */
module.exports = function debug(namespace: string): (...params: any[]) => void {
  if ('ipcRenderer' in require('electron') && window.origin !== 'file://') {
    // Only output debug messages to the console if debugging is requested.
    // We don't reimplement the matching algorithm from `debug` and just dump all
    // messages to the console if some form of `Ferdium` debugging is enabled.
    if (process.env.DEBUG?.startsWith('Ferdium:')) {
      return (...params) => console.debug(`[${namespace}]`, ...params);
    }
    return () => { };
  }
  return require('debug')(namespace);
}
