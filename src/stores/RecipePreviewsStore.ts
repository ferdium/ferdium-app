import { action, computed, observable } from 'mobx';
import { Actions } from 'src/actions/lib/actions';
import { ApiInterface } from 'src/api';
import Recipe from 'src/models/Recipe';
import { Stores } from 'src/stores.types';

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

    // Register action handlers
    this.actions.recipePreview.search.listen(this._search.bind(this));
  }

  async setup(): Promise<void> {
    // Not implemented
  }

  @computed get all(): Recipe[] {
    return this.allRecipePreviewsRequest.execute().result || [];
  }

  @computed get featured(): Recipe[] {
    return this.featuredRecipePreviewsRequest.execute().result || [];
  }

  @computed get searchResults(): Recipe[] {
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
