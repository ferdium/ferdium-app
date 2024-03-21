import { isEqual } from 'lodash';
import { action } from 'mobx';
import Request from './Request';

export default class CachedRequest extends Request {
  _apiCalls: any[] = [];

  _isInvalidated = true;

  execute(...callArgs): this {
    // Do not continue if this request is already loading
    if (this.isWaitingForResponse) {
      return this;
    }

    // Very simple caching strategy -> only continue if the call / args changed
    // or the request was invalidated manually from outside
    const existingApiCall = this._findApiCall(callArgs);

    // Invalidate if new or different api call will be done
    if (existingApiCall && existingApiCall !== this.currentApiCall) {
      this._isInvalidated = true;
      this.currentApiCall = existingApiCall;
    } else if (!existingApiCall) {
      this._isInvalidated = true;
      this.currentApiCall = this._addApiCall(callArgs);
    }

    // Do not continue if this request is not invalidated (see above)
    if (!this._isInvalidated) {
      return this;
    }

    // This timeout is necessary to avoid warnings from mobx
    // regarding triggering actions as side-effect of getters
    setTimeout(
      action(() => {
        this.isExecuting = true;
        // Apply the previous result from this call immediately (cached)
        if (existingApiCall) {
          this.result = existingApiCall.result;
        }
      }),
      0,
    );

    // Issue api call & save it as promise that is handled to update the results of the operation
    this.promise = new Promise(resolve => {
      this.api[this.method](...callArgs)
        .then(result => {
          setTimeout(
            action(() => {
              this.result = result;
              if (this.currentApiCall) this.currentApiCall.result = result;
              this.isExecuting = false;
              this.isError = false;
              this.wasExecuted = true;
              this._isInvalidated = false;
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
                // reject(error);
              }),
              1,
            );
          }),
        );
    });

    this.isWaitingForResponse = true;
    return this;
  }

  static defaultOptions = { immediately: false };

  invalidate(options = CachedRequest.defaultOptions): this {
    this._isInvalidated = true;
    if (options.immediately && this.currentApiCall) {
      return this.execute(...this.currentApiCall.args);
    }
    return this;
  }

  patch(modify): Promise<this> {
    return new Promise(resolve => {
      setTimeout(
        action(() => {
          const override = modify(this.result);
          if (override !== undefined) this.result = override;
          if (this.currentApiCall) this.currentApiCall.result = this.result;
          resolve(this);
        }),
        0,
      );
    });
  }

  _addApiCall(args: any) {
    const newCall = { args, result: null };
    this._apiCalls.push(newCall);
    return newCall;
  }

  _findApiCall(args: any) {
    return this._apiCalls.find(c => isEqual(c.args, args));
  }
}
