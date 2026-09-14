import { containsHan, shouldBlockDraft } from '../../src/webview/sendGuard';

describe('sendGuard draft policy', () => {
  it.each(['你好', 'Hello 你好', 'test中文123'])(
    'blocks drafts containing Han characters: %s',
    text => {
      expect(containsHan(text)).toBe(true);
      expect(shouldBlockDraft(text)).toBe(true);
    },
  );

  it.each([
    'Hello',
    '12345',
    'Hello 123 😀',
    'https://example.com',
    'a@b.com',
    '，。！？',
  ])('allows drafts without Han characters: %s', text => {
    expect(containsHan(text)).toBe(false);
    expect(shouldBlockDraft(text)).toBe(false);
  });
});
