import { action, computed, makeObservable, observable } from 'mobx';
import { readJSONSync } from 'fs-extra';
import semver from 'semver';

import Recipe from '../models/Recipe';
import { Stores } from '../@types/stores.types';
import { ApiInterface } from '../api';
import { Actions } from '../actions/lib/actions';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';
import matchRoute from '../helpers/routing-helpers';
import { asarRecipesPath } from '../helpers/asar-helpers';
import TypedStore from './lib/TypedStore';

const debug = require('../preload-safe-debug')('Ferdium:RecipeStore');

export default class RecipesStore extends TypedStore {
  @observable allRecipesRequest = new CachedRequest(this.api.recipes, 'all');

  @observable installRecipeRequest = new Request(this.api.recipes, 'install');

  @observable getRecipeUpdatesRequest = new Request(this.api.recipes, 'update');

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.recipe.install.listen(this._install.bind(this));
    this.actions.recipe.update.listen(this._update.bind(this));

    // Reactions
    this.registerReactions([this._checkIfRecipeIsInstalled.bind(this)]);
  }

  async setup(): Promise<void> {
    // Initially load all recipes
    this.all;
  }

  @computed get all(): Recipe[] {
    return this.allRecipesRequest.execute().result || [];
  }

  @computed get active() {
    const match = matchRoute(
      '/settings/services/add/:id',
      this.stores.router.location.pathname,
    );
    if (match) {
      const activeRecipe = this.one(match.id);
      if (activeRecipe) {
        return activeRecipe;
      }

      debug(`Recipe ${match.id} not installed`);
    }

    return null;
  }

  @computed get recipeIdForServices(): string[] {
    return this.stores.services.all.map(s => s.recipe.id);
  }

  one(id: string): Recipe | undefined {
    return this.all.find(recipe => recipe.id === id);
  }

  isInstalled(id: string): boolean {
    return !!this.one(id);
  }

  // Actions
  async _install({ recipeId }): Promise<Recipe> {
    const recipe = await this.installRecipeRequest.execute(recipeId).promise;
    await this.allRecipesRequest.invalidate({ immediately: true }).promise;

    return recipe;
  }

  @action async _update() {
    const recipeIds = this.recipeIdForServices;
    const recipes = {};

    // Hackfix, reference this.all to fetch services
    debug(`Check Recipe updates for ${this.all.map(recipe => recipe.id)}`);

    for (const r of recipeIds) {
      const recipe = this.one(r);
      if (recipe) {
        recipes[r] = recipe.version;
      }
    }

    if (Object.keys(recipes).length === 0) return;

    // TODO: This line needs to be uncomment once we fix the App-Server interaction problem.
    // const remoteUpdates = await this.getRecipeUpdatesRequest.execute(recipes)._promise;
    const remoteUpdates = [];

    // Check for local updates
    const allJsonFile = asarRecipesPath('all.json');
    const allJson = readJSONSync(allJsonFile);
    const localUpdates: string[] = [];

    for (const recipe of Object.keys(recipes)) {
      const version = recipes[recipe];

      // Find recipe in local recipe repository
      const localRecipe = allJson.find(r => r.id === recipe);

      if (localRecipe && semver.lt(version, localRecipe.version)) {
        localUpdates.push(recipe);
      }
    }

    const updates = [...remoteUpdates, ...localUpdates];
    debug(
      'Got update information (local, remote):',
      localUpdates,
      remoteUpdates,
    );

    const length = updates.length - 1;
    const syncUpdate = async i => {
      const update = updates[i];

      this.actions.recipe.install({ recipeId: update });
      await this.installRecipeRequest.promise;

      this.installRecipeRequest.reset();

      if (i === length) {
        this.stores.ui.showServicesUpdatedInfoBar = true;
      } else if (i < length) {
        syncUpdate(i + 1);
      }
    };

    if (length >= 0) {
      syncUpdate(0);
    }
  }

  async _checkIfRecipeIsInstalled(): Promise<void> {
    const { router } = this.stores;

    const match =
      router.location &&
      matchRoute('/settings/services/add/:id', router.location.pathname);
    if (match) {
      const recipeId = match.id;

      if (!this.stores.recipes.isInstalled(recipeId)) {
        router.push('/settings/recipes');
        debug(`Recipe ${recipeId} is not installed, trying to install it`);

        const recipe = await this.installRecipeRequest.execute(recipeId)
          .promise;
        if (recipe) {
          await this.allRecipesRequest.invalidate({ immediately: true })
            .promise;
          router.push(`/settings/services/add/${recipeId}`);
        } else {
          router.push('/settings/recipes');
        }
      }
    }
  }
}
