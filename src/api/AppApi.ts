export default class AppApi {
  server: any;

  constructor(server: any) {
    this.server = server;
  }

  health() {
    return this.server.healthCheck();
  }
}
