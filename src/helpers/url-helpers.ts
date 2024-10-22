// This is taken from: https://benjamin-altpeter.de/shell-openexternal-dangers/
import { URL } from 'node:url';
import { shell } from 'electron';
import { ensureDirSync, existsSync } from 'fs-extra';
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

// TODO: Need to verify and fix/remove the skipping logic. Ideally, we should never skip this check
export const openExternalUrl = (
  url: string | URL,
  skipValidityCheck: boolean = false,
): void => {
  const fixedUrl = fixUrl(url.toString());
  debug('Open url:', fixedUrl, 'with skipValidityCheck:', skipValidityCheck);
  if (skipValidityCheck || isValidExternalURL(fixedUrl)) {
    shell.openExternal(fixedUrl.toString());
  }
};

export const normalizedUrl = (url: string) => {
  return normalizeUrl(url, {
    stripAuthentication: false,
    stripWWW: false,
    removeTrailingSlash: false,
  });
};
