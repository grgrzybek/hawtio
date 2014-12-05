/// <reference path="../../../../d.ts/lodash/lodash.d.ts" />
module Core {

  /* no Angular.js code here - only classes/functions in Core namespace */

  /**
   * Simple implementation of window.localStorage if there's no native implementation
   */
  export class DummyStorage implements Storage {
    dummy:boolean = true;
    remainingSpace:number = 0;

    private _length:number;
    get length(): number {
      return _.size(this.storage);
    }

    private storage:{};

    [ key: string ]: any;
    [ key: number ]: string;

    getItem(key:string):string {
      return this.storage[key];
    }

    setItem(key:string, data:string):void {
      this.storage[key] = data;
    }

    clear():void {
      this.storage = {};
    }

    removeItem(key:string):void {
      delete this.storage[key];
    }

    key(index:number):string {
      return undefined;
    }
  }

  /**
   * Returns window's or fake local storage object
   * @param $window
   * @returns {Storage}
   */
  export function getLocalStorage($window:Window):Storage {
    return $window.localStorage ? $window.localStorage : new DummyStorage();
  }

}
