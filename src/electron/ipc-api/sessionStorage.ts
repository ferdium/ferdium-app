import { ipcMain, Session, session } from 'electron';

import { TODOS_PARTITION_ID } from '../../config';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:ipcApi:sessionStorage');

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
        console.log('Clearing targets:', targetsToClear);
        serviceSession.clearStorageData(targetsToClear);
      } else {
        console.log('Clearing all targets');
        serviceSession.clearStorageData();
      }
    } catch (error) {
      console.log(error);
    }
  });

  ipcMain.handle('clear-cache', (_event, { serviceId }) => {
    const serviceSession = deduceSession(serviceId);
    return serviceSession.clearCache();
  });
};
