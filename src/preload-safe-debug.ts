/**
 * Make sure we don't try to load `debug` in the preload script.
 *
 * Doing so would trigger the bug https://github.com/electron/electron/issues/31689
 * because `debug` will try to access `localStorage` to save the log level:
 * https://www.npmjs.com/package/debug#user-content-browser-support
 *
 * We disable the `debug` package in context isolated renderers,
 * because they correspond to preload scripts.
 */
module.exports = function debug(namespace: string): (...params: any[]) => void {
  if (
    typeof process === 'object' &&
    'contextIsolated' in process &&
    (process as unknown as { contextIsolated: string }).contextIsolated
  ) {
    // Only output debug messages to the console if debugging is requested.
    // We don't reimplement the matching algorithm from `debug` and just dump all
    // messages to the console if some form of `Ferdium` debugging is enabled.
    if (process.env.DEBUG?.startsWith('Ferdium:')) {
      return (...params) => console.debug(`[${namespace}]`, ...params);
    }
    return () => {};
  }
  /*
    eslint-disable-next-line global-require --
    This file contains a workaround for situations were global require is problematic.
  */
  return require('debug')(namespace);
};
