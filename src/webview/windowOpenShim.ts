// Source of the window.open replacement injected into a service's page
// world. window.ferdium.open is a contextBridge function, so a URL object
// passed to window.open would cross the bridge as {} and Chromium would
// then open "[object Object]"; stringify it here, in the page world,
// before it reaches the bridge. null/undefined are left as they are.
export const windowOpenShim =
  'window.open = (url, frameName, features) => window.ferdium.open(url == null ? url : String(url), frameName, features);';
