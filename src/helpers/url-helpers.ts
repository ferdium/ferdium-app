// This is taken from: https://benjamin-altpeter.de/shell-openexternal-dangers/

import { URL } from 'url';
import { ensureDirSync, existsSync } from 'fs-extra';
import { shell } from 'electron';

import { ALLOWED_PROTOCOLS } from '../config';

const debug = require('debug')('Ferdium:Helpers:url');

export function isValidExternalURL(url: string | URL) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.toString());
  } catch {
    return false;
  }

  const isAllowed = ALLOWED_PROTOCOLS.includes(parsedUrl.protocol);

  debug('protocol check is', isAllowed, 'for:', url);

  return isAllowed;
}

export function isValidFileUrl(path: string) {
  return path.startsWith('file') && existsSync(new URL(path));
}

export async function openPath(folderName: string) {
  ensureDirSync(folderName);
  shell.openPath(folderName);
}

// TODO: Need to verify and fix/remove the skipping logic. Ideally, we should never skip this check
export function openExternalUrl(
  url: string | URL,
  skipValidityCheck: boolean = false,
) {
  debug('Open url:', url, 'with skipValidityCheck:', skipValidityCheck);
  if (skipValidityCheck || isValidExternalURL(url)) {
    shell.openExternal(url.toString());
  }
}
