import { action, computed, makeObservable, observable } from 'mobx';

// eslint-disable-next-line no-use-before-define
type Hook = (request: Request) => void;

export default class Request {
  static readonly _hooks: Hook[] = [];

  static registerHook(hook: Hook) {
    Request._hooks.push(hook);
  }

  @observable result: any = null;

  @observable error: any = null;

  @observable isExecuting = false;

  @observable isError = false;

  @observable wasExecuted = false;

  promise: any = Promise;

  protected api: any = {};

  method = '';

  protected isWaitingForResponse = false;

  protected currentApiCall: any = null;

  retry = () => this.reload();

  reset = () => this._reset();

  constructor(api, method) {
    makeObservable(this);

    this.api = api;
    this.method = method;
  }

  @action _reset(): this {
    this.error = null;
    this.result = null;
    this.isExecuting = false;
    this.isError = false;
    this.wasExecuted = false;
    this.isWaitingForResponse = false;
    this.promise = Promise;

    return this;
  }

  execute(...callArgs: any[]): this {
    // Do not continue if this request is already loading
    if (this.isWaitingForResponse) return this;

    if (!this.api[this.method]) {
      throw new Error(
        `Missing method <${this.method}> on api object:`,
        this.api,
      );
    }

    // This timeout is necessary to avoid warnings from mobx
    // regarding triggering actions as side-effect of getters
    setTimeout(
      action(() => {
        this.isExecuting = true;
      }),
      0,
    );

    // Issue api call & save it as promise that is handled to update the results of the operation
    this.promise = new Promise((resolve, reject) => {
      this.api[this.method](...callArgs)
        .then(result => {
          setTimeout(
            action(() => {
              this.error = null;
              this.result = result;
              if (this.currentApiCall) this.currentApiCall.result = result;
              this.isExecuting = false;
              this.isError = false;
              this.wasExecuted = true;
              this.isWaitingForResponse = false;
              this._triggerHooks();
              resolve(result);
            }),
            1,
          );
          return result;
        })
        .catch(
          action(error => {
            setTimeout(
              action(() => {
                this.error = error;
                this.isExecuting = false;
                this.isError = true;
                this.wasExecuted = true;
                this.isWaitingForResponse = false;
                this._triggerHooks();
                reject(error);
              }),
              1,
            );
          }),
        );
    });

    this.isWaitingForResponse = true;
    this.currentApiCall = { args: callArgs, result: null };
    return this;
  }

  reload(): this {
    const args = this.currentApiCall ? this.currentApiCall.args : [];
    this.error = null;
    return this.execute(...args);
  }

  @computed get isExecutingFirstTime(): boolean {
    return !this.wasExecuted && this.isExecuting;
  }

  /* eslint-disable unicorn/no-thenable */
  then(...args: any[]) {
    if (!this.promise)
      throw new Error(
        'You have to call Request::execute before you can access it as promise',
      );
    return this.promise.then(...args);
  }

  catch(...args: any[]) {
    if (!this.promise)
      throw new Error(
        'You have to call Request::execute before you can access it as promise',
      );
    return this.promise.catch(...args);
  }

  _triggerHooks(): void {
    for (const hook of Request._hooks) {
      hook(this);
    }
  }
}
