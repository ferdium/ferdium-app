import AppApi from './AppApi';
import ServicesApi from './ServicesApi';
import RecipePreviewsApi from './RecipePreviewsApi';
import RecipesApi from './RecipesApi';
import UserApi from './UserApi';
import LocalApi from './LocalApi';
import FeaturesApi from './FeaturesApi';

export default (server: any, local: any) => ({
  app: new AppApi(server),
  services: new ServicesApi(server, local),
  recipePreviews: new RecipePreviewsApi(server),
  recipes: new RecipesApi(server),
  features: new FeaturesApi(server),
  user: new UserApi(server, local),
  local: new LocalApi(server, local),
});
