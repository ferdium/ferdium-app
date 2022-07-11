import { observable, action, makeObservable } from 'mobx';
import { Actions } from '../actions/lib/actions';
import { ApiInterface } from '../api';
import { Stores } from '../@types/stores.types';
import Request from './lib/Request';
import TypedStore from './lib/TypedStore';

interface Message {
  type: 'error' | 'log' | 'info';
  error?: {
    message?: string;
    status?: number;
  };
  request?: {
    result: any;
    wasExecuted: any;
    method: any;
  };
  response?: any;
  server?: any;
  info?: any;
  url?: string;
  line?: number;
}

export default class GlobalErrorStore extends TypedStore {
  @observable error: any | null = null;

  @observable messages: Message[] = [];

  @observable response: object = {};

  // TODO: Get rid of the @ts-ignores in this function.
  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    window.addEventListener('error', (...errorArgs: any[]): void => {
      // @ts-ignore ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['error', ...errorArgs]);
    });

    const origConsoleError = console.error;
    window.console.error = (...errorArgs: any[]) => {
      // @ts-ignore ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['error', ...errorArgs]);
      origConsoleError.apply(this, errorArgs);
    };

    const origConsoleLog = console.log;
    window.console.log = (...logArgs: any[]) => {
      // @ts-ignore ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['log', ...logArgs]);
      origConsoleLog.apply(this, logArgs);
    };

    const origConsoleInfo = console.info;
    window.console.info = (...infoArgs: any[]) => {
      // @ts-ignore ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['info', ...infoArgs]);
      origConsoleInfo.apply(this, infoArgs);
    };

    Request.registerHook(this._handleRequests);
  }

  async setup(): Promise<void> {
    // Not implemented
  }

  _handleConsoleError(type: any, error: any, url: string, line: number) {
    if (typeof type === 'object' && type.length > 0) {
      this.messages.push({
        type: type[0],
        info: type,
      });
    } else {
      this.messages.push({
        type,
        error,
        url,
        line,
      });
    }
  }

  @action _handleRequests = async (request: {
    isError: any;
    error: { json: () => object | PromiseLike<object> };
    result: any;
    wasExecuted: any;
    _method: any;
  }): Promise<void> => {
    if (request.isError) {
      this.error = request.error;

      if (request.error.json) {
        try {
          this.response = await request.error.json();
        } catch {
          this.response = {};
        }
        if (this.error?.status === 401) {
          window['ferdium'].stores.app.authRequestFailed = true;
        }
      }

      this.messages.push({
        type: 'error',
        request: {
          result: request.result,
          wasExecuted: request.wasExecuted,
          method: request._method,
        },
        error: this.error,
        response: this.response,
        server: window['ferdium'].stores.settings.app.server,
      });
    } else {
      window['ferdium'].stores.app.authRequestFailed = false;
    }
  };
}
