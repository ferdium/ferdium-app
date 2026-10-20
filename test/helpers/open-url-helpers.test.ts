import { findServiceForUrl } from '../../src/helpers/open-url-helpers';

const service = (name: string, url: string) => ({ name, url });

describe('open_url_helpers', () => {
  describe('findServiceForUrl', () => {
    it('matches the service with the same host as the url', () => {
      const testOrg = service('TestOrg', 'https://testorg.slack.com');
      const whatsapp = service('WhatsApp', 'https://web.whatsapp.com');

      expect(
        findServiceForUrl(
          [whatsapp, testOrg],
          'https://testorg.slack.com/archives/C0123456789/p1700000000000000',
        ),
      ).toBe(testOrg);
    });

    it('ignores the case of the host', () => {
      const testOrg = service('TestOrg', 'https://testorg.slack.com');

      expect(
        findServiceForUrl([testOrg], 'https://TestOrg.Slack.com/archives'),
      ).toBe(testOrg);
    });

    it('prefers the first service when several have the same host', () => {
      const first = service('First', 'https://web.whatsapp.com');
      const second = service('Second', 'https://web.whatsapp.com');

      expect(
        findServiceForUrl([first, second], 'https://web.whatsapp.com/send'),
      ).toBe(first);
    });

    it('does not match a different host on the same domain', () => {
      const testOrg = service('TestOrg', 'https://testorg.slack.com');

      expect(
        findServiceForUrl([testOrg], 'https://app.slack.com/client'),
      ).toBeUndefined();
    });

    it('returns nothing when no service matches', () => {
      const testOrg = service('TestOrg', 'https://testorg.slack.com');

      expect(
        findServiceForUrl([testOrg], 'https://github.com/ferdium/ferdium-app'),
      ).toBeUndefined();
    });

    it('only handles http and https urls', () => {
      const testOrg = service('TestOrg', 'https://testorg.slack.com');

      expect(
        findServiceForUrl([testOrg], 'ftp://testorg.slack.com/file'),
      ).toBeUndefined();
      expect(findServiceForUrl([testOrg], 'not a url')).toBeUndefined();
    });
  });
});
