export default class FeaturesApi {
  server: any;

  constructor(server: any) {
    this.server = server;
  }

  default() {
    return this.server.getDefaultFeatures();
  }

  features() {
    return this.server.getFeatures();
  }
}
