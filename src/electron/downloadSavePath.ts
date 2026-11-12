import { extname, join } from 'node:path';
import { existsSync } from 'fs-extra';

// Electron saves a download to the path given to setSavePath() without
// checking whether that file already exists, so with a download folder set in
// the settings every download with the same file name overwrote the previous
// one (ferdium-app#2135). Pick a free name the way browsers do, with " (1)",
// " (2)", ... before the extension. The path of a download that is still
// running stays reserved until it is done, because its file only shows up
// under the final name at the end.

type DownloadItemLike = {
  getFilename: () => string;
  setSavePath: (path: string) => void;
  once: (eventName: 'done', listener: () => void) => unknown;
};

const reservedPaths = new Set<string>();

// A will-download listener is added for every service webview that is
// created, so a session can have several and the same download can be handed
// to this function more than once.
const handledItems = new WeakSet<DownloadItemLike>();

const isTaken = (path: string): boolean =>
  existsSync(path) || reservedPaths.has(path);

export const uniqueSavePath = (folder: string, filename: string): string => {
  const extension = extname(filename);
  const name = filename.slice(0, filename.length - extension.length);

  let savePath = join(folder, filename);
  let counter = 0;
  while (isTaken(savePath)) {
    counter += 1;
    savePath = join(folder, `${name} (${counter})${extension}`);
  }
  return savePath;
};

export const setUniqueSavePath = (
  item: DownloadItemLike,
  folder: string,
): void => {
  if (handledItems.has(item)) {
    return;
  }
  handledItems.add(item);

  const savePath = uniqueSavePath(folder, item.getFilename());
  reservedPaths.add(savePath);
  item.once('done', () => {
    reservedPaths.delete(savePath);
  });
  item.setSavePath(savePath);
};
