import * as dbus from 'dbus-next';

import type DBus from '../DBus';

export type UnreadServices = [string, number, number][];

export default class Ferdium extends dbus.interface.Interface {
  constructor(private readonly dbus: DBus) {
    super('org.ferdium.Ferdium');
  }

  emitMutedChanged(): void {
    Ferdium.emitPropertiesChanged(this, { Muted: this.dbus.muted }, []);
  }

  get Muted(): boolean {
    return this.dbus.muted;
  }

  set Muted(muted: boolean) {
    if (this.dbus.muted !== muted) {
      this.ToggleMute();
    }
  }

  ToggleMute(): void {
    this.dbus.trayIcon.mainWindow?.webContents.send('muteApp');
  }

  ToggleWindow(): void {
    this.dbus.trayIcon._toggleWindow();
  }

  ToggleToTalk(): void {
    this.dbus.trayIcon.mainWindow?.webContents.send('toggle-to-talk');
  }

  emitUnreadChanged(): void {
    Ferdium.emitPropertiesChanged(
      this,
      {
        UnreadDirectMessageCount: this.dbus.unreadDirectMessageCount,
        UnreadIndirectMessageCount: this.dbus.unreadIndirectMessageCount,
        UnreadServices: this.dbus.unreadServices,
      },
      [],
    );
  }

  get UnreadDirectMessageCount(): number {
    return this.dbus.unreadDirectMessageCount;
  }

  get UnreadIndirectMessageCount(): number {
    return this.dbus.unreadIndirectMessageCount;
  }

  get UnreadServices(): UnreadServices {
    return this.dbus.unreadServices;
  }
}

Ferdium.configureMembers({
  methods: {
    ToggleMute: {
      inSignature: '',
      outSignature: '',
    },
    ToggleWindow: {
      inSignature: '',
      outSignature: '',
    },
    ToggleToTalk: {
      inSignature: '',
      outSignature: '',
    },
  },
  properties: {
    Muted: {
      signature: 'b',
      access: dbus.interface.ACCESS_READWRITE,
    },
    UnreadDirectMessageCount: {
      signature: 'u',
      access: dbus.interface.ACCESS_READ,
    },
    UnreadIndirectMessageCount: {
      signature: 'u',
      access: dbus.interface.ACCESS_READ,
    },
    UnreadServices: {
      signature: 'a(suu)',
      access: dbus.interface.ACCESS_READ,
    },
  },
});
