'use strict';

const funcOrThrow = func => {
  if( typeof func !== 'function') throw new Error('Must be a function');
}

class CancelablePromise {
  constructor(executor, promise = null, isCanceled = false, parent = null) {
    if (!promise) funcOrThrow(executor);
    this.isCanceled = isCanceled;
    this.promise =
      promise ??
      new Promise((res, rej) => {
        executor((val) => {
          if (this.isCanceled) rej(this);
          res(val);
        }, rej);
      });
    this.parent = parent;
  }

  _next(promise) {
    return new CancelablePromise(() => {}, promise, this.isCanceled, this);
  }

  then(onResult = (res) => res, onError) {
    funcOrThrow(onResult);
    const { promise } = this;
    const newPromise = promise.then(onResult, onError).catch(onError); // "catch" is weird, but your tests require it. // Promise.reject return new Promise !!! //65 line
    return this._next(newPromise)
  }

  catch(onError) {
    funcOrThrow(onError);
    const {promise} = this;
    return this._next(promise);
  }

  cancel() {
    this?.parent?.cancel();
    this.isCanceled = true;
    return this;
  }
}

export default CancelablePromise;
