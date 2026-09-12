import {
  messageDedupeKey,
  normalizeText,
  validateArchiveBatch,
} from '../../../src/features/zaloArchive/normalize';

const observedAt = '2026-09-12T08:10:00.000Z';

describe('zalo archive normalization', () => {
  it('normalizes whitespace without losing Vietnamese text', () => {
    expect(normalizeText('  Xin\n  chào   bạn ')).toBe('Xin chào bạn');
  });

  it('uses a remote id as the strongest dedupe key', () => {
    const message = {
      conversationKey: 'lucy',
      remoteId: 'message-1',
      sender: 'them' as const,
      kind: 'text' as const,
      text: 'Bản xem trước',
      occurredAt: observedAt,
      completeness: 'preview' as const,
    };

    expect(messageDedupeKey(message)).toBe(
      messageDedupeKey({
        ...message,
        text: 'Nội dung đầy đủ',
        completeness: 'full',
      }),
    );
  });

  it('does not include completeness in the fallback dedupe key', () => {
    const message = {
      conversationKey: 'lucy',
      sender: 'them' as const,
      kind: 'text' as const,
      text: ' Xin  chào ',
      occurredAt: observedAt,
      completeness: 'preview' as const,
    };

    expect(messageDedupeKey(message)).toBe(
      messageDedupeKey({
        ...message,
        text: 'Xin chào',
        completeness: 'full',
      }),
    );
  });

  it('accepts a small Zalo batch', () => {
    expect(
      validateArchiveBatch({
        recipeId: 'zalo',
        conversations: [],
        messages: [],
        observedAt,
      }),
    ).toEqual({
      ok: true,
      value: {
        recipeId: 'zalo',
        conversations: [],
        messages: [],
        observedAt,
      },
    });
  });

  it.each([
    ['another recipe', { recipeId: 'telegram' }],
    [
      'more than 100 records',
      {
        messages: Array.from({ length: 101 }, (_, index) => ({
          conversationKey: 'lucy',
          sender: 'them',
          kind: 'text',
          text: String(index),
          occurredAt: observedAt,
          completeness: 'preview',
        })),
      },
    ],
    ['an oversized text field', { conversations: [{ conversationKey: 'lucy', displayName: 'Lucy', previewText: 'x'.repeat(10_001), unreadCount: 1, observedAt }] }],
  ])('rejects %s', (_label, override) => {
    const result = validateArchiveBatch({
      recipeId: 'zalo',
      conversations: [],
      messages: [],
      observedAt,
      ...override,
    });

    expect(result.ok).toBe(false);
  });
});
