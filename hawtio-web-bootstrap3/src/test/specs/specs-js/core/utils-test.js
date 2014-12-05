describe("core utils test", function () {

  /* Tests not using angular-mocks */

  /*
   * Helper static functions inside modules (not Angular.js ones, but TypeScript ones) should take arguments which may be mocked
   * So this is good:
   *    function getLocalStorage(window) { return window.localStorage; }
   * This is bad:
   *    function getLocalStorage() { return window.localStorage; }
   */

  it("Should use dummy local storage provided by Core module", function () {
    var localStorage = Core.getLocalStorage({});
    expect(localStorage).toBeDefined();
    expect(localStorage).not.toBe(null);
    expect(localStorage.dummy).toBe(true);
    expect(localStorage.mock).not.toBeDefined();
  });

  it("Should use mocked local storage", function () {
    var localStorage = Core.getLocalStorage({ localStorage: { mock: true } });
    expect(localStorage).toBeDefined();
    expect(localStorage).not.toBe(null);
    expect(localStorage.dummy).not.toBeDefined();
    expect(localStorage.mock).toBe(true);
  });

});
