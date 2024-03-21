import { ipcMain } from 'electron';
import { comparer } from 'mobx';

import { type MessageBus, sessionBus } from 'dbus-next';
import { isLinux } from '../environment';
import type TrayIcon from './Tray';
import Ferdium, { type UnreadServices } from './dbus/Ferdium';

export default class DBus {
  private bus: MessageBus | null = null;

  trayIcon: TrayIcon;

  private ferdium: Ferdium | null = null;

  muted = false;

  unreadDirectMessageCount = 0;

  unreadIndirectMessageCount = 0;

  unreadServices: UnreadServices = [];

  constructor(trayIcon: TrayIcon) {
    this.trayIcon = trayIcon;
    ipcMain.on('initialAppSettings', (_, appSettings) => {
      this.updateSettings(appSettings);
    });
    ipcMain.on('updateAppSettings', (_, appSettings) => {
      this.updateSettings(appSettings);
    });
    ipcMain.on(
      'updateDBusUnread',
      (
        _,
        unreadDirectMessageCount,
        unreadIndirectMessageCount,
        unreadServices,
      ) => {
        this.setUnread(
          unreadDirectMessageCount,
          unreadIndirectMessageCount,
          unreadServices,
        );
      },
    );
  }

  private updateSettings(appSettings): void {
    const muted = !!appSettings.data.isAppMuted;
    if (this.muted !== muted) {
      this.muted = muted;
      this.ferdium?.emitMutedChanged();
    }
  }

  private setUnread(
    unreadDirectMessageCount: number,
    unreadIndirectMessageCount: number,
    unreadServices: UnreadServices,
  ): void {
    if (
      this.unreadDirectMessageCount !== unreadDirectMessageCount ||
      this.unreadIndirectMessageCount !== unreadIndirectMessageCount ||
      !comparer.structural(this.unreadServices, unreadServices)
    ) {
      this.unreadDirectMessageCount = unreadDirectMessageCount;
      this.unreadIndirectMessageCount = unreadIndirectMessageCount;
      this.unreadServices = unreadServices;
      this.ferdium?.emitUnreadChanged();
    }
  }

  async start() {
    if (!isLinux || this.bus) {
      return;
    }

    try {
      this.bus = sessionBus();
      await this.bus.requestName('org.ferdium.Ferdium', 0);
    } catch {
      // Error connecting to the bus.
      return;
    }

    this.ferdium = new Ferdium(this);
    this.bus.export('/org/ferdium', this.ferdium);

    // HACK Hook onto the MessageBus to track StatusNotifierWatchers
    // @ts-expect-error Property '_addMatch' does not exist on type 'MessageBus'.
    this.bus._addMatch(
      "type='signal',sender='org.freedesktop.DBus',interface='org.freedesktop.DBus',path='/org/freedesktop/DBus',member='NameOwnerChanged'",
    );
    const mangled = JSON.stringify({
      path: '/org/freedesktop/DBus',
      interface: 'org.freedesktop.DBus',
      member: 'NameOwnerChanged',
    });
    // @ts-expect-error Property '_signals' does not exist on type 'MessageBus'.
    this.bus._signals.on(mangled, (msg: { body: [any, any, any] }) => {
      const [name, oldOwner, newOwner] = msg.body;
      if (
        name === 'org.kde.StatusNotifierWatcher' &&
        oldOwner !== newOwner &&
        newOwner !== ''
      ) {
        // Leave ample time for the StatusNotifierWatcher to be initialized
        setTimeout(() => {
          this.trayIcon.recreateIfVisible();
        }, 400);
      }
    });
  }

  stop() {
    if (!this.bus) {
      return;
    }

    this.bus.disconnect();
    this.bus = null;
    this.ferdium = null;
  }
}
