import {
  findServiceForUrl,
  getAppLinkProtocols,
  resolveServiceLink,
} from '../../src/helpers/open-url-helpers';

const service = (name: string, url: string) => ({ name, url });

const serviceWithRecipe = (
  url: string,
  resolveLink?: (link: string, context: any) => string | null,
  linkContext = {},
) => ({
  url,
  team: '',
  linkContext,
  recipe: { resolveLink },
});

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

  describe('resolveServiceLink', () => {
    it('opens the url the recipe of the service resolves the link to', () => {
      const slack = serviceWithRecipe('https://testorg.slack.com', link =>
        link.startsWith('slack://')
          ? 'https://testorg.slack.com/messages'
          : null,
      );

      expect(
        resolveServiceLink([slack], 'slack://channel?team=T0123456789'),
      ).toEqual({
        service: slack,
        url: 'https://testorg.slack.com/messages',
      });
    });

    it('passes what Ferdium knows about the service to the recipe', () => {
      const resolveLink = jest.fn(() => null);
      const slack = serviceWithRecipe(
        'https://testorg.slack.com',
        resolveLink,
        { teamId: 'T0123456789' },
      );

      resolveServiceLink([slack], 'slack://open');

      expect(resolveLink).toHaveBeenCalledWith('slack://open', {
        url: 'https://testorg.slack.com',
        team: '',
        linkContext: { teamId: 'T0123456789' },
      });
    });

    it('asks the next service when a recipe does not resolve the link', () => {
      const other = serviceWithRecipe('https://other.slack.com', () => null);
      const testOrg = serviceWithRecipe(
        'https://testorg.slack.com',
        () => 'https://testorg.slack.com/messages',
      );

      expect(resolveServiceLink([other, testOrg], 'slack://open')).toEqual({
        service: testOrg,
        url: 'https://testorg.slack.com/messages',
      });
    });

    it('falls back to the service with the same host', () => {
      const whatsapp = serviceWithRecipe('https://web.whatsapp.com');

      expect(
        resolveServiceLink([whatsapp], 'https://web.whatsapp.com/send'),
      ).toEqual({ service: whatsapp, url: 'https://web.whatsapp.com/send' });
    });

    it('returns nothing when no service can open the link', () => {
      const whatsapp = serviceWithRecipe('https://web.whatsapp.com');

      expect(resolveServiceLink([whatsapp], 'tg://resolve')).toBeUndefined();
    });
  });

  describe('getAppLinkProtocols', () => {
    it('collects the protocols of the recipes of the services once', () => {
      const services = [
        { recipe: { protocols: ['slack'] } },
        { recipe: { protocols: ['whatsapp'] } },
        { recipe: { protocols: ['slack'] } },
        { recipe: { protocols: [] } },
      ];

      expect(getAppLinkProtocols(services)).toEqual(['slack', 'whatsapp']);
    });

    it('never includes the protocol of Ferdium itself or web protocols', () => {
      const services = [
        { recipe: { protocols: ['ferdium', 'https', 'http', 'mailto'] } },
      ];

      expect(getAppLinkProtocols(services)).toEqual(['mailto']);
    });
  });
});
