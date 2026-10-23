import type { BrowserWindow } from 'electron';

import { protocolClient } from '../environment-remote';

const protocolPrefix = `${protocolClient}://`;

export function getDeepLinkFromArgs(args: string[]): string | undefined {
  return args.find(arg => arg.startsWith(protocolPrefix));
}

export function getExternalUrlFromArgs(args: string[]): string | undefined {
  return args.find(arg => /^https?:\/\//i.test(arg));
}

export function handleExternalUrl(window: BrowserWindow, url: string): void {
  window.webContents.send('openUrlInService', { url });
}

export default function handleDeepLink(
  window: BrowserWindow,
  rawUrl: string,
): void {
  if (!rawUrl.startsWith(protocolPrefix)) {
    return;
  }

  const url = rawUrl.slice(protocolPrefix.length);

  if (!url) {
    return;
  }

  window.webContents.send('navigateFromDeepLink', { url });
}

/**
 * Handles the command-line arguments Ferdium was launched with, or that a second
 * instance passed on: a Ferdium deep link navigates, and otherwise an http(s) url
 * is opened in the service it belongs to.
 */
export function handleLaunchArgs(window: BrowserWindow, args: string[]): void {
  const deepLink = getDeepLinkFromArgs(args);

  if (deepLink) {
    handleDeepLink(window, deepLink);

    return;
  }

  const externalUrl = getExternalUrlFromArgs(args);

  if (externalUrl) {
    handleExternalUrl(window, externalUrl);
  }
}
