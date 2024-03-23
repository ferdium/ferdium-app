import { outputJsonSync, pathExistsSync, readJsonSync } from 'fs-extra';
import { makeObservable, observable, toJS } from 'mobx';
import { userDataPath } from '../environment-remote';

const debug = require('../preload-safe-debug')('Ferdium:Settings');

export default class Settings {
  type: string = '';

  defaultState: object;

  @observable store: object = {};

  constructor(type: string, defaultState = {}) {
    makeObservable(this);

    this.type = type;
    this.store = defaultState;
    this.defaultState = defaultState;

    if (pathExistsSync(this.settingsFile)) {
      this._hydrate();
    } else {
      this._writeFile();
    }
  }

  set(settings: object): void {
    this.store = this._merge(settings);

    this._writeFile();
  }

  get all(): object {
    return this.store;
  }

  get allSerialized(): object {
    return toJS(this.store);
  }

  get(key: string | number): any {
    return this.store[key];
  }

  _merge(settings: object): object {
    return Object.assign(this.defaultState, this.store, settings);
  }

  _hydrate(): void {
    this.store = this._merge(readJsonSync(this.settingsFile));
    debug('Hydrate store', this.type, this.allSerialized);
  }

  _writeFile(): void {
    outputJsonSync(this.settingsFile, this.store, {
      spaces: 2,
    });
    debug('Write settings file', this.type, this.allSerialized);
  }

  get settingsFile(): string {
    return userDataPath(
      'config',
      `${this.type === 'app' ? 'settings' : this.type}.json`,
    );
  }
}
