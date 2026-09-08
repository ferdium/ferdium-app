import { ClipboardItem, clipboard, ipcMain, nativeImage } from 'electron';

export default () => {
  ipcMain.handle('clipboard-write-text', async (_event, text: unknown) => {
    if (typeof text !== 'string') {
      return false;
    }

    await clipboard.writeText(text);
    return true;
  });

  ipcMain.handle(
    'clipboard-write-image-data-url',
    async (_event, dataURL: unknown) => {
      if (typeof dataURL !== 'string') {
        return false;
      }

      const image = nativeImage.createFromDataURL(dataURL);
      await clipboard.write([
        new ClipboardItem({
          'image/png': new Blob([image.toPNG()], { type: 'image/png' }),
        }),
      ]);
      return true;
    },
  );
};
