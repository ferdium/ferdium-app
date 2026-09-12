import { ipcMain } from 'electron';
import { join } from 'node:path';
import { userDataPath } from '../../environment-remote';
import { validateArchiveBatch } from './normalize';
import { ZaloArchiveRepository } from './ZaloArchiveRepository';
import {
  notifyZaloArchiveUpdated,
  openZaloArchiveWindow,
} from './archiveWindow';

let repositoryPromise: Promise<ZaloArchiveRepository> | undefined;

const repository = () => {
  repositoryPromise ??= ZaloArchiveRepository.open(
    join(userDataPath(), 'local-crm.sqlite'),
  );
  return repositoryPromise;
};

interface SaveRequest {
  serviceId: string;
  recipeId: string;
  batch: unknown;
}

const requireServiceId = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 500)
    throw new Error('Profile Zalo không hợp lệ');
  return value;
};

export const saveArchiveBatch = async (
  target: ZaloArchiveRepository,
  request: SaveRequest,
): Promise<void> => {
  if (request.recipeId !== 'zalo') throw new Error('Chỉ hỗ trợ Zalo');
  const serviceId = requireServiceId(request.serviceId);
  const result = validateArchiveBatch(request.batch);
  if (!result.ok)
    throw new Error(`Dữ liệu lưu trữ không hợp lệ: ${result.reason}`);
  await target.saveBatch(serviceId, result.value);
};

export default function initializeZaloArchiveIpc(): void {
  ipcMain.handle(
    'zalo-archive:save-batch',
    async (_event, request: SaveRequest) => {
      const target = await repository();
      await saveArchiveBatch(target, request);
      notifyZaloArchiveUpdated(request.serviceId, target);
    },
  );
  ipcMain.handle('zalo-archive:get-summary', async (_event, { serviceId }) =>
    (await repository()).getSummary(requireServiceId(serviceId)),
  );
  ipcMain.handle('zalo-archive:open-window', async (_event, { serviceId }) =>
    openZaloArchiveWindow(requireServiceId(serviceId), await repository()),
  );
  ipcMain.handle(
    'zalo-archive:list-conversations',
    async (_event, { serviceId, query = '' }) =>
      (await repository()).listConversations(
        requireServiceId(serviceId),
        String(query).slice(0, 200),
      ),
  );
  ipcMain.handle(
    'zalo-archive:get-messages',
    async (_event, { serviceId, conversationKey }) =>
      (await repository()).getMessages(
        requireServiceId(serviceId),
        String(conversationKey).slice(0, 10_000),
        500,
      ),
  );
  ipcMain.handle('zalo-archive:delete-profile', async (_event, { serviceId }) =>
    (await repository()).deleteProfile(requireServiceId(serviceId)),
  );
}
