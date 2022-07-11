import { BrowserWindow } from 'electron';

export default function handleDeepLink(
  window: BrowserWindow,
  rawUrl: string,
): void {
  const url = rawUrl.replace('ferdium://', '');

  if (!url) return;

  window.webContents.send('navigateFromDeepLink', { url });
}
