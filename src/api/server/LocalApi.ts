import { ExecException } from 'child_process';
import { ipcRenderer } from 'electron';
import fastFolderSize from 'fast-folder-size';

import { getServicePartitionsDirectory } from '../../helpers/service-helpers';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:LocalApi');

export default class LocalApi {
  // Settings
  getAppSettings(type: string) {
    return new Promise(resolve => {
      ipcRenderer.once('appSettings', (_event, resp) => {
        console.log('LocalApi::getAppSettings resolves', resp.type, resp.data);
        resolve(resp);
      });

      ipcRenderer.send('getAppSettings', type);
    });
  }

  async updateAppSettings(type: string, data: any) {
    console.log('LocalApi::updateAppSettings resolves', type, data);
    ipcRenderer.send('updateAppSettings', {
      type,
      data,
    });
  }

  // Services
  async getAppCacheSize() {
    const partitionsDir = getServicePartitionsDirectory();

    return new Promise((resolve, reject) => {
      fastFolderSize(
        partitionsDir,
        (err: ExecException | null, bytes: number | undefined) => {
          if (err) {
            reject(err);
          }

          console.log('LocalApi::getAppCacheSize resolves', bytes);
          resolve(bytes);
        },
      );
    });
  }

  async clearCache(serviceId: string | null = null) {
    const targetsToClear = {
      storages: [
        'appcache',
        'filesystem',
        'indexdb',
        'shadercache',
        'websql',
        'serviceworkers',
        'cachestorage',
      ],
      quotas: ['temporary', 'persistent', 'syncable'],
    };
    ipcRenderer.send('clear-storage-data', { serviceId, targetsToClear });
    return ipcRenderer.invoke('clear-cache', { serviceId });
  }
}
