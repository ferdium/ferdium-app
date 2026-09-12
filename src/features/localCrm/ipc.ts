import { ipcMain } from 'electron';
import { join } from 'node:path';
import { userDataPath } from '../../environment-remote';
import {
  ContactRepository,
  type BackofficeProfileInput,
  type ContactInput,
} from './ContactRepository';
import { checkBufa, fetchBufaDeposits } from './bufaBridge';

let repositoryPromise: Promise<ContactRepository> | undefined;

const repository = () => {
  repositoryPromise ??= ContactRepository.open(
    join(userDataPath(), 'local-crm.sqlite'),
  );
  return repositoryPromise;
};

export default function initializeLocalCrmIpc(): void {
  ipcMain.handle('local-crm:get-contact', async (_event, data) =>
    (await repository()).getContact(data.serviceId, data.conversationKey),
  );
  ipcMain.handle('local-crm:save-contact', async (_event, data: ContactInput) =>
    (await repository()).saveContact(data),
  );
  ipcMain.handle(
    'local-crm:resolve-conversation-key',
    async (_event, { serviceId, observedName }) =>
      (await repository()).resolveConversationKey(serviceId, observedName),
  );
  ipcMain.handle(
    'local-crm:get-backoffice-profile',
    async (_event, { serviceId, conversationKey }) =>
      (await repository()).getBackofficeProfile(serviceId, conversationKey),
  );
  ipcMain.handle('local-crm:list-backoffice-profiles', async () =>
    (await repository()).listBackofficeProfiles(),
  );
  ipcMain.handle(
    'local-crm:save-backoffice-profile',
    async (_event, data: BackofficeProfileInput) =>
      (await repository()).saveBackofficeProfile(data),
  );
  ipcMain.handle(
    'local-crm:check-bufa',
    async (_event, { stream, account, includeDepositHistory }) =>
      checkBufa(stream, account, Boolean(includeDepositHistory)),
  );
  ipcMain.handle(
    'local-crm:get-bufa-deposits',
    async (_event, { stream, account }) => fetchBufaDeposits(stream, account),
  );
}
