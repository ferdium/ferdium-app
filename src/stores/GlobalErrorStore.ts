import type { Response } from 'electron';
import { action, makeObservable, observable } from 'mobx';
import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import Request from './lib/Request';
import TypedStore from './lib/TypedStore';

interface Message {
  type: 'error' | 'log' | 'info';
  error?: {
    message?: string;
    status?: number;
  };
  request?: Request;
  response?: Response;
  server?: any;
  info?: any;
  url?: string;
  line?: number;
}

export default class GlobalErrorStore extends TypedStore {
  @observable error: any | null = null;

  @observable messages: Message[] = [];

  @observable response: Response = {} as Response;

  // TODO: Get rid of the @ts-expect-errors in this function.
  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    window.addEventListener('error', (...errorArgs: any[]): void => {
      // @ts-expect-error ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['error', ...errorArgs]);
    });

    const origConsoleError = console.error;
    window.console.error = (...errorArgs: any[]) => {
      // @ts-expect-error ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['error', ...errorArgs]);
      origConsoleError.apply(this, errorArgs);
    };

    // eslint-disable-next-line no-console
    const origConsoleLog = console.log;
    window.console.log = (...logArgs: any[]) => {
      // @ts-expect-error ts-message: Expected 5 arguments, but got 2.
      this._handleConsoleError.call(this, ['log', ...logArgs]);
      origConsoleLog.apply(this, logArgs);
    };

    // eslint-disable-next-line no-console
    const origConsoleInfo = console.info;
    window.console.info = (...infoArgs: any[]) => {
      // @ts-expect-error ts-message: Expected 5 arguments, but got 2.
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

  @action _handleRequests = async (request: Request): Promise<void> => {
    if (request.isError) {
      this.error = request.error;

      if (request.error?.json) {
        try {
          this.response = await request.error.json();
        } catch {
          this.response = {} as Response;
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
          method: request.method,
        } as Request,
        error: this.error,
        response: this.response,
        server: window['ferdium'].stores.settings.app.server,
      });
    } else {
      window['ferdium'].stores.app.authRequestFailed = false;
    }
  };
}
