import type { BrowserWindow } from 'electron';

import { protocolClient } from '../environment-remote';

const protocolPrefix = `${protocolClient}://`;

export function getDeepLinkFromArgs(args: string[]): string | undefined {
  return args.find(arg => arg.startsWith(protocolPrefix));
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
