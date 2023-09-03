import { BrowserWindow } from 'electron';
import { protocolClient } from '../environment-remote';

export default function handleDeepLink(
  window: BrowserWindow,
  rawUrl: string,
): void {
  if (!rawUrl) {
    return;
  }

  const url = rawUrl.replace(`${protocolClient}://`, '');

  // The next line is a workaround after this 71c5237 [chore: Mobx & React-Router upgrade (#406)].
  // For some reason, the app won't start until because it's trying to route to './build'.
  // TODO: Check what is wrong with DeepLinking - it is broken for some reason. This is causing several troubles.
  const workaroundDeepLink = ['./build', '--allow-file-access-from-files'];

  if (!url || workaroundDeepLink.includes(url)) return;

  window.webContents.send('navigateFromDeepLink', { url });
}
