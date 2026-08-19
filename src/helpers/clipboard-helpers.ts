import { ipcRenderer } from 'electron';

export const writeTextToClipboard = (text: string): Promise<boolean> =>
  ipcRenderer.invoke('clipboard-write-text', text);

export const writeImageDataUrlToClipboard = (
  dataURL: string,
): Promise<boolean> =>
  ipcRenderer.invoke('clipboard-write-image-data-url', dataURL);
