export default class RecipePreviewsApi {
  server: any;

  constructor(server: any) {
    this.server = server;
  }

  all() {
    return this.server.getRecipePreviews();
  }

  featured() {
    return this.server.getFeaturedRecipePreviews();
  }

  search(needle: string) {
    return this.server.searchRecipePreviews(needle);
  }
}
