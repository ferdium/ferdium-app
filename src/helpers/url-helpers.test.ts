import * as url_helpers from './url-helpers'

describe('url_helpers', () => {
  describe('isValidExternalURL', () => {
    describe('with string', () => {
      it('returns false for empty string', () => {
        const result = url_helpers.isValidExternalURL('');
        expect(result).toBe(false);
      });

      it('returns false for whitespace string', () => {
        const result = url_helpers.isValidExternalURL('  ');
        expect(result).toBe(false);
      });

      it('returns false for random string', () => {
        const result = url_helpers.isValidExternalURL('some random string');
        expect(result).toBe(false);
      });

      it('returns false for invalid url', () => {
        const result = url_helpers.isValidExternalURL('shttps://google');
        expect(result).toBe(false);
      });

      it('returns true for valid http url', () => {
        const result = url_helpers.isValidExternalURL('http://google');
        expect(result).toBe(true);
      });

      it('returns true for valid https url', () => {
        const result = url_helpers.isValidExternalURL('https://google');
        expect(result).toBe(true);
      });
    });

    describe('with URL', () => {
      // Note: not testing the invalid string urls - since the URL ctor itself will raise an error

      it('returns false for invalid url', () => {
        const result = url_helpers.isValidExternalURL(new URL('shttps://google'));
        expect(result).toBe(false);
      });

      it('returns true for valid http url', () => {
        const result = url_helpers.isValidExternalURL(new URL('http://google'));
        expect(result).toBe(true);
      });

      it('returns true for valid https url', () => {
        const result = url_helpers.isValidExternalURL(new URL('https://google'));
        expect(result).toBe(true);
      });
    });
  });

  describe('fixUrl', () => {
    it('handles with empty string', () => {
      const result = url_helpers.fixUrl('');
      expect(result).toEqual('');
    });

    it('handles with whitespace string', () => {
      const result = url_helpers.fixUrl('   ');
      expect(result).toEqual('   ');
    });

    it('handles with random string', () => {
      const result = url_helpers.fixUrl('some random string');
      expect(result).toEqual('some random string');
    });

    it('handles string starting with http://', () => {
      expect(url_helpers.fixUrl('http://some/random/url')).toEqual('http://some/random/url');
      expect(url_helpers.fixUrl('http://some//random//url')).toEqual('http://some/random/url');

      const gmailEmbeddedUrl = 'https://www.google.com/url?q=https://github.com/ferdium/ferdium-app/issues/87&source=gmail';
      expect(url_helpers.fixUrl(gmailEmbeddedUrl)).toEqual(gmailEmbeddedUrl); // it should NOT remove the double-slash from the embedded url in the query string
    });

    it('handles string starting with https://', () => {
      expect(url_helpers.fixUrl('https://some/random/url')).toEqual('https://some/random/url');
      expect(url_helpers.fixUrl('https://some//random//url')).toEqual('https://some/random/url');
    });

    it('handles string starting with file://', () => {
      expect(url_helpers.fixUrl('file://some/random/url')).toEqual('file://some/random/url');
      expect(url_helpers.fixUrl('file://some//random//url')).toEqual('file://some/random/url');
    });
  });

  describe('isValidFileUrl', () => {
    it('returns false for empty string', () => {
      const result = url_helpers.isValidFileUrl('');
      expect(result).toBe(false);
    });

    it('returns false for whitespace string', () => {
      const result = url_helpers.isValidFileUrl('  ');
      expect(result).toBe(false);
    });

    it('returns false for random string', () => {
      const result = url_helpers.isValidFileUrl('some random string');
      expect(result).toBe(false);
    });

    it('returns false for invalid url', () => {
      const result = url_helpers.isValidFileUrl('sfile://google');
      expect(result).toBe(false);
    });

    it('returns true for valid file url', () => {
      const fileName = process.platform === 'win32' ? 'file:///c:\\' : 'file:///';
      const result = url_helpers.isValidFileUrl(fileName);
      expect(result).toBe(true);
    });
  });
});
