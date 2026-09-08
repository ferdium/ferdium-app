import { runInNewContext } from 'node:vm';

import { windowOpenShim } from '../../src/webview/windowOpenShim';

function installShim() {
  const open = jest.fn();
  const window: {
    ferdium: { open: jest.Mock };
    open?: (...args: unknown[]) => unknown;
  } = { ferdium: { open } };
  runInNewContext(`"use strict"; (() => { ${windowOpenShim} })();`, { window });
  return { open, windowOpen: window.open! };
}

describe('windowOpenShim', () => {
  it('stringifies a URL object before it reaches ferdium.open', () => {
    const { open, windowOpen } = installShim();
    windowOpen(new URL('https://example.com/path?x=1'), '_blank', 'noopener');
    expect(open).toHaveBeenCalledWith(
      'https://example.com/path?x=1',
      '_blank',
      'noopener',
    );
  });

  it('passes a string url through unchanged', () => {
    const { open, windowOpen } = installShim();
    windowOpen('https://example.com/', '_blank');
    expect(open).toHaveBeenCalledWith(
      'https://example.com/',
      '_blank',
      undefined,
    );
  });

  it('leaves undefined and null urls untouched', () => {
    const { open, windowOpen } = installShim();
    windowOpen();
    windowOpen(null);
    expect(open.mock.calls).toStrictEqual([
      [undefined, undefined, undefined],
      [null, undefined, undefined],
    ]);
  });
});
