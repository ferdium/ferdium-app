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

type DownloadSessionLike = {
  on: (
    eventName: 'will-download',
    listener: (...args: any[]) => void,
  ) => unknown;
};

type DownloadWebContentsLike = {
  id?: number;
  session: DownloadSessionLike;
  getId?: () => number;
  once?: (eventName: 'destroyed', listener: () => void) => unknown;
};

type SessionDownloadListener = (
  event: { preventDefault: () => void },
  item: DownloadItemLike,
  webContents?: DownloadWebContentsLike,
) => void;

export default class DownloadController {
  private activeDownloads = new Map<string, DownloadItemLike>();

  private registeredSessions = new WeakSet<DownloadSessionLike>();

  private sessionDownloadListeners = new WeakMap<
    DownloadSessionLike,
    SessionDownloadListener
  >();

  private sessionServiceIds = new WeakMap<DownloadSessionLike, Set<string>>();

  private webContentsServiceIds = new Map<number, string>();

  private sessionRegistrationCount = 0;

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

  get registeredSessionCount(): number {
    return this.sessionRegistrationCount;
  }

  registerWebContents({
    serviceId,
    webContents,
  }: {
    serviceId: string;
    webContents: DownloadWebContentsLike;
  }): void {
    this.registerSession(webContents.session);
    this.registerServiceIdForSession(webContents.session, serviceId);

    const webContentsId = this.getWebContentsId(webContents);
    if (webContentsId === null) {
      return;
    }

    this.webContentsServiceIds.set(webContentsId, serviceId);
    webContents.once?.('destroyed', () => {
      this.unregisterWebContents(webContentsId);
    });
  }

  unregisterWebContents(webContentsId: number): void {
    this.webContentsServiceIds.delete(webContentsId);
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
    this.webContentsServiceIds.clear();
    this.registeredSessions = new WeakSet<DownloadSessionLike>();
    this.sessionDownloadListeners = new WeakMap<
      DownloadSessionLike,
      SessionDownloadListener
    >();
    this.sessionServiceIds = new WeakMap<DownloadSessionLike, Set<string>>();
    this.sessionRegistrationCount = 0;
  }

  private registerSession(session: DownloadSessionLike): void {
    if (this.registeredSessions.has(session)) {
      return;
    }

    const listener: SessionDownloadListener = (event, item, webContents) => {
      this.handleWillDownload(session, event, item, webContents);
    };

    session.on('will-download', listener);
    this.registeredSessions.add(session);
    this.sessionDownloadListeners.set(session, listener);
    this.sessionRegistrationCount += 1;
  }

  private registerServiceIdForSession(
    session: DownloadSessionLike,
    serviceId: string,
  ): void {
    const serviceIds = this.sessionServiceIds.get(session) ?? new Set<string>();
    serviceIds.add(serviceId);
    this.sessionServiceIds.set(session, serviceIds);
  }

  private getWebContentsId(
    webContents: DownloadWebContentsLike | undefined,
  ): number | null {
    if (!webContents) {
      return null;
    }

    if (typeof webContents.id === 'number') {
      return webContents.id;
    }

    if (typeof webContents.getId === 'function') {
      return webContents.getId();
    }

    return null;
  }

  private getServiceIdForDownload(
    session: DownloadSessionLike,
    webContents: DownloadWebContentsLike | undefined,
  ): string {
    const webContentsId = this.getWebContentsId(webContents);
    if (webContentsId !== null) {
      const serviceId = this.webContentsServiceIds.get(webContentsId);
      if (serviceId) {
        return serviceId;
      }
    }

    const serviceIds = this.sessionServiceIds.get(session);
    if (serviceIds?.size === 1) {
      return [...serviceIds][0];
    }

    return '';
  }

  private handleWillDownload = (
    session: DownloadSessionLike,
    event: { preventDefault: () => void },
    item: DownloadItemLike,
    webContents?: DownloadWebContentsLike,
  ): void => {
    event.preventDefault();

    this.trackDownload({
      item,
      serviceId: this.getServiceIdForDownload(session, webContents),
    });
  };

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
