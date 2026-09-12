import { ContactRepository } from '../../../src/features/localCrm/ContactRepository';

describe('ContactRepository', () => {
  it('keeps customer records separate for each Zalo service', async () => {
    const repository = await ContactRepository.openInMemory();

    await repository.saveContact({
      serviceId: 'zalo-sales',
      conversationKey: 'nguyen-minh-anh',
      name: 'Nguyễn Minh Anh',
      phone: '0901000001',
      email: '',
      notes: 'Khách cần báo giá',
      tags: ['Khách mới', 'Ưu tiên'],
    });
    await repository.saveContact({
      serviceId: 'zalo-support',
      conversationKey: 'nguyen-minh-anh',
      name: 'Nguyễn Minh Anh',
      phone: '0902000002',
      email: '',
      notes: 'Đang cần hỗ trợ',
      tags: ['Hỗ trợ'],
    });

    await expect(
      repository.getContact('zalo-sales', 'nguyen-minh-anh'),
    ).resolves.toMatchObject({
      phone: '0901000001',
      notes: 'Khách cần báo giá',
      tags: ['Khách mới', 'Ưu tiên'],
    });
    await expect(
      repository.getContact('zalo-support', 'nguyen-minh-anh'),
    ).resolves.toMatchObject({
      phone: '0902000002',
      notes: 'Đang cần hỗ trợ',
      tags: ['Hỗ trợ'],
    });

    await repository.close();
  });

  it('keeps BSPORT and VSPORT accounts separate for each Zalo conversation', async () => {
    const repository = await ContactRepository.openInMemory();

    await repository.saveBackofficeProfile({
      serviceId: 'zalo-sales',
      conversationKey: 'khách-a',
      bsportAccount: 'sales-b',
      vsportAccount: 'sales-v',
      activeStream: 'VSPORT',
    });
    await repository.saveBackofficeProfile({
      serviceId: 'zalo-sales',
      conversationKey: 'khách-b',
      bsportAccount: 'support-b',
      vsportAccount: 'support-v',
      activeStream: 'BSPORT',
    });

    await expect(
      repository.getBackofficeProfile('zalo-sales', 'khách-a'),
    ).resolves.toMatchObject({
      bsportAccount: 'sales-b',
      vsportAccount: 'sales-v',
      activeStream: 'VSPORT',
    });
    await expect(
      repository.getBackofficeProfile('zalo-sales', 'khách-b'),
    ).resolves.toMatchObject({
      bsportAccount: 'support-b',
      vsportAccount: 'support-v',
      activeStream: 'BSPORT',
    });

    await repository.close();
  });

  it('lists every saved backoffice profile for background monitoring', async () => {
    const repository = await ContactRepository.openInMemory();
    await repository.saveBackofficeProfile({
      serviceId: 'zalo-sales',
      conversationKey: 'khách-a',
      bsportAccount: 'a-b',
      vsportAccount: '',
      activeStream: 'BSPORT',
    });
    await repository.saveBackofficeProfile({
      serviceId: 'telegram-sales',
      conversationKey: 'khách-b',
      bsportAccount: '',
      vsportAccount: 'b-v',
      activeStream: 'VSPORT',
    });

    await expect(repository.listBackofficeProfiles()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          conversationKey: 'khách-a',
          bsportAccount: 'a-b',
        }),
        expect.objectContaining({
          conversationKey: 'khách-b',
          vsportAccount: 'b-v',
        }),
      ]),
    );
    await repository.close();
  });

  it('resolves a renamed Zalo conversation back to its original CRM key', async () => {
    const repository = await ContactRepository.openInMemory();

    await repository.saveContact({
      serviceId: 'zalo-sales',
      conversationKey: 'Tổ khác LOL',
      name: 'Tổ khác',
      phone: '',
      email: '',
      notes: '',
      tags: [],
    });

    await expect(
      repository.resolveConversationKey('zalo-sales', 'Tổ khác'),
    ).resolves.toBe('Tổ khác LOL');
    await expect(
      repository.resolveConversationKey('zalo-sales', 'Khách mới'),
    ).resolves.toBe('Khách mới');

    await repository.close();
  });
});
