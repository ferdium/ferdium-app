import {
  collectZaloArchiveSnapshot,
  startZaloArchiveCollector,
} from '../../src/webview/zaloArchive';

const element = (options: {
  text?: string;
  attributes?: Record<string, string>;
  matches?: Record<string, ReturnType<typeof element>[]>;
}) =>
  ({
    textContent: options.text ?? '',
    getAttribute: (name: string) => options.attributes?.[name] ?? null,
    querySelector: (selector: string) => options.matches?.[selector]?.[0] ?? null,
    querySelectorAll: (selector: string) => options.matches?.[selector] ?? [],
  }) as unknown as Element;

describe('Zalo archive collector', () => {
  it('extracts unread previews without clicking a conversation', () => {
    const row = element({
      attributes: { 'data-id': 'conversation-7' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Lucy' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [
          element({ text: 'Xin chào' }),
        ],
        '[class*="unread"], [class*="badge"]': [element({ text: '3' })],
      },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]': [
          row,
        ],
        '[data-id][class*="message"], [data-msg-id], [class*="message-item"]': [],
      },
    });

    const result = collectZaloArchiveSnapshot(
      root as unknown as Document,
      '2026-09-12T08:10:00.000Z',
    );
    expect(result.conversations).toEqual([
      expect.objectContaining({
        conversationKey: 'conversation-7',
        displayName: 'Lucy',
        previewText: 'Xin chào',
        unreadCount: 3,
      }),
    ]);
    expect(result.messages[0]).toEqual(
      expect.objectContaining({ completeness: 'preview', text: 'Xin chào' }),
    );
  });

  it('groups the opened chat under the matching conversation id', () => {
    const row = element({
      attributes: { 'data-id': 'conversation-7' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Lucy' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [],
        '[class*="unread"], [class*="badge"]': [],
      },
    });
    const message = element({
      text: 'Nội dung đầy đủ',
      attributes: { 'data-msg-id': 'message-9', class: 'incoming message-item' },
      matches: { img: [], '[class*="file"], [data-file-name]': [] },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]': [row],
        'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]': [
          element({ text: 'Lucy' }),
        ],
        '[data-id][class*="message"], [data-msg-id], [class*="message-item"]': [message],
      },
    });

    const result = collectZaloArchiveSnapshot(
      root as unknown as Document,
      '2026-09-12T08:10:00.000Z',
    );
    expect(result.messages).toEqual([
      expect.objectContaining({
        conversationKey: 'conversation-7',
        remoteId: 'message-9',
        completeness: 'full',
      }),
    ]);
  });

  it('does nothing outside Zalo and cleans resources', () => {
    const send = jest.fn();
    const disconnect = jest.fn();
    const clearTimer = jest.fn();
    const documentRoot = element({ matches: {} }) as unknown as Document;
    const stopTelegram = startZaloArchiveCollector({
      document: documentRoot,
      hostname: 'web.telegram.org',
      send,
      createObserver: () => ({ observe: jest.fn(), disconnect }),
      setTimer: () => 7 as never,
      clearTimer,
    });
    stopTelegram();
    expect(send).not.toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();

    const stopZalo = startZaloArchiveCollector({
      document: documentRoot,
      hostname: 'chat.zalo.me',
      send,
      createObserver: () => ({ observe: jest.fn(), disconnect }),
      setTimer: () => 7 as never,
      clearTimer,
    });
    stopZalo();
    expect(disconnect).toHaveBeenCalled();
    expect(clearTimer).toHaveBeenCalledWith(7);
  });
});
