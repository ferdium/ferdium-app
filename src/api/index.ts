import AppApi from './AppApi';
import FeaturesApi from './FeaturesApi';
import LocalApi from './LocalApi';
import RecipePreviewsApi from './RecipePreviewsApi';
import RecipesApi from './RecipesApi';
import ServicesApi from './ServicesApi';
import UserApi from './UserApi';

export interface ApiInterface {
  app: AppApi;
  services: ServicesApi;
  recipePreviews: RecipePreviewsApi;
  recipes: RecipesApi;
  features: FeaturesApi;
  user: UserApi;
  local: LocalApi;
}

export default (server: any, local: any): ApiInterface => ({
  app: new AppApi(server),
  services: new ServicesApi(server, local),
  recipePreviews: new RecipePreviewsApi(server),
  recipes: new RecipesApi(server),
  features: new FeaturesApi(server),
  user: new UserApi(server, local),
  local: new LocalApi(server, local),
});
