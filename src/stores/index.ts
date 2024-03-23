import type { RouterStore } from '@superwf/mobx-react-router';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import { communityRecipesStore } from '../features/communityRecipes';
import { todosStore } from '../features/todos';
import { workspaceStore } from '../features/workspaces';
import AppStore from './AppStore';
import FeaturesStore from './FeaturesStore';
import GlobalErrorStore from './GlobalErrorStore';
import RecipePreviewsStore from './RecipePreviewsStore';
import RecipesStore from './RecipesStore';
import RequestStore from './RequestStore';
import ServicesStore from './ServicesStore';
import SettingsStore from './SettingsStore';
import UIStore from './UIStore';
import UserStore from './UserStore';

export interface RealStores {
  router: RouterStore;
  app: AppStore;
  user: UserStore;
  features: FeaturesStore;
  settings: SettingsStore;
  services: ServicesStore;
  recipes: RecipesStore;
  recipePreviews: RecipePreviewsStore;
  ui: UIStore;
  requests: RequestStore;
  globalError: GlobalErrorStore;
  workspaces: typeof workspaceStore;
  communityRecipes: typeof communityRecipesStore;
  todos: typeof todosStore;
}

export default (
  api: ApiInterface,
  actions: Actions,
  router: RouterStore,
): RealStores => {
  const stores: RealStores | any = {};
  Object.assign(stores, {
    router,
    app: new AppStore(stores, api, actions),
    user: new UserStore(stores, api, actions),
    features: new FeaturesStore(stores, api, actions),
    settings: new SettingsStore(stores, api, actions),
    services: new ServicesStore(stores, api, actions),
    recipes: new RecipesStore(stores, api, actions),
    recipePreviews: new RecipePreviewsStore(stores, api, actions),
    ui: new UIStore(stores, api, actions),
    requests: new RequestStore(stores, api, actions),
    globalError: new GlobalErrorStore(stores, api, actions),
    workspaces: workspaceStore,
    communityRecipes: communityRecipesStore,
    todos: todosStore,
  });

  // Initialize all stores
  for (const name of Object.keys(stores)) {
    if (stores[name]?.initialize) {
      stores[name].initialize();
    }
  }

  return stores;
};
