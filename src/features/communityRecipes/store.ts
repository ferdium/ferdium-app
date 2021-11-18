import { computed } from 'mobx';
import { FeatureStore } from '../utils/FeatureStore';

const debug = require('debug')('Ferdi:feature:communityRecipes:store');

export class CommunityRecipesStore extends FeatureStore {
  stores: any;

  actions: any;

  start(stores: any, actions: any) {
    debug('start');
    this.stores = stores;
    this.actions = actions;
  }

  stop() {
    debug('stop');
    super.stop();
  }

  @computed get communityRecipes() {
    if (!this.stores) return [];

    return this.stores.recipePreviews.dev.map(
      (recipePreview: { isDevRecipe: boolean; author: any[] }) => {
        // TODO: Need to figure out if this is even necessary/used
        recipePreview.isDevRecipe = !!recipePreview.author.some(
          (author: { email: string }) =>
            author.email === this.stores.user.data.email,
        );

        return recipePreview;
      },
    );
  }
}

export default CommunityRecipesStore;
