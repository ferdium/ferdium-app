import { MessageBus, sessionBus } from 'dbus-next';
import { isLinux } from '../environment';
import TrayIcon from './Tray';

export default class DBus {
  bus: MessageBus | null = null;

  trayIcon: TrayIcon;

  constructor(trayIcon: TrayIcon) {
    this.trayIcon = trayIcon;
  }

  start() {
    if (!isLinux || this.bus) {
      return;
    }

    try {
      this.bus = sessionBus();
    } catch {
      // Error connecting to the bus.
      return;
    }

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
  }
}
