const debug = require('../preload-safe-debug')('Ferdium:Plugin:SessionHandler');

export default class SessionHandler {
  async releaseServiceWorkers() {
    try {
      const registrations =
        await window.navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        registration.unregister();
        debug('ServiceWorker unregistered');
      }
    } catch (error) {
      debug(error);
    }
  }
}
