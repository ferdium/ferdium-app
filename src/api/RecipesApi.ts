export default class RecipesApi {
  server: any;

  constructor(server: any) {
    this.server = server;
  }

  all() {
    return this.server.getInstalledRecipes();
  }

  install(recipeId: string) {
    return this.server.getRecipePackage(recipeId);
  }

  update(recipes: any) {
    return this.server.getRecipeUpdates(recipes);
  }
}
