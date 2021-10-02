export default class NewsApi {
  server: any;

  local: any;

  constructor(server: any, local: any) {
    this.server = server;
    this.local = local;
  }

  latest() {
    return this.server.getLatestNews();
  }

  hide(id: any) {
    return this.server.hideNews(id);
  }
}
