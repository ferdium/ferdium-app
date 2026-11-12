import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  setUniqueSavePath,
  uniqueSavePath,
} from '../../src/electron/downloadSavePath';

const fakeDownload = (filename: string) => {
  const doneListeners: (() => void)[] = [];
  return {
    getFilename: () => filename,
    setSavePath: jest.fn(),
    once: (_eventName: 'done', listener: () => void) => {
      doneListeners.push(listener);
    },
    finish: () => {
      for (const listener of doneListeners.splice(0)) {
        listener();
      }
    },
  };
};

describe('uniqueSavePath', () => {
  let folder: string;

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'ferdium-downloads-'));
  });

  afterEach(() => {
    rmSync(folder, { recursive: true, force: true });
  });

  it('keeps the file name when it is not taken', () => {
    expect(uniqueSavePath(folder, 'photo.jpg')).toBe(join(folder, 'photo.jpg'));
  });

  it('adds a number before the extension when the file exists', () => {
    writeFileSync(join(folder, 'photo.jpg'), '');
    expect(uniqueSavePath(folder, 'photo.jpg')).toBe(
      join(folder, 'photo (1).jpg'),
    );

    writeFileSync(join(folder, 'photo (1).jpg'), '');
    expect(uniqueSavePath(folder, 'photo.jpg')).toBe(
      join(folder, 'photo (2).jpg'),
    );
  });

  it('handles file names without an extension', () => {
    writeFileSync(join(folder, 'README'), '');
    writeFileSync(join(folder, '.env'), '');
    expect(uniqueSavePath(folder, 'README')).toBe(join(folder, 'README (1)'));
    expect(uniqueSavePath(folder, '.env')).toBe(join(folder, '.env (1)'));
  });
});

describe('setUniqueSavePath', () => {
  let folder: string;

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'ferdium-downloads-'));
  });

  afterEach(() => {
    rmSync(folder, { recursive: true, force: true });
  });

  it('does not overwrite an existing file in the download folder', () => {
    writeFileSync(join(folder, 'photo.jpg'), 'first');
    const download = fakeDownload('photo.jpg');

    setUniqueSavePath(download, folder);

    expect(download.setSavePath).toHaveBeenCalledWith(
      join(folder, 'photo (1).jpg'),
    );
  });

  it('gives downloads with the same name that run at the same time their own file', () => {
    const first = fakeDownload('photo.jpg');
    const second = fakeDownload('photo.jpg');

    setUniqueSavePath(first, folder);
    setUniqueSavePath(second, folder);

    expect(first.setSavePath).toHaveBeenCalledWith(join(folder, 'photo.jpg'));
    expect(second.setSavePath).toHaveBeenCalledWith(
      join(folder, 'photo (1).jpg'),
    );

    first.finish();
    second.finish();
  });

  it('frees the name of a download that did not leave a file', () => {
    const cancelled = fakeDownload('report.pdf');
    setUniqueSavePath(cancelled, folder);
    cancelled.finish();

    const next = fakeDownload('report.pdf');
    setUniqueSavePath(next, folder);

    expect(next.setSavePath).toHaveBeenCalledWith(join(folder, 'report.pdf'));
    next.finish();
  });

  it('sets the path only once when several listeners handle the same download', () => {
    const download = fakeDownload('photo.jpg');

    setUniqueSavePath(download, folder);
    setUniqueSavePath(download, folder);

    expect(download.setSavePath).toHaveBeenCalledTimes(1);
    expect(download.setSavePath).toHaveBeenCalledWith(
      join(folder, 'photo.jpg'),
    );
    download.finish();
  });
});
