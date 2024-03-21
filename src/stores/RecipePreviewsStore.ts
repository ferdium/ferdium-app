import { action, computed, makeObservable, observable } from 'mobx';

import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import type Recipe from '../models/Recipe';

import type RecipePreview from '../models/RecipePreview';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';
import TypedStore from './lib/TypedStore';

export default class RecipePreviewsStore extends TypedStore {
  @observable allRecipePreviewsRequest = new CachedRequest(
    this.api.recipePreviews,
    'all',
  );

  @observable featuredRecipePreviewsRequest = new CachedRequest(
    this.api.recipePreviews,
    'featured',
  );

  @observable searchRecipePreviewsRequest = new Request(
    this.api.recipePreviews,
    'search',
  );

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.recipePreview.search.listen(this._search.bind(this));
  }

  async setup(): Promise<void> {
    // Not implemented
  }

  @computed get all(): RecipePreview[] {
    return this.allRecipePreviewsRequest.execute().result || [];
  }

  @computed get featured(): RecipePreview[] {
    return this.featuredRecipePreviewsRequest.execute().result || [];
  }

  @computed get searchResults(): RecipePreview[] {
    return this.searchRecipePreviewsRequest.result || [];
  }

  @computed get dev(): Recipe[] {
    return this.stores.recipes.all.filter(r => r.local);
  }

  // Actions
  @action _search({ needle }): void {
    if (needle !== '') {
      this.searchRecipePreviewsRequest.execute(needle);
    }
  }
}
