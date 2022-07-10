import { ipcRenderer } from 'electron';
import { action, computed, makeObservable, observable } from 'mobx';
import ms from 'ms';

import { Actions } from '../actions/lib/actions';
import { ApiInterface } from '../api';
import { Stores } from '../@types/stores.types';
import CachedRequest from './lib/CachedRequest';
import { LOCAL_PORT } from '../config';

import TypedStore from './lib/TypedStore';

const debug = require('../preload-safe-debug')('Ferdium:RequestsStore');

export default class RequestStore extends TypedStore {
  @observable userInfoRequest: CachedRequest;

  @observable servicesRequest: CachedRequest;

  @observable showRequiredRequestsError = false;

  @observable localServerPort = LOCAL_PORT;

  retries: number = 0;

  retryDelay: number = ms('2s');

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    this.actions.requests.retryRequiredRequests.listen(
      this._retryRequiredRequests.bind(this),
    );

    this.registerReactions([this._autoRetry.bind(this)]);
  }

  async setup(): Promise<void> {
    this.userInfoRequest = this.stores.user.getUserInfoRequest;
    this.servicesRequest = this.stores.services.allServicesRequest;

    ipcRenderer.on('localServerPort', (_, data) => {
      if (data.port) {
        this.localServerPort = data.port;
      }
    });
  }

  @computed get areRequiredRequestsSuccessful(): boolean {
    return !this.userInfoRequest.isError && !this.servicesRequest.isError;
  }

  @computed get areRequiredRequestsLoading(): boolean {
    return this.userInfoRequest.isExecuting || this.servicesRequest.isExecuting;
  }

  @action _retryRequiredRequests(): void {
    this.userInfoRequest.reload();
    this.servicesRequest.reload();
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
