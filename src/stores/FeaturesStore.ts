import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { Stores } from '../@types/stores.types';
import { ApiInterface } from '../api';
import { Actions } from '../actions/lib/actions';
import CachedRequest from './lib/CachedRequest';
import serviceProxy from '../features/serviceProxy';
import basicAuth from '../features/basicAuth';
import workspaces from '../features/workspaces';
import quickSwitch from '../features/quickSwitch';
import publishDebugInfo from '../features/publishDebugInfo';
import communityRecipes from '../features/communityRecipes';
import todos from '../features/todos';
import appearance from '../features/appearance';
import TypedStore from './lib/TypedStore';

export default class FeaturesStore extends TypedStore {
  @observable defaultFeaturesRequest = new CachedRequest(
    this.api.features,
    'default',
  );

  @observable featuresRequest = new CachedRequest(
    this.api.features,
    'features',
  );

  @observable features = {};

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);
  }

  async setup(): Promise<void> {
    this.registerReactions([
      this._updateFeatures,
      this._monitorLoginStatus.bind(this),
    ]);

    await this.featuresRequest._promise;
    setTimeout(this._setupFeatures.bind(this), 1);
  }

  @computed get anonymousFeatures(): any {
    return this.defaultFeaturesRequest.execute().result || {};
  }

  _updateFeatures = (): void => {
    const features = {};
    if (this.stores.user.isLoggedIn) {
      let requestResult = {};
      try {
        requestResult = this.featuresRequest.execute().result;
      } catch (error) {
        console.error(error);
      }
      Object.assign(features, requestResult);
    }
    runInAction(
      action('FeaturesStore::_updateFeatures', () => {
        this.features = features;
      }),
    );
  };

  _monitorLoginStatus(): void {
    if (this.stores.user.isLoggedIn) {
      this.featuresRequest.invalidate({ immediately: true });
    } else {
      this.defaultFeaturesRequest.execute();
      this.defaultFeaturesRequest.invalidate({ immediately: true });
    }
  }

  _setupFeatures(): void {
    serviceProxy(this.stores);
    basicAuth();
    workspaces(this.stores, this.actions);
    quickSwitch();
    publishDebugInfo();
    communityRecipes(this.stores, this.actions);
    todos(this.stores, this.actions);
    appearance(this.stores);
  }
}
