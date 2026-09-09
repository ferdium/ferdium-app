import { runInNewContext } from 'node:vm';

import { windowOpenShim } from '../../src/webview/windowOpenShim';

const NATIVE_RESULT = { native: true };

function installShim() {
  const external = jest.fn();
  const nativeOpen = jest.fn<unknown, unknown[]>(() => NATIVE_RESULT);
  const window: {
    ferdium: { open: jest.Mock };
    open: (...args: unknown[]) => unknown;
  } = { ferdium: { open: external }, open: nativeOpen };
  runInNewContext(`"use strict"; (() => { ${windowOpenShim} })();`, {
    window,
    setInterval,
    clearInterval,
    setTimeout,
  });
  return { external, nativeOpen, windowOpen: window.open };
}

const flushTimers = () =>
  new Promise(resolve => {
    setTimeout(resolve, 20);
  });

describe('windowOpenShim', () => {
  it('replaces window.open', () => {
    const { nativeOpen, windowOpen } = installShim();
    expect(windowOpen).not.toBe(nativeOpen);
  });

  describe('when the page asks for a window', () => {
    it('opens natively when window features are given and returns the real result', () => {
      const { external, nativeOpen, windowOpen } = installShim();
      const result = windowOpen(
        'about:blank',
        undefined,
        'width=380,height=272,left=100,top=100',
      );
      expect(nativeOpen).toHaveBeenCalledWith(
        'about:blank',
        undefined,
        'width=380,height=272,left=100,top=100',
      );
      expect(result).toBe(NATIVE_RESULT);
      expect(external).not.toHaveBeenCalled();
    });

    it('opens natively when a target name is given', () => {
      const { external, nativeOpen, windowOpen } = installShim();
      windowOpen('https://example.com/', '_blank');
      expect(nativeOpen).toHaveBeenCalledWith(
        'https://example.com/',
        '_blank',
        undefined,
      );
      expect(external).not.toHaveBeenCalled();
    });

    it('opens natively without a url when features are given', () => {
      const { external, nativeOpen, windowOpen } = installShim();
      const result = windowOpen('', 'huddle', 'width=380,height=272');
      expect(nativeOpen).toHaveBeenCalledWith(
        '',
        'huddle',
        'width=380,height=272',
      );
      expect(result).toBe(NATIVE_RESULT);
      expect(external).not.toHaveBeenCalled();
    });

    it('does not stringify the url before handing it to the native window.open', () => {
      const { nativeOpen, windowOpen } = installShim();
      const url = new URL('https://example.com/path?x=1');
      windowOpen(url, undefined, 'popup');
      expect(nativeOpen.mock.calls[0][0]).toBe(url);
    });
  });

  describe('when the page opens a plain url', () => {
    it('opens it externally and returns null', () => {
      const { external, nativeOpen, windowOpen } = installShim();
      const result = windowOpen('https://example.com/');
      expect(external).toHaveBeenCalledWith('https://example.com/');
      expect(nativeOpen).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('stringifies a URL object before it reaches ferdium.open', () => {
      const { external, windowOpen } = installShim();
      windowOpen(new URL('https://example.com/path?x=1'));
      expect(external).toHaveBeenCalledWith('https://example.com/path?x=1');
    });

    it('treats an empty features string like no features', () => {
      const { external, nativeOpen, windowOpen } = installShim();
      windowOpen('https://example.com/', '', '');
      expect(external).toHaveBeenCalledWith('https://example.com/');
      expect(nativeOpen).not.toHaveBeenCalled();
    });
  });

  describe('when the page opens a window without a url or features', () => {
    it('returns a placeholder and opens the url externally once assigned', async () => {
      const { external, nativeOpen, windowOpen } = installShim();
      const placeholder = windowOpen() as { location: { href: string } };
      // The placeholder is created inside the vm context, so compare by value.
      expect(placeholder).toEqual({ location: { href: '' } });
      expect(external).not.toHaveBeenCalled();

      placeholder.location.href = 'https://example.com/from-placeholder';
      await flushTimers();

      expect(external).toHaveBeenCalledWith(
        'https://example.com/from-placeholder',
      );
      expect(nativeOpen).not.toHaveBeenCalled();
    });

    it('does nothing when the url is never assigned', async () => {
      const { external, windowOpen } = installShim();
      windowOpen(null);
      await flushTimers();
      expect(external).not.toHaveBeenCalled();
    });
  });
});
