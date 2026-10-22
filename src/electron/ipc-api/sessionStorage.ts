import {
  type ClearStorageDataOptions,
  type Session,
  ipcMain,
  session,
} from 'electron';
import { TODOS_PARTITION_ID } from '../../config';
import {
  REGENERABLE_CACHE_STORAGES,
  isValidPersistPartition,
} from '../../helpers/partition-helpers';

const debug = require('../../preload-safe-debug')(
  'Ferdium:ipcApi:sessionStorage',
);

type SessionTarget = {
  serviceId?: string | null;
  partition?: string | null;
};

const resolveSession = ({ serviceId, partition }: SessionTarget): Session => {
  if (serviceId === TODOS_PARTITION_ID)
    return session.fromPartition(TODOS_PARTITION_ID);

  // The renderer resolves whether the service lives in a sandbox partition;
  // the value is validated here so it can never address anything outside the
  // app's own persistent partitions.
  if (isValidPersistPartition(partition))
    return session.fromPartition(partition);

  if (!serviceId) return session.defaultSession;

  return session.fromPartition(`persist:service-${serviceId}`);
};

export default async () => {
  ipcMain.handle(
    'clear-storage-data',
    async (
      _event,
      {
        serviceId,
        partition,
        targetsToClear,
      }: SessionTarget & { targetsToClear?: ClearStorageDataOptions },
    ) => {
      try {
        const serviceSession = resolveSession({ serviceId, partition });
        serviceSession.flushStorageData();
        if (targetsToClear) {
          debug('Clearing targets:', targetsToClear);
          await serviceSession.clearStorageData(targetsToClear);
        } else {
          debug('Clearing all targets');
          await serviceSession.clearStorageData();
        }
      } catch (error) {
        debug(error);
      }
    },
  );

  ipcMain.handle(
    'clear-cache',
    async (_event, { serviceId, partition }: SessionTarget) => {
      const serviceSession = resolveSession({ serviceId, partition });

      // The HTTP cache and the caches kept outside it (service worker,
      // CacheStorage, shader cache) are cleared by different APIs. Only the
      // second one reclaims the bulk of a service's disk usage, so both run.
      // Cookies, localStorage and IndexedDB are intentionally untouched.
      await serviceSession.clearCache();
      await serviceSession.clearStorageData({
        storages: [
          ...REGENERABLE_CACHE_STORAGES,
        ] as ClearStorageDataOptions['storages'],
      });
      serviceSession.flushStorageData();
    },
  );
};
