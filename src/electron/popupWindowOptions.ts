import type { BrowserWindowConstructorOptions } from 'electron';

// Chromium hands the raw window.open() features string to Electron, which
// turns every `key=value` pair into a BrowserWindow constructor option
// (electron/lib/browser/parse-features-string.ts). Browsers only honour a
// handful of size and position features, but pages that also run inside
// Electron-based desktop apps pass Electron options too. Slack, for example,
// opens its huddle window with `show=no,alwaysOnTop=yes,fullscreenable=no,...`
// and shows the window later through its own desktop bridge; without that
// bridge the popup simply stays invisible (ferdium-app#788). These helpers
// normalise the options so a popup opened by a service always behaves like a
// popup opened in a browser.

export const parseWindowFeatures = (
  features = '',
): Record<string, string | undefined> => {
  const parsed: Record<string, string | undefined> = {};
  for (const pair of features.split(',')) {
    const [key, value] = pair.split('=').map(part => part.trim());
    if (key) {
      parsed[key] = value;
    }
  }
  return parsed;
};

const parseCoordinate = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const popupWindowOptions = (
  features: string | undefined,
  isPositionOnScreen: (position: { x: number; y: number }) => boolean,
): BrowserWindowConstructorOptions => {
  const parsed = parseWindowFeatures(features);

  const options: BrowserWindowConstructorOptions = {
    // Options a web page must not be able to control. Electron spreads these
    // over the parsed features, so every one of them has to be set explicitly.
    show: true,
    alwaysOnTop: false,
    frame: true,
    transparent: false,
    skipTaskbar: false,
    focusable: true,
    kiosk: false,
    fullscreen: false,
    simpleFullscreen: false,
    modal: false,
    opacity: 1,
    closable: true,
    minimizable: true,
    maximizable: true,
    movable: true,
    enableLargerThanScreen: false,
    hasShadow: true,
    titleBarStyle: 'default',
    // Let the user maximize / fullscreen e.g. a shared screen even when the
    // page asked for `fullscreenable=no`.
    fullscreenable: true,
  };

  // Pages remember where their popup was last time; if that position is not
  // on a connected display any more, let Electron center the window instead.
  const x = parseCoordinate(parsed.x ?? parsed.left);
  const y = parseCoordinate(parsed.y ?? parsed.top);
  if (x !== undefined && y !== undefined && !isPositionOnScreen({ x, y })) {
    options.x = undefined;
    options.y = undefined;
  }

  return options;
};
