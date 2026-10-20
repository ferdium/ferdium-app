import type * as DeepLinkingModule from '../src/electron/deepLinking';

jest.mock('../src/environment-remote', () => ({
  protocolClient: 'ferdium',
}));

const {
  default: handleDeepLink,
  getDeepLinkFromArgs,
  getExternalUrlFromArgs,
  handleExternalUrl,
  handleLaunchArgs,
} = jest.requireActual(
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

  describe('getExternalUrlFromArgs', () => {
    it('extracts an https url among command-line switches', () => {
      expect(
        getExternalUrlFromArgs([
          '/opt/Ferdium/ferdium',
          '--no-sandbox',
          'https://testorg.slack.com/archives/C0123456789/p1700000000000000',
        ]),
      ).toBe(
        'https://testorg.slack.com/archives/C0123456789/p1700000000000000',
      );
    });

    it('extracts an http url', () => {
      expect(
        getExternalUrlFromArgs(['/opt/Ferdium/ferdium', 'http://t.me/ferdium']),
      ).toBe('http://t.me/ferdium');
    });

    it('extracts an app link of a service', () => {
      expect(
        getExternalUrlFromArgs([
          '/opt/Ferdium/ferdium',
          '--no-sandbox',
          'slack://channel?team=T0123456789&id=C0123456789',
        ]),
      ).toBe('slack://channel?team=T0123456789&id=C0123456789');
    });

    it('ignores Ferdium deep links and other arguments', () => {
      expect(
        getExternalUrlFromArgs([
          '/opt/Ferdium/ferdium',
          '--no-sandbox',
          'ferdium://service/123',
          './build',
        ]),
      ).toBeUndefined();
    });
  });

  describe('handleExternalUrl', () => {
    it('asks the renderer to open the url in a service', () => {
      const send = jest.fn();
      const window = { webContents: { send } } as any;

      handleExternalUrl(window, 'https://t.me/ferdium');

      expect(send).toHaveBeenCalledWith('openUrlInService', {
        url: 'https://t.me/ferdium',
      });
    });
  });

  describe('handleLaunchArgs', () => {
    it('navigates for a Ferdium deep link', () => {
      const send = jest.fn();
      const window = { webContents: { send } } as any;

      handleLaunchArgs(window, [
        '/opt/Ferdium/ferdium',
        'ferdium://service/123',
      ]);

      expect(send).toHaveBeenCalledWith('navigateFromDeepLink', {
        url: 'service/123',
      });
    });

    it('opens an external url in a service', () => {
      const send = jest.fn();
      const window = { webContents: { send } } as any;

      handleLaunchArgs(window, [
        '/opt/Ferdium/ferdium',
        'https://t.me/ferdium',
      ]);

      expect(send).toHaveBeenCalledWith('openUrlInService', {
        url: 'https://t.me/ferdium',
      });
    });

    it('does nothing without a deep link or url', () => {
      const send = jest.fn();
      const window = { webContents: { send } } as any;

      handleLaunchArgs(window, ['/opt/Ferdium/ferdium', '--no-sandbox']);

      expect(send).not.toHaveBeenCalled();
    });
  });
});
