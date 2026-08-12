import { clipboard, ipcMain, nativeImage } from 'electron';

export default () => {
  ipcMain.handle('clipboard-write-text', (_event, text: unknown) => {
    if (typeof text !== 'string') {
      return false;
    }

    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle(
    'clipboard-write-image-data-url',
    (_event, dataURL: unknown) => {
      if (typeof dataURL !== 'string') {
        return false;
      }

      clipboard.writeImage(nativeImage.createFromDataURL(dataURL));
      return true;
    },
  );
};
