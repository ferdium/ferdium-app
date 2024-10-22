import { type Session, ipcMain, session } from 'electron';
import { TODOS_PARTITION_ID } from '../../config';

const debug = require('../../preload-safe-debug')(
  'Ferdium:ipcApi:sessionStorage',
);

const deduceSession = (serviceId: string | undefined | null): Session => {
  if (!serviceId) return session.defaultSession;

  if (serviceId === TODOS_PARTITION_ID)
    return session.fromPartition(TODOS_PARTITION_ID);

  return session.fromPartition(`persist:service-${serviceId}`);
};

export default async () => {
  ipcMain.on('clear-storage-data', (_event, { serviceId, targetsToClear }) => {
    try {
      const serviceSession = deduceSession(serviceId);
      serviceSession.flushStorageData();
      if (targetsToClear) {
        debug('Clearing targets:', targetsToClear);
        serviceSession.clearStorageData(targetsToClear);
      } else {
        debug('Clearing all targets');
        serviceSession.clearStorageData();
      }
    } catch (error) {
      debug(error);
    }
  });

  ipcMain.handle('clear-cache', (_event, { serviceId }) => {
    const serviceSession = deduceSession(serviceId);
    return serviceSession.clearCache();
  });
};
