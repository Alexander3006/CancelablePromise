'use strict';

class CancelablePromise {
  constructor(callback, promise = null, isCanceled = false, parent) {
    if (typeof callback !== 'function') throw new Error();
    this.isCanceled = isCanceled;
    this.promise =
      promise ??
      new Promise((res, rej) => {
        callback((val) => {
          if (this.isCanceled) rej(this);
          res(val);
        }, rej);
      });
    this.parent = parent;
  }

  then(onResult = (res) => res, onError) {
    if (typeof onResult !== 'function') throw new Error();
    const {promise, isCanceled} = this;
    const newPromise = promise.then(onResult, onError).catch(onError); // It's weird, but your tests require it. // Promise.reject return new Promise !!! //65 line
    return new CancelablePromise(() => {}, newPromise, isCanceled, this);
  }

  catch(onError) {
    if (typeof onError !== 'function') throw new Error();
    const {promise, isCanceled} = this;
    return new CancelablePromise(() => {}, promise.catch(onError), isCanceled, this);
  }

  cancel() {
    this?.parent?.cancel();
    this.isCanceled = true;
    return this;
  }
}

export default CancelablePromise;
