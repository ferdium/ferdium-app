import { ZaloArchiveRepository } from '../../../src/features/zaloArchive/ZaloArchiveRepository';
import type { ZaloArchiveBatch } from '../../../src/features/zaloArchive/types';

const previewBatch = (text = 'Xin chào'): ZaloArchiveBatch => ({
  recipeId: 'zalo',
  observedAt: '2026-09-12T08:10:00.000Z',
  loginState: 'available',
  conversations: [
    {
      conversationKey: 'lucy',
      displayName: 'Lucy',
      previewText: text,
      unreadCount: 1,
      observedAt: '2026-09-12T08:10:00.000Z',
    },
  ],
  messages: [
    {
      conversationKey: 'lucy',
      sender: 'them',
      kind: 'text',
      text,
      occurredAt: '2026-09-12T08:10:00.000Z',
      completeness: 'preview',
    },
  ],
});

describe('ZaloArchiveRepository', () => {
  let repository: ZaloArchiveRepository;

  beforeEach(async () => {
    repository = await ZaloArchiveRepository.openInMemory();
  });

  afterEach(async () => {
    await repository.close();
  });

  it('isolates data by Ferdium profile', async () => {
    await repository.saveBatch('zalo-a', previewBatch());

    expect(await repository.listConversations('zalo-b')).toEqual([]);
    expect((await repository.getSummary('zalo-a')).messageCount).toBe(1);
  });

  it('deduplicates and upgrades a preview to a full message', async () => {
    const batch = previewBatch();
    await repository.saveBatch('zalo-a', batch);
    await repository.saveBatch('zalo-a', {
      ...batch,
      messages: [{ ...batch.messages[0], completeness: 'full' }],
    });

    const messages = await repository.getMessages('zalo-a', 'lucy');
    expect(messages).toHaveLength(1);
    expect(messages[0].completeness).toBe('full');
  });

  it('uses remote id to replace preview text with full text', async () => {
    const batch = previewBatch('Ảnh');
    batch.messages[0].remoteId = 'zalo-message-7';
    await repository.saveBatch('zalo-a', batch);
    await repository.saveBatch('zalo-a', {
      ...batch,
      messages: [
        {
          ...batch.messages[0],
          text: 'Ảnh gia đình',
          completeness: 'full',
        },
      ],
    });

    expect(await repository.getMessages('zalo-a', 'lucy')).toEqual([
      expect.objectContaining({ text: 'Ảnh gia đình', completeness: 'full' }),
    ]);
  });

  it('searches conversations and returns messages chronologically', async () => {
    const batch = previewBatch();
    batch.messages.push({
      ...batch.messages[0],
      remoteId: 'older',
      text: 'Tin cũ',
      occurredAt: '2026-09-12T08:00:00.000Z',
      completeness: 'full',
    });
    await repository.saveBatch('zalo-a', batch);

    expect(await repository.listConversations('zalo-a', 'xin')).toHaveLength(1);
    const messages = await repository.getMessages('zalo-a', 'lucy');
    expect(messages.map(message => message.text)).toEqual([
      'Tin cũ',
      'Xin chào',
    ]);
  });

  it('deletes only the selected profile', async () => {
    await repository.saveBatch('zalo-a', previewBatch());
    await repository.saveBatch('zalo-b', previewBatch());
    await repository.deleteProfile('zalo-a');

    expect((await repository.getSummary('zalo-a')).messageCount).toBe(0);
    expect((await repository.getSummary('zalo-b')).messageCount).toBe(1);
  });

  it('removes previously stored Zalo interface noise', async () => {
    const batch = previewBatch('Vài giây');
    batch.conversations[0].unreadCount = 599;
    batch.conversations.push({
      ...batch.conversations[0],
      conversationKey: 'junk',
      displayName: 'Hôm qua',
    });
    for (const displayName of ['giờ', 'ngày', 'phút']) {
      batch.conversations.push({
        ...batch.conversations[0],
        conversationKey: `junk-${displayName}`,
        displayName,
      });
    }
    batch.messages.push({
      ...batch.messages[0],
      conversationKey: 'junk',
      text: '/-heart/-strong/-heart:>:o:-((:-h',
    });
    batch.messages.push({
      ...batch.messages[0],
      kind: 'image',
      text: 'Alo/-heart/-strong',
      completeness: 'full',
    });
    await repository.saveBatch('zalo-a', batch);

    await repository.cleanupNoise('zalo-a');

    expect(await repository.listConversations('zalo-a')).toEqual([
      expect.objectContaining({
        displayName: 'Lucy',
        previewText: '',
        unreadCount: 0,
      }),
    ]);
    expect(await repository.getMessages('zalo-a', 'lucy')).toEqual([]);
    expect(await repository.getMessages('zalo-a', 'junk')).toEqual([]);
    expect(await repository.listConversations('zalo-a')).toHaveLength(1);
  });

  it('moves messages saved under a Zalo header key to the real conversation', async () => {
    const batch = previewBatch();
    batch.messages = [
      {
        ...batch.messages[0],
        conversationKey: 'lucyNGƯỜI LẠKhông có nhóm chung',
        text: 'Alo',
        completeness: 'full',
      },
    ];
    await repository.saveBatch('zalo-a', batch);

    await repository.cleanupNoise('zalo-a');

    expect(await repository.getMessages('zalo-a', 'lucy')).toEqual([
      expect.objectContaining({ text: 'Alo' }),
    ]);
    expect(
      await repository.getMessages(
        'zalo-a',
        'lucyNGƯỜI LẠKhông có nhóm chung',
      ),
    ).toEqual([]);
  });
});
