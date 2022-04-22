// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:Plugin:SessionHandler');

export class SessionHandler {
  async releaseServiceWorkers() {
    try {
      const registrations =
        await window.navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        registration.unregister();
        console.log('ServiceWorker unregistered');
      }
    } catch (error) {
      console.log(error);
    }
  }
}
