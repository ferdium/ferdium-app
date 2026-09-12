import {
  buildZaloArchiveHtml,
  refreshZaloArchiveWindow,
} from '../../../src/features/zaloArchive/archiveWindow';

describe('Zalo archive window', () => {
  it('renders conversations as a separate read-only chat window', () => {
    const html = buildZaloArchiveHtml(
      [
        {
          serviceId: 'zalo-1',
          conversationKey: 'lucy',
          displayName: 'Lucy',
          previewText: 'Xin chào',
          unreadCount: 1,
          observedAt: '2026-09-12T10:00:00.000Z',
        },
      ],
      {
        lucy: [
          {
            serviceId: 'zalo-1',
            conversationKey: 'lucy',
            dedupeKey: 'message-1',
            sender: 'them',
            kind: 'text',
            text: 'Xin chào',
            occurredAt: '2026-09-12T10:00:00.000Z',
            completeness: 'full',
          },
        ],
      },
    );

    expect(html).toContain('Lịch sử tin nhắn Zalo');
    expect(html).toContain('Chọn một tài khoản để xem lịch sử');
    expect(html).toContain('Lucy');
    expect(html).toContain('Xin chào');
    expect(html).toContain('.bubble.me{align-self:flex-end');
    expect(html).toContain("m.sender==='me'?'me':'them'");
    expect(html).not.toContain('Gửi tin');
  });

  it('escapes closing script tags from archived messages', () => {
    const html = buildZaloArchiveHtml([], {
      unsafe: [
        {
          serviceId: 'zalo-1',
          conversationKey: 'unsafe',
          dedupeKey: 'message-1',
          sender: 'them',
          kind: 'text',
          text: '</script><script>alert(1)</script>',
          occurredAt: '2026-09-12T10:00:00.000Z',
          completeness: 'full',
        },
      ],
    });

    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(html).toContain('\\u003c/script\\u003e');
  });

  it('reloads fresh data when the archive window is already open', async () => {
    const archiveWindow = {
      loadURL: jest.fn<Promise<void>, [string]>(async () => undefined),
      webContents: {
        executeJavaScript: jest.fn(async () => ({
          selected: 'lucy',
          query: 'lu',
        })),
      },
    };
    const repository = {
      cleanupNoise: jest.fn(async () => undefined),
      listConversations: jest.fn(async () => []),
      getMessages: jest.fn(async () => []),
    };

    await refreshZaloArchiveWindow(
      archiveWindow as never,
      'zalo-refresh-test',
      repository as never,
    );

    expect(repository.listConversations).toHaveBeenCalledTimes(1);
    expect(archiveWindow.loadURL).toHaveBeenCalledTimes(1);
    const loadedUrl = archiveWindow.loadURL.mock.calls[0][0];
    expect(decodeURIComponent(loadedUrl)).toContain(
      '"selected":"lucy","query":"lu"',
    );
  });
});
