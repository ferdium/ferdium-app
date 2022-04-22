import { observable, toJS } from 'mobx';
import { pathExistsSync, outputJsonSync, readJsonSync } from 'fs-extra';
import { userDataPath } from '../environment-remote';

const debug = require('../preload-safe-debug')('Ferdium:Settings');

export default class Settings {
  type = '';

  defaultState: {};

  @observable store = {};

  constructor(type: string, defaultState = {}) {
    this.type = type;
    this.store = defaultState;
    this.defaultState = defaultState;

    if (!pathExistsSync(this.settingsFile)) {
      this._writeFile();
    } else {
      this._hydrate();
    }
  }

  set(settings) {
    this.store = this._merge(settings);

    this._writeFile();
  }

  get all() {
    return this.store;
  }

  get allSerialized() {
    return toJS(this.store);
  }

  get(key: string | number) {
    return this.store[key];
  }

  _merge(settings) {
    return Object.assign(this.defaultState, this.store, settings);
  }

  _hydrate() {
    this.store = this._merge(readJsonSync(this.settingsFile));
    debug('Hydrate store', this.type, this.allSerialized);
  }

  _writeFile() {
    outputJsonSync(this.settingsFile, this.store, {
      spaces: 2,
    });
    debug('Write settings file', this.type, this.allSerialized);
  }

  get settingsFile() {
    return userDataPath(
      'config',
      `${this.type === 'app' ? 'settings' : this.type}.json`,
    );
  }
}
