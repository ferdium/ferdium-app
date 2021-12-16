import { ipcMain, Session, session } from 'electron';

import { TODOS_PARTITION_ID } from '../../config';

const debug = require('debug')('Ferdi:ipcApi:sessionStorage');

function deduceSession(serviceId: string | undefined | null): Session {
  if (serviceId) {
    return session.fromPartition(
      serviceId === TODOS_PARTITION_ID
        ? TODOS_PARTITION_ID
        : `persist:service-${serviceId}`,
    );
  }
  return session.defaultSession;
}

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
