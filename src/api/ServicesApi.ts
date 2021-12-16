export default class ServicesApi {
  server: any;

  local: any;

  constructor(server: any, local: any) {
    this.server = server;
    this.local = local;
  }

  all() {
    return this.server.getServices();
  }

  create(recipeId: string, data: any) {
    return this.server.createService(recipeId, data);
  }

  delete(serviceId: string) {
    return this.server.deleteService(serviceId);
  }

  update(serviceId: string, data: any) {
    return this.server.updateService(serviceId, data);
  }

  reorder(data: any) {
    return this.server.reorderService(data);
  }

  clearCache(serviceId: string) {
    return this.local.clearCache(serviceId);
  }
}
