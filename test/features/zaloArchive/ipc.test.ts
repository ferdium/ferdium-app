import type { ZaloArchiveRepository } from '../../../src/features/zaloArchive/ZaloArchiveRepository';

jest.mock('electron', () => ({ ipcMain: { handle: jest.fn() } }));
jest.mock('../../../src/environment-remote', () => ({
  userDataPath: (...parts: string[]) => parts.join('/'),
}));

const { saveArchiveBatch } = jest.requireActual<
  typeof import('../../../src/features/zaloArchive/ipc')
>('../../../src/features/zaloArchive/ipc');

const validBatch = {
  recipeId: 'zalo' as const,
  conversations: [],
  messages: [],
  observedAt: '2026-09-12T08:10:00.000Z',
};

describe('Zalo archive IPC validation', () => {
  it('writes a valid Zalo payload using the trusted service id', async () => {
    const repository = {
      saveBatch: jest.fn().mockResolvedValue(undefined),
    } as unknown as ZaloArchiveRepository;

    await saveArchiveBatch(repository, {
      serviceId: 'zalo-profile-1',
      recipeId: 'zalo',
      batch: validBatch,
    });

    expect(repository.saveBatch).toHaveBeenCalledWith(
      'zalo-profile-1',
      validBatch,
    );
  });

  it('rejects non-Zalo and oversized payloads before writing', async () => {
    const repository = {
      saveBatch: jest.fn().mockResolvedValue(undefined),
    } as unknown as ZaloArchiveRepository;

    await expect(
      saveArchiveBatch(repository, {
        serviceId: 'telegram-1',
        recipeId: 'telegram',
        batch: validBatch,
      }),
    ).rejects.toThrow('Chỉ hỗ trợ Zalo');
    await expect(
      saveArchiveBatch(repository, {
        serviceId: 'zalo-1',
        recipeId: 'zalo',
        batch: { ...validBatch, observedAt: 'x'.repeat(600_000) },
      }),
    ).rejects.toThrow('Dữ liệu lưu trữ không hợp lệ');
    expect(repository.saveBatch).not.toHaveBeenCalled();
  });
});
