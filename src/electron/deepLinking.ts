export default function handleDeepLink(window, rawUrl) {
  const url = rawUrl.replace('ferdium://', '');

  if (!url) return;

  window.webContents.send('navigateFromDeepLink', { url });
}
