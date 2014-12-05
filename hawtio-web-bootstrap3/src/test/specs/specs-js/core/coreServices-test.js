describe("core services test", function () {

  /* Tests using angular-mocks */

  beforeEach(module("hawtioCore"));

  it("has access to controllers from tested module (just an example of controller testing)", function () {
    inject(function ($controller) {
      var scope = {};
      var appController = $controller("Core.AppController", { $scope: scope });
      expect(appController).toBeDefined();
      expect(appController).not.toBe(null);
      // test what controller do with $scope
      //expect(scope.name).toBe("A");
    });
  });

  it("Should use dummy local storage provided by Core module", function () {
    module(function($provide) {
      $provide.value("$window", {});
    });
    inject(function (localStorage) {
      expect(localStorage).toBeDefined();
      expect(localStorage).not.toBe(null);
      expect(localStorage.dummy).toBe(true);
    });
  });

  it("Should use mocked local storage", function () {
    module(function($provide) {
      $provide.value("$window", { localStorage: { mock: true } });
    });
    inject(function (localStorage) {
      expect(localStorage).toBeDefined();
      expect(localStorage).not.toBe(null);
      expect(localStorage.dummy).not.toBeDefined();
      expect(localStorage.mock).toBe(true);
    });
  });

});
