import type * as DeepLinkingModule from '../src/electron/deepLinking';

jest.mock('../src/environment-remote', () => ({
  protocolClient: 'ferdium',
}));

const { default: handleDeepLink, getDeepLinkFromArgs } = jest.requireActual(
  '../src/electron/deepLinking',
) as typeof DeepLinkingModule;

describe('deepLinking', () => {
  describe('getDeepLinkFromArgs', () => {
    it('ignores Chromium command-line switches', () => {
      expect(
        getDeepLinkFromArgs([
          'Ferdium.exe',
          '--allow-file-access-from-files',
          '--source-app-id',
        ]),
      ).toBeUndefined();
    });

    it('extracts a Ferdium deep link among command-line switches', () => {
      expect(
        getDeepLinkFromArgs([
          'Ferdium.exe',
          '--allow-file-access-from-files',
          'ferdium://service/123',
          '--source-app-id',
        ]),
      ).toBe('ferdium://service/123');
    });

    it('ignores Ferdium task switches', () => {
      expect(
        getDeepLinkFromArgs([
          'Ferdium.exe',
          '--reset-window',
          '--source-app-id',
        ]),
      ).toBeUndefined();
    });
  });

  describe('handleDeepLink', () => {
    it('does not navigate for a non-Ferdium argument', () => {
      const send = jest.fn();
      const window = { webContents: { send } } as any;

      handleDeepLink(window, '--allow-file-access-from-files,--source-app-id');

      expect(send).not.toHaveBeenCalled();
    });

    it('strips the protocol before navigating', () => {
      const send = jest.fn();
      const window = { webContents: { send } } as any;

      handleDeepLink(window, 'ferdium://service/123');

      expect(send).toHaveBeenCalledWith('navigateFromDeepLink', {
        url: 'service/123',
      });
    });
  });
});
