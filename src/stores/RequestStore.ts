import { ipcRenderer } from 'electron';
import { action, computed, makeObservable, observable } from 'mobx';
import ms from 'ms';

import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import { LOCAL_HOSTNAME, LOCAL_PORT } from '../config';
import type CachedRequest from './lib/CachedRequest';

import TypedStore from './lib/TypedStore';

const debug = require('../preload-safe-debug')('Ferdium:RequestsStore');

export default class RequestStore extends TypedStore {
  @observable userInfoRequest: CachedRequest;

  @observable servicesRequest: CachedRequest;

  @observable showRequiredRequestsError = false;

  @observable localServerPort = LOCAL_PORT;

  @observable localServerToken: string | undefined;

  retries: number = 0;

  retryDelay: number = ms('2s');

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    this.actions.requests.retryRequiredRequests.listen(
      this._retryRequiredRequests.bind(this),
    );

    this.registerReactions([this._autoRetry.bind(this)]);

    this.userInfoRequest = {} as CachedRequest;
    this.servicesRequest = {} as CachedRequest;
  }

  async setup(): Promise<void> {
    this.userInfoRequest = this.stores.user.getUserInfoRequest;
    this.servicesRequest = this.stores.services.allServicesRequest;

    ipcRenderer.on('localServerPort', (_, data) => {
      this.setData(data);
    });
  }

  @computed get areRequiredRequestsSuccessful(): boolean {
    return !this.userInfoRequest.isError && !this.servicesRequest.isError;
  }

  @computed get areRequiredRequestsLoading(): boolean {
    return this.userInfoRequest.isExecuting || this.servicesRequest.isExecuting;
  }

  @computed get localServerOrigin(): string {
    return `http://${LOCAL_HOSTNAME}:${this.localServerPort}`;
  }

  @action _retryRequiredRequests(): void {
    this.userInfoRequest.reload();
    this.servicesRequest.reload();
  }

  @action setData(data: { port: number; token: string | undefined }): void {
    if (data.port) {
      this.localServerPort = data.port;
    }
    if (data.token) {
      this.localServerToken = data.token;
    }
  }

  // Reactions
  _autoRetry(): void {
    const delay = (this.retries <= 10 ? this.retries : 10) * this.retryDelay;
    if (!this.areRequiredRequestsSuccessful && this.stores.user.isLoggedIn) {
      setTimeout(() => {
        this.retries += 1;
        this._retryRequiredRequests();
        if (this.retries === 4) {
          this.showRequiredRequestsError = true;
        }

        this._autoRetry();
        debug(`Retry required requests delayed in ${delay / 1000}s`);
      }, delay);
    }
  }
}
