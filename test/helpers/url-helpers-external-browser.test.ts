import { mkdtempSync, outputJsonSync, removeSync } from 'fs-extra';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const openExternalMock = jest.fn();
const spawnMock = jest.fn();

jest.mock('electron', () => ({
  shell: {
    openExternal: (...args: unknown[]) => openExternalMock(...args),
  },
}));

jest.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

let userDataDir: string;

jest.mock('../../src/environment-remote', () => ({
  userDataPath: (...segments: string[]) => join(userDataDir, ...segments),
}));

// jest.mock is not hoisted above imports by the esbuild-runner transform, so
// url-helpers has to be loaded after the mocks are registered.
const { openExternalUrl } =
  // eslint-disable-next-line global-require
  require('../../src/helpers/url-helpers') as typeof import('../../src/helpers/url-helpers');

const settingsFile = () => join(userDataDir, 'config', 'settings.json');

describe('openExternalUrl with a custom external browser', () => {
  beforeEach(() => {
    userDataDir = mkdtempSync(join(tmpdir(), 'ferdium-url-helpers-test-'));
    openExternalMock.mockReset();
    spawnMock.mockReset();
    spawnMock.mockReturnValue({ on: jest.fn(), unref: jest.fn() });
  });

  afterEach(() => {
    removeSync(userDataDir);
  });

  it('uses the system default browser when no settings file exists', () => {
    openExternalUrl('https://ferdium.org/');

    expect(openExternalMock).toHaveBeenCalledWith('https://ferdium.org/');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('uses the system default browser when externalBrowserPath is empty', () => {
    outputJsonSync(settingsFile(), { externalBrowserPath: '' });

    openExternalUrl('https://ferdium.org/');

    expect(openExternalMock).toHaveBeenCalledWith('https://ferdium.org/');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('spawns the custom browser when externalBrowserPath is set', () => {
    outputJsonSync(settingsFile(), {
      externalBrowserPath: '/portable/browser',
    });

    openExternalUrl('https://ferdium.org/');

    expect(spawnMock).toHaveBeenCalledWith(
      '/portable/browser',
      ['https://ferdium.org/'],
      { detached: true, stdio: 'ignore' },
    );
    expect(openExternalMock).not.toHaveBeenCalled();
  });

  it('falls back to the system default browser when the custom browser cannot be spawned', () => {
    outputJsonSync(settingsFile(), {
      externalBrowserPath: '/does/not/exist',
    });

    const on = jest.fn();
    spawnMock.mockReturnValue({ on, unref: jest.fn() });
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    openExternalUrl('https://ferdium.org/');
    expect(openExternalMock).not.toHaveBeenCalled();

    // Simulate the async 'error' event emitted for a missing executable
    const errorHandler = on.mock.calls.find(([event]) => event === 'error')[1];
    errorHandler(new Error('spawn ENOENT'));

    expect(openExternalMock).toHaveBeenCalledWith('https://ferdium.org/');
    consoleErrorSpy.mockRestore();
  });

  it('falls back to the system default browser when spawn throws synchronously', () => {
    outputJsonSync(settingsFile(), {
      externalBrowserPath: '/does/not/exist',
    });

    spawnMock.mockImplementation(() => {
      throw new Error('spawn EACCES');
    });
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    openExternalUrl('https://ferdium.org/');

    expect(openExternalMock).toHaveBeenCalledWith('https://ferdium.org/');
    consoleErrorSpy.mockRestore();
  });

  it('does not open invalid urls at all', () => {
    outputJsonSync(settingsFile(), {
      externalBrowserPath: '/portable/browser',
    });

    openExternalUrl('not-a-url');

    expect(spawnMock).not.toHaveBeenCalled();
    expect(openExternalMock).not.toHaveBeenCalled();
  });
});
