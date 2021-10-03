export default class LocalApi {
  server: any;

  local: any;

  constructor(server: any, local: any) {
    this.server = server;
    this.local = local;
  }

  getAppSettings(type: string) {
    return this.local.getAppSettings(type);
  }

  updateAppSettings(type: string, data: any) {
    return this.local.updateAppSettings(type, data);
  }

  getAppCacheSize() {
    return this.local.getAppCacheSize();
  }

  clearCache() {
    return this.local.clearCache();
  }
}
