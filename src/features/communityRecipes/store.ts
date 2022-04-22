import { computed } from 'mobx';
import { FeatureStore } from '../utils/FeatureStore';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:feature:communityRecipes:store');

export class CommunityRecipesStore extends FeatureStore {
  stores: any;

  actions: any;

  start(stores: any, actions: any) {
    console.log('start');
    this.stores = stores;
    this.actions = actions;
  }

  stop() {
    console.log('stop');
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
