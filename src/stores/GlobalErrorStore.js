import { observable, action } from 'mobx';
import Store from './lib/Store';
import Request from './lib/Request';

export default class GlobalErrorStore extends Store {
  @observable error = null;

  @observable errors = [];

  @observable response = {};

  constructor(...args) {
    super(...args);

    window.onerror = this._handleConsoleError.bind(this);

    const origConsoleError = console.error;
    console.error = (...errorArgs) => {
      this._handleConsoleError.call(this, errorArgs);
      origConsoleError.apply(this, errorArgs);
    };

    Request.registerHook(this._handleRequests);
  }

  _handleConsoleError(error, url, line) {
    this.errors.push({
      error,
      url,
      line,
    });
  }

  _handleRequests = action(async (request) => {
    if (request.isError) {
      this.error = request.error;

      if (request.error.json) {
        try {
          this.response = await request.error.json();
        } catch (error) {
          this.response = {};
        }
        if (this.error.status === 401) {
          window.ferdi.stores.app.authRequestFailed = true;
          // this.actions.user.logout({ serverLogout: true });
        }
      }

      this.errors.push({
        request: {
          result: request.result,
          wasExecuted: request.wasExecuted,
          method: request._method,
        },
        error: this.error,
        response: this.response,
        server: window.ferdi.stores.settings.app.server,
      });
    } else {
      window.ferdi.stores.app.authRequestFailed = false;
    }
  });
}
