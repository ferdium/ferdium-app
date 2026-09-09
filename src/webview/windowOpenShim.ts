// Source of the window.open replacement that recipe.ts injects into a
// service's page world (see the 'inject-js-unsafe' IPC message).
//
// The routing decision has to be made in the page world, and windows the page
// actually wants have to be created with the page's own native window.open.
// A WindowProxy cannot cross the contextBridge: it arrives on the other side
// as a detached plain-object snapshot, so `popup.document`, `popup.closed`
// and friends are dead. Services rely on the genuine handle. Slack, for
// example, renders its huddle / screen-share window into the popup's document
// from the opener and closes the window again when that fails, which is why
// the huddle window used to flash up and disappear (ferdium-app#788).
//
// Only the "open in the default browser" path goes through window.ferdium.open.
// That is a contextBridge function, so the URL is stringified here first; a
// URL object would otherwise arrive as {} and Chromium would open
// "[object Object]".
export const windowOpenShim = `(() => {
  const nativeOpen = window.open;
  const isNonEmptyString = value => typeof value === 'string' && value !== '';
  const openExternally = url => window.ferdium.open(String(url));

  window.open = function open(url, frameName, features) {
    // A target name or window features means the page wants a real window
    // (OAuth popup, Slack huddle window, ...). Let Chromium create it so the
    // page keeps a real WindowProxy; the main process decides whether the
    // request becomes a popup window or goes to the default browser.
    if (isNonEmptyString(frameName) || isNonEmptyString(features)) {
      return nativeOpen.call(window, url, frameName, features);
    }

    // A bare window.open(url) is a link, not a window: open it externally.
    if (url != null && String(url) !== '') {
      openExternally(url);
      return null;
    }

    // No URL and no features (used by e.g. Skype): hand back a placeholder and
    // forward the URL to the default browser once the page has assigned it.
    const placeholder = { location: { href: '' } };
    const poll = setInterval(() => {
      if (placeholder.location.href !== '') {
        clearInterval(poll);
        openExternally(placeholder.location.href);
      }
    }, 0);
    setTimeout(() => clearInterval(poll), 1000);
    return placeholder;
  };
})();`;
