/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/class-literal-property-style */
/* eslint-disable max-classes-per-file */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as dbus from 'dbus-next';
import type { MessageBus } from 'dbus-next';
import { type NativeImage, nativeImage } from 'electron';

const STATUS_NOTIFIER_ITEM_PATH = '/StatusNotifierItem';
const DBUS_MENU_PATH = '/Menu';
const STATUS_NOTIFIER_ITEM_INTERFACES = [
  'org.kde.StatusNotifierItem',
  'org.freedesktop.StatusNotifierItem',
];
const STATUS_NOTIFIER_WATCHERS = [
  {
    service: 'org.kde.StatusNotifierWatcher',
    interface: 'org.kde.StatusNotifierWatcher',
  },
  {
    service: 'org.freedesktop.StatusNotifierWatcher',
    interface: 'org.freedesktop.StatusNotifierWatcher',
  },
];

const { ACCESS_READ } = dbus.interface;

export interface LinuxTrayMenuItem {
  label: string;
  click: () => void;
}

interface LinuxTrayOptions {
  onActivate: () => void;
  onContextMenu?: () => void;
}

type MenuProperties = Record<string, dbus.Variant>;
type MenuLayout = [number, MenuProperties, dbus.Variant[]];
type StatusNotifierPixmap = [number, number, Buffer][];

interface StatusNotifierOwner {
  readonly iconName: string;
  readonly iconThemePath: string;
  readonly iconPixmap: StatusNotifierPixmap;
  activate: () => void;
  showFallbackContextMenu: () => void;
}

let nativeBitmapFormat: 'rgba' | 'bgra' | null = null;

function getNativeBitmapFormat(): 'rgba' | 'bgra' {
  if (nativeBitmapFormat) {
    return nativeBitmapFormat;
  }

  // NativeImage.toBitmap() is explicitly platform-dependent. Linux Electron
  // uses RGBA/BGRA layouts depending on the underlying representation, so
  // detect the ordering with a known opaque red pixel before converting the
  // Ferdium icon to the ARGB network-byte-order expected by StatusNotifierItem.
  const redPixel = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  );
  const bitmap = redPixel.toBitmap();
  nativeBitmapFormat = bitmap[0] > bitmap[2] ? 'rgba' : 'bgra';
  return nativeBitmapFormat;
}

function makeStatusNotifierPixmap(image: NativeImage): StatusNotifierPixmap {
  const { width, height } = image.getSize();
  if (width <= 0 || height <= 0) {
    return [];
  }

  const bitmap = image.toBitmap();
  const expectedLength = width * height * 4;
  if (bitmap.length < expectedLength) {
    return [];
  }

  const format = getNativeBitmapFormat();
  const argb = Buffer.alloc(expectedLength);
  for (let offset = 0; offset < expectedLength; offset += 4) {
    const redOffset = format === 'rgba' ? offset : offset + 2;
    const blueOffset = format === 'rgba' ? offset + 2 : offset;
    argb[offset] = bitmap[offset + 3];
    argb[offset + 1] = bitmap[redOffset];
    argb[offset + 2] = bitmap[offset + 1];
    argb[offset + 3] = bitmap[blueOffset];
  }

  return [[width, height, argb]];
}

class StatusNotifierItem extends dbus.interface.Interface {
  constructor(
    private readonly owner: StatusNotifierOwner,
    interfaceName: string,
  ) {
    super(interfaceName);
  }

  get Category(): string {
    return 'Communications';
  }

  get Id(): string {
    return 'ferdium';
  }

  get Title(): string {
    return 'Ferdium';
  }

  get Status(): string {
    return 'Active';
  }

  get WindowId(): number {
    return 0;
  }

  get IconName(): string {
    return this.owner.iconName;
  }

  get IconThemePath(): string {
    return this.owner.iconThemePath;
  }

  get IconPixmap(): StatusNotifierPixmap {
    return this.owner.iconPixmap;
  }

  get OverlayIconName(): string {
    return '';
  }

  get OverlayIconPixmap(): unknown[] {
    return [];
  }

  get AttentionIconName(): string {
    return '';
  }

  get AttentionIconPixmap(): unknown[] {
    return [];
  }

  get AttentionMovieName(): string {
    return '';
  }

  get ToolTip(): [string, unknown[], string, string] {
    return ['', [], 'Ferdium', ''];
  }

  get ItemIsMenu(): boolean {
    return false;
  }

  get Menu(): string {
    return DBUS_MENU_PATH;
  }

  ContextMenu(_x: number, _y: number): void {
    this.owner.showFallbackContextMenu();
  }

  Activate(_x: number, _y: number): void {
    this.owner.activate();
  }

  SecondaryActivate(_x: number, _y: number): void {
    this.owner.activate();
  }

  Scroll(_delta: number, _orientation: string): void {
    // Ferdium does not attach any behavior to tray scroll events.
  }

  NewTitle(): void {
    // The signal has no payload.
  }

  NewIcon(): void {
    // The signal has no payload.
  }

  NewIconThemePath(_path: string): string {
    return _path;
  }

  NewAttentionIcon(): void {
    // The signal has no payload.
  }

  NewOverlayIcon(): void {
    // The signal has no payload.
  }

  NewToolTip(): void {
    // The signal has no payload.
  }

  NewStatus(status: string): string {
    return status;
  }
}

StatusNotifierItem.configureMembers({
  methods: {
    ContextMenu: { inSignature: 'ii', outSignature: '' },
    Activate: { inSignature: 'ii', outSignature: '' },
    SecondaryActivate: { inSignature: 'ii', outSignature: '' },
    Scroll: { inSignature: 'is', outSignature: '' },
  },
  properties: {
    Category: { signature: 's', access: ACCESS_READ },
    Id: { signature: 's', access: ACCESS_READ },
    Title: { signature: 's', access: ACCESS_READ },
    Status: { signature: 's', access: ACCESS_READ },
    WindowId: { signature: 'i', access: ACCESS_READ },
    IconName: { signature: 's', access: ACCESS_READ },
    IconThemePath: { signature: 's', access: ACCESS_READ },
    IconPixmap: { signature: 'a(iiay)', access: ACCESS_READ },
    OverlayIconName: { signature: 's', access: ACCESS_READ },
    OverlayIconPixmap: { signature: 'a(iiay)', access: ACCESS_READ },
    AttentionIconName: { signature: 's', access: ACCESS_READ },
    AttentionIconPixmap: { signature: 'a(iiay)', access: ACCESS_READ },
    AttentionMovieName: { signature: 's', access: ACCESS_READ },
    ToolTip: { signature: '(sa(iiay)ss)', access: ACCESS_READ },
    ItemIsMenu: { signature: 'b', access: ACCESS_READ },
    Menu: { signature: 'o', access: ACCESS_READ },
  },
  signals: {
    NewTitle: { signature: '' },
    NewIcon: { signature: '' },
    NewIconThemePath: { signature: 's' },
    NewAttentionIcon: { signature: '' },
    NewOverlayIcon: { signature: '' },
    NewToolTip: { signature: '' },
    NewStatus: { signature: 's' },
  },
});

class DBusMenu extends dbus.interface.Interface {
  private items: LinuxTrayMenuItem[] = [];

  private revision = 1;

  constructor() {
    super('com.canonical.dbusmenu');
  }

  get Version(): number {
    return 3;
  }

  get TextDirection(): string {
    return 'ltr';
  }

  get Status(): string {
    return 'normal';
  }

  get IconThemePath(): string[] {
    return [];
  }

  setItems(items: LinuxTrayMenuItem[], emitSignal: boolean): void {
    this.items = items;
    this.revision += 1;
    if (emitSignal) {
      this.LayoutUpdated(this.revision, 0);
    }
  }

  private itemIds(): number[] {
    return this.items.map((_, index) => index + 1);
  }

  private getItem(id: number): LinuxTrayMenuItem | undefined {
    if (id <= 0) {
      return undefined;
    }
    return this.items[id - 1];
  }

  private propertiesFor(id: number, propertyNames: string[]): MenuProperties {
    const available: MenuProperties = {};

    if (id === 0) {
      if (this.items.length > 0) {
        available['children-display'] = new dbus.Variant('s', 'submenu');
      }
    } else {
      const item = this.getItem(id);
      if (!item) {
        return {};
      }
      available.label = new dbus.Variant('s', item.label);
    }

    if (propertyNames.length === 0) {
      return available;
    }

    const filtered: MenuProperties = {};
    for (const propertyName of propertyNames) {
      if (available[propertyName]) {
        filtered[propertyName] = available[propertyName];
      }
    }
    return filtered;
  }

  private layoutFor(
    id: number,
    recursionDepth: number,
    propertyNames: string[],
  ): MenuLayout {
    let children: dbus.Variant[] = [];

    if (id === 0 && recursionDepth !== 0) {
      const nextDepth =
        recursionDepth > 0 ? recursionDepth - 1 : recursionDepth;
      children = this.itemIds().map(
        childId =>
          new dbus.Variant(
            '(ia{sv}av)',
            this.layoutFor(childId, nextDepth, propertyNames),
          ),
      );
    }

    return [id, this.propertiesFor(id, propertyNames), children];
  }

  GetLayout(
    parentId: number,
    recursionDepth: number,
    propertyNames: string[],
  ): [number, MenuLayout] {
    return [
      this.revision,
      this.layoutFor(parentId, recursionDepth, propertyNames),
    ];
  }

  GetGroupProperties(
    ids: number[],
    propertyNames: string[],
  ): [number, MenuProperties][] {
    const requestedIds = ids.length > 0 ? ids : [0, ...this.itemIds()];
    return requestedIds.map(id => [id, this.propertiesFor(id, propertyNames)]);
  }

  GetProperty(id: number, name: string): dbus.Variant {
    const property = this.propertiesFor(id, [name])[name];
    if (!property) {
      throw new dbus.DBusError(
        'com.canonical.dbusmenu.Error.UnknownProperty',
        `Unknown menu property ${name} for item ${id}`,
      );
    }
    return property;
  }

  Event(
    id: number,
    eventId: string,
    _data: dbus.Variant,
    _timestamp: number,
  ): void {
    if (eventId !== 'clicked') {
      return;
    }
    this.getItem(id)?.click();
  }

  EventGroup(events: [number, string, dbus.Variant, number][]): number[] {
    const errors: number[] = [];

    for (const [id, eventId] of events) {
      const item = this.getItem(id);
      if (!item) {
        errors.push(id);
      } else if (eventId === 'clicked') {
        item.click();
      }
    }

    return errors;
  }

  AboutToShow(_id: number): boolean {
    return false;
  }

  AboutToShowGroup(ids: number[]): [number[], number[]] {
    const errors = ids.filter(id => id !== 0 && !this.getItem(id));
    return [[], errors];
  }

  LayoutUpdated(revision: number, parent: number): [number, number] {
    return [revision, parent];
  }

  ItemsPropertiesUpdated(
    updatedProps: [number, MenuProperties][],
    removedProps: [number, string[]][],
  ): [[number, MenuProperties][], [number, string[]][]] {
    return [updatedProps, removedProps];
  }

  ItemActivationRequested(id: number, timestamp: number): [number, number] {
    return [id, timestamp];
  }
}

DBusMenu.configureMembers({
  methods: {
    GetLayout: {
      inSignature: 'iias',
      outSignature: 'u(ia{sv}av)',
    },
    GetGroupProperties: {
      inSignature: 'aias',
      outSignature: 'a(ia{sv})',
    },
    GetProperty: {
      inSignature: 'is',
      outSignature: 'v',
    },
    Event: {
      inSignature: 'isvu',
      outSignature: '',
    },
    EventGroup: {
      inSignature: 'a(isvu)',
      outSignature: 'ai',
    },
    AboutToShow: {
      inSignature: 'i',
      outSignature: 'b',
    },
    AboutToShowGroup: {
      inSignature: 'ai',
      outSignature: 'aiai',
    },
  },
  properties: {
    Version: { signature: 'u', access: ACCESS_READ },
    TextDirection: { signature: 's', access: ACCESS_READ },
    Status: { signature: 's', access: ACCESS_READ },
    IconThemePath: { signature: 'as', access: ACCESS_READ },
  },
  signals: {
    LayoutUpdated: { signature: 'ui' },
    ItemsPropertiesUpdated: { signature: 'a(ia{sv})a(ias)' },
    ItemActivationRequested: { signature: 'iu' },
  },
});

export default class LinuxTray {
  private bus: MessageBus | null = null;

  private readonly statusNotifierItems: StatusNotifierItem[];

  private readonly menu = new DBusMenu();

  private readonly serviceName = `org.freedesktop.StatusNotifierItem-${process.pid}-1`;

  private iconDirectory: string | null = null;

  private currentIconName = '';

  private currentIconPixmap: StatusNotifierPixmap = [];

  private iconRevision = 0;

  private active = false;

  private exported = false;

  private startPromise: Promise<void> | null = null;

  constructor(private readonly options: LinuxTrayOptions) {
    this.statusNotifierItems = STATUS_NOTIFIER_ITEM_INTERFACES.map(
      interfaceName => new StatusNotifierItem(this, interfaceName),
    );
  }

  get iconName(): string {
    return this.currentIconName;
  }

  get iconThemePath(): string {
    return this.iconDirectory ?? '';
  }

  get iconPixmap(): StatusNotifierPixmap {
    return this.currentIconPixmap;
  }

  async show(
    image: NativeImage,
    menuItems: LinuxTrayMenuItem[],
  ): Promise<void> {
    this.active = true;
    this.menu.setItems(menuItems, false);
    this.setImage(image);

    if (this.bus) {
      await this.registerWithWatcher();
      return;
    }

    if (!this.startPromise) {
      this.startPromise = this.start();
    }

    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  private async start(): Promise<void> {
    const bus = dbus.sessionBus();
    this.bus = bus;

    try {
      await bus.requestName(this.serviceName, 0);

      if (!this.active || this.bus !== bus) {
        return;
      }

      bus.export(DBUS_MENU_PATH, this.menu);
      for (const statusNotifierItem of this.statusNotifierItems) {
        bus.export(STATUS_NOTIFIER_ITEM_PATH, statusNotifierItem);
      }
      this.exported = true;

      await this.registerWithWatcher();
    } catch (error) {
      if (this.bus === bus) {
        this.bus = null;
        this.exported = false;
      }
      bus.disconnect();
      throw error;
    }
  }

  setMenu(menuItems: LinuxTrayMenuItem[]): void {
    this.menu.setItems(menuItems, this.exported);
  }

  setImage(image: NativeImage): void {
    if (!this.active) {
      return;
    }

    const nextDirectory = mkdtempSync(join(tmpdir(), 'ferdium-tray-'));
    this.iconRevision += 1;
    const nextIconName = `ferdium-tray-${this.iconRevision}`;
    const nextIconPath = join(nextDirectory, `${nextIconName}.png`);

    try {
      writeFileSync(nextIconPath, Uint8Array.from(image.toPNG()));
    } catch (error) {
      rmSync(nextDirectory, { recursive: true, force: true });
      throw error;
    }

    const previousDirectory = this.iconDirectory;
    this.iconDirectory = nextDirectory;
    this.currentIconName = nextIconName;
    this.currentIconPixmap = makeStatusNotifierPixmap(image);

    if (this.exported) {
      for (const statusNotifierItem of this.statusNotifierItems) {
        statusNotifierItem.NewIconThemePath(nextDirectory);
        statusNotifierItem.NewIcon();
      }
    }

    if (previousDirectory) {
      rmSync(previousDirectory, { recursive: true, force: true });
    }
  }

  activate(): void {
    this.options.onActivate();
  }

  showFallbackContextMenu(): void {
    this.options.onContextMenu?.();
  }

  async refreshAfterWatcherRestart(): Promise<void> {
    if (!this.active || !this.bus) {
      return;
    }

    await this.registerWithWatcher();
    for (const statusNotifierItem of this.statusNotifierItems) {
      statusNotifierItem.NewIconThemePath(this.iconThemePath);
      statusNotifierItem.NewIcon();
    }
  }

  private async registerWithWatcher(): Promise<boolean> {
    if (!this.active || !this.bus) {
      return false;
    }

    const tryRegister = async (
      watcher: (typeof STATUS_NOTIFIER_WATCHERS)[number],
    ): Promise<boolean> => {
      if (!this.bus) {
        return false;
      }
      try {
        const proxyObject = await this.bus.getProxyObject(
          watcher.service,
          '/StatusNotifierWatcher',
        );
        const watcherInterface = proxyObject.getInterface(watcher.interface);
        await watcherInterface.RegisterStatusNotifierItem(this.serviceName);
        return true;
      } catch {
        return false;
      }
    };

    const [legacyWatcher, currentWatcher] = STATUS_NOTIFIER_WATCHERS;
    if (await tryRegister(legacyWatcher)) {
      return true;
    }
    return tryRegister(currentWatcher);
  }

  destroy(): void {
    this.active = false;
    this.exported = false;

    if (this.bus) {
      this.bus.disconnect();
      this.bus = null;
    }

    if (this.iconDirectory) {
      rmSync(this.iconDirectory, { recursive: true, force: true });
      this.iconDirectory = null;
      this.currentIconName = '';
      this.currentIconPixmap = [];
    }
  }
}
