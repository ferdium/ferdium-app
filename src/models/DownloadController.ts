import { basename } from 'node:path';
import { ipcRenderer } from 'electron';
import { v4 as uuidV4 } from 'uuid';

const debug = require('../preload-safe-debug')('Ferdium:DownloadController');

type DownloadActionPayload = {
  id: string;
  serviceId?: string;
  filename?: string;
  url?: string;
  savePath?: string;
  receivedBytes?: number;
  totalBytes?: number;
  state?: string;
  paused?: boolean;
};

type DownloadActions = {
  addDownload: (download: DownloadActionPayload) => void;
  updateDownload: (download: DownloadActionPayload) => void;
  endedDownload: (download: DownloadActionPayload) => void;
  removeDownload: (downloadId: string) => void;
};

type DownloadIpcData = {
  downloadId?: string;
};

type DownloadIpc = {
  on: (channel: string, listener: (...args: any[]) => void) => unknown;
  removeListener: (
    channel: string,
    listener: (...args: any[]) => void,
  ) => unknown;
};

export type DownloadItemLike = {
  addListener: (
    eventName: 'updated',
    listener: (_event: unknown, state: string) => void,
  ) => unknown;
  once: (
    eventName: 'done',
    listener: (_event: unknown, state: string) => void,
  ) => unknown;
  removeListener: (
    eventName: 'updated',
    listener: (_event: unknown, state: string) => void,
  ) => unknown;
  cancel: () => void;
  getFilename: () => string;
  getReceivedBytes: () => number;
  getSavePath: () => string;
  getState: () => string;
  getTotalBytes: () => number;
  getURL: () => string;
  isPaused: () => boolean;
  pause: () => void;
  resume: () => void;
};

type DownloadControllerOptions = {
  ipc?: DownloadIpc;
  createDownloadId?: () => string;
  getAppActions?: () => DownloadActions;
};

export default class DownloadController {
  private activeDownloads = new Map<string, DownloadItemLike>();

  private isListeningForIpc = false;

  private readonly ipc: DownloadIpc;

  private readonly createDownloadId: () => string;

  private readonly getAppActions: () => DownloadActions;

  constructor({
    ipc = ipcRenderer,
    createDownloadId = uuidV4,
    getAppActions = () => window['ferdium'].actions.app,
  }: DownloadControllerOptions = {}) {
    this.ipc = ipc;
    this.createDownloadId = createDownloadId;
    this.getAppActions = getAppActions;
  }

  get activeDownloadCount(): number {
    return this.activeDownloads.size;
  }

  trackDownload({
    item,
    serviceId,
  }: {
    item: DownloadItemLike;
    serviceId: string;
  }): string {
    this.ensureIpcListeners();

    const downloadId = this.createDownloadId();
    const actions = this.getAppActions();

    this.activeDownloads.set(downloadId, item);

    actions.addDownload({
      id: downloadId,
      serviceId,
      filename: item.getFilename(),
      url: item.getURL(),
      savePath: item.getSavePath(),
    });

    const handleUpdated = (_event: unknown, state: string) => {
      if (state === 'interrupted') {
        debug('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          debug('Download is paused');
        } else {
          debug(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }

      actions.updateDownload({
        id: downloadId,
        serviceId,
        filename: basename(item.getSavePath()),
        url: item.getURL(),
        savePath: item.getSavePath(),
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes(),
        state,
      });
      debug('download updated', state);
    };

    const handleDone = (_event: unknown, state: string) => {
      debug('download done', state);

      item.removeListener('updated', handleUpdated);
      this.activeDownloads.delete(downloadId);

      if (state === 'completed') {
        debug('Download successfully');
      } else {
        if (state === 'cancelled' && item.getSavePath() === '') {
          actions.removeDownload(downloadId);
          debug('Download is cancelled');
        }
        debug(`Download failed: ${state}`);
      }

      actions.endedDownload({
        id: downloadId,
        serviceId,
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes(),
        state,
      });
    };

    item.addListener('updated', handleUpdated);
    item.once('done', handleDone);

    return downloadId;
  }

  dispose(): void {
    if (this.isListeningForIpc) {
      this.ipc.removeListener(
        'toggle-pause-download',
        this.handleTogglePauseDownload,
      );
      this.ipc.removeListener('stop-download', this.handleStopDownload);
      this.isListeningForIpc = false;
    }

    this.activeDownloads.clear();
  }

  private ensureIpcListeners(): void {
    if (this.isListeningForIpc) {
      return;
    }

    this.ipc.on('toggle-pause-download', this.handleTogglePauseDownload);
    this.ipc.on('stop-download', this.handleStopDownload);
    this.isListeningForIpc = true;
  }

  private getTargetDownloads(
    downloadId: string | undefined,
  ): DownloadItemLike[] {
    if (!downloadId) {
      return [...this.activeDownloads.values()];
    }

    const item = this.activeDownloads.get(downloadId);
    return item ? [item] : [];
  }

  private handleTogglePauseDownload = (
    _event: unknown,
    data?: DownloadIpcData,
  ): void => {
    const targetDownloads = this.getTargetDownloads(data?.downloadId);

    for (const item of targetDownloads) {
      debug('toggle-pause-download', item.isPaused(), item.getState());
      if (item.isPaused()) {
        item.resume();
      } else {
        item.pause();
      }
      debug('toggle-pause-download', item.isPaused(), item.getState());

      this.getAppActions().updateDownload({
        id: this.getDownloadId(item),
        paused: item.isPaused(),
      });
    }
  };

  private handleStopDownload = (
    _event: unknown,
    data?: DownloadIpcData,
  ): void => {
    const targetDownloads = this.getTargetDownloads(data?.downloadId);

    for (const item of targetDownloads) {
      item.cancel();
    }
  };

  private getDownloadId(downloadItem: DownloadItemLike): string {
    for (const [downloadId, item] of this.activeDownloads) {
      if (item === downloadItem) {
        return downloadId;
      }
    }

    return '';
  }
}

export const downloadController = new DownloadController();
