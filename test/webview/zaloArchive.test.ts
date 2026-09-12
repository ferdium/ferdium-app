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
    querySelector: (selector: string) =>
      options.matches?.[selector]?.[0] ?? null,
    querySelectorAll: (selector: string) => options.matches?.[selector] ?? [],
  }) as unknown as Element;

const messageRowsSelector = '[data-component="message-content-view"]';

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
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]':
          [row],
        [messageRowsSelector]: [],
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
      attributes: {
        'data-msg-id': 'message-9',
        class: 'incoming message-item',
      },
      matches: { img: [], '[class*="file"], [data-file-name]': [] },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]':
          [row],
        'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]':
          [element({ text: 'Lucy' })],
        [messageRowsSelector]: [message],
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

  it('ignores Zalo status text appended to the opened chat name', () => {
    const row = element({
      attributes: { 'data-id': 'conversation-7' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Anhnguyen6868-B' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [],
        '[class*="unread"], [class*="badge"]': [],
      },
    });
    const message = element({
      text: 'Alo',
      attributes: { 'data-msg-id': 'message-10', class: 'message-item' },
      matches: { img: [], '[class*="file"], [data-file-name]': [] },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]':
          [row],
        'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]':
          [element({ text: 'Anhnguyen6868-BNGƯỜI LẠKhông có nhóm chung' })],
        [messageRowsSelector]: [message],
      },
    });

    const result = collectZaloArchiveSnapshot(
      root as unknown as Document,
      '2026-09-12T11:05:00.000Z',
    );

    expect(result.messages[0]?.conversationKey).toBe('conversation-7');
  });

  it('captures a Zalo contact card as a readable archive entry', () => {
    const row = element({
      attributes: { 'data-id': 'conversation-7' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Anhnguyen6868-B' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [],
        '[class*="unread"], [class*="badge"]': [],
      },
    });
    const contactContent = element({
      text: 'Anhnguyen6868-B 0909579578 Kết Bạn Nhắn Tin',
      attributes: {
        'data-qid': '8255778967139@1789210358028_0',
        class: 'contact-message__container',
      },
      matches: {
        '[class*="contact-card__name-wrapper"]': [
          element({ text: 'Anhnguyen6868-B' }),
        ],
        '[class*="contact-card__description-wrapper"]': [
          element({ text: '0909579578' }),
        ],
        img: [element({})],
        '[class*="file"], [data-file-name]': [],
      },
    });
    const contact = element({
      text: 'Anhnguyen6868-B 0909579578 Kết Bạn Nhắn Tin /-strong',
      attributes: {
        id: 'message-frame_1789210358028',
        class: 'me pin-react last-msg message-non-frame',
        'data-component': 'message-content-view',
      },
      matches: {
        '[data-qid]': [contactContent],
        '[class*="contact-message__container"]': [contactContent],
        '[class*="contact-card__name-wrapper"]': [
          element({ text: 'Anhnguyen6868-B' }),
        ],
        '[class*="contact-card__description-wrapper"]': [
          element({ text: '0909579578' }),
        ],
        img: [element({})],
        '[class*="file"], [data-file-name]': [],
      },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]':
          [row],
        'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]':
          [element({ text: 'Anhnguyen6868-B' })],
        [messageRowsSelector]: [contact],
      },
    });

    const result = collectZaloArchiveSnapshot(
      root as unknown as Document,
      '2026-09-12T11:05:00.000Z',
    );

    expect(result.messages).toEqual([
      expect.objectContaining({
        remoteId: '8255778967139@1789210358028_0',
        sender: 'me',
        kind: 'contact',
        text: 'Danh thiếp: Anhnguyen6868-B · 0909579578',
        occurredAt: '2026-09-12T10:52:38.028Z',
      }),
    ]);
  });

  it('reads sender and timestamp from real Zalo message frames', () => {
    const conversation = element({
      attributes: { 'data-id': 'conversation-7' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Anhnguyen6868-B' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [],
        '[class*="unread"], [class*="badge"]': [],
      },
    });
    const sentText = element({ text: 'Tin của tôi' });
    const receivedText = element({ text: 'Tin của khách' });
    const sent = element({
      attributes: {
        class: 'me card shadow-bubble message-frame',
        'data-component': 'message-content-view',
        'data-qid': '8255770446665@1789210206660_0_4500',
      },
      matches: {
        '[class*="text-message__container"]': [sentText],
        img: [],
        '[class*="file"], [data-file-name]': [],
      },
    });
    const received = element({
      attributes: {
        class: 'card shadow-bubble message-frame',
        'data-component': 'message-content-view',
        'data-qid': '8255773424095@1789210259988_4500_4500',
      },
      matches: {
        '[class*="text-message__container"]': [receivedText],
        img: [],
        '[class*="file"], [data-file-name]': [],
      },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]':
          [conversation],
        'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]':
          [element({ text: 'Anhnguyen6868-B' })],
        [messageRowsSelector]: [sent, received],
      },
    });

    const result = collectZaloArchiveSnapshot(
      root as unknown as Document,
      '2026-09-12T11:05:00.000Z',
    );

    expect(result.messages).toEqual([
      expect.objectContaining({
        sender: 'me',
        kind: 'text',
        text: 'Tin của tôi',
        occurredAt: '2026-09-12T10:50:06.660Z',
      }),
      expect.objectContaining({
        sender: 'them',
        kind: 'text',
        text: 'Tin của khách',
        occurredAt: '2026-09-12T10:50:59.988Z',
      }),
    ]);
  });

  it('ignores Zalo interface labels and does not read digits from names as unread', () => {
    const validRow = element({
      attributes: { 'data-id': 'conversation-7' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Hungtran599-V' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [
          element({ text: 'Vài giây' }),
        ],
        '[class*="unread"], [class*="badge"]': [
          element({ text: 'Hungtran599-V' }),
        ],
      },
    });
    const junkRow = element({
      attributes: { 'data-id': 'junk' },
      matches: {
        '[data-translate-inner], [class*="name"], [class*="title"]': [
          element({ text: 'Hôm qua' }),
        ],
        '[class*="preview"], [class*="subtitle"], [class*="last-msg"]': [],
        '[class*="unread"], [class*="badge"]': [],
      },
    });
    const junkMessage = element({
      text: '/-heart/-strong/-heart:>:o:-((:-h',
      attributes: { 'data-msg-id': 'junk-message', class: 'message-item' },
      matches: { img: [], '[class*="file"], [data-file-name]': [] },
    });
    const root = element({
      matches: {
        '[data-id][class*="conv"], [data-conversation-id], [class*="chat-item"], [class*="conv-item"]':
          [validRow, junkRow],
        'header [class*="name"], header [class*="title"], [class*="chat-info"] [class*="name"]':
          [element({ text: 'Hungtran599-V' })],
        [messageRowsSelector]: [junkMessage],
      },
    });

    const result = collectZaloArchiveSnapshot(
      root as unknown as Document,
      '2026-09-12T08:10:00.000Z',
    );
    expect(result.conversations).toEqual([
      expect.objectContaining({
        displayName: 'Hungtran599-V',
        previewText: '',
        unreadCount: 0,
      }),
    ]);
    expect(result.messages).toEqual([]);
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
