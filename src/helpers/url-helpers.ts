// This is taken from: https://benjamin-altpeter.de/shell-openexternal-dangers/
import { spawn } from 'node:child_process';
import { URL } from 'node:url';
import { shell } from 'electron';
import { ensureDirSync, existsSync, readJsonSync } from 'fs-extra';
import normalizeUrl from 'normalize-url';
import { ALLOWED_PROTOCOLS } from '../config';

const debug = require('../preload-safe-debug')('Ferdium:Helpers:url');

export const isValidExternalURL = (url: string | URL): boolean => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.toString());
  } catch {
    return false;
  }

  const isAllowed = ALLOWED_PROTOCOLS.includes(parsedUrl.protocol);
  debug('protocol check is', isAllowed, 'for:', url);

  return isAllowed;
};

export const fixUrl = (url: string | URL): string => {
  return url
    .toString()
    .replaceAll('//', '/')
    .replaceAll('http:/', 'http://')
    .replaceAll('https:/', 'https://')
    .replaceAll('file:/', 'file://');
};

export const isValidFileUrl = (path: string): boolean => {
  return path.startsWith('file') && existsSync(new URL(path));
};

export async function openPath(folderName: string): Promise<void> {
  ensureDirSync(folderName);
  shell.openPath(folderName);
}

// Reads the settings file directly so this works in the main process, the
// renderer and the webview preload without extra wiring.
const getExternalBrowserPath = (): string => {
  try {
    // eslint-disable-next-line global-require
    const { userDataPath } = require('../environment-remote');
    const settingsFile = userDataPath('config', 'settings.json');
    if (!existsSync(settingsFile)) {
      return '';
    }

    const settings = readJsonSync(settingsFile);
    return typeof settings.externalBrowserPath === 'string'
      ? settings.externalBrowserPath.trim()
      : '';
  } catch (error) {
    debug('Could not read custom browser path from settings', error);
    return '';
  }
};

const openWithExternalBrowser = (browserPath: string, url: string): void => {
  debug('Open url:', url, 'with custom browser:', browserPath);
  const fallback = (error: Error) => {
    console.error(
      `Could not open '${url}' with the custom browser '${browserPath}', falling back to the system default browser`,
      error,
    );
    shell.openExternal(url);
  };

  try {
    const browserProcess = spawn(browserPath, [url], {
      detached: true,
      stdio: 'ignore',
    });
    // A missing 'error' listener would turn a bad executable path into an
    // uncaught exception that crashes the whole app.
    browserProcess.on('error', fallback);
    browserProcess.unref();
  } catch (error) {
    fallback(error as Error);
  }
};

// TODO: Need to verify and fix/remove the skipping logic. Ideally, we should never skip this check
export const openExternalUrl = (
  url: string | URL,
  skipValidityCheck: boolean = false,
): void => {
  const fixedUrl = fixUrl(url.toString());
  debug('Open url:', fixedUrl, 'with skipValidityCheck:', skipValidityCheck);
  if (skipValidityCheck || isValidExternalURL(fixedUrl)) {
    const browserPath = getExternalBrowserPath();
    if (browserPath === '') {
      shell.openExternal(fixedUrl.toString());
    } else {
      openWithExternalBrowser(browserPath, fixedUrl.toString());
    }
  }
};

export const normalizedUrl = (url: string) => {
  return normalizeUrl(url, {
    stripAuthentication: false,
    stripWWW: false,
    removeTrailingSlash: false,
  });
};
