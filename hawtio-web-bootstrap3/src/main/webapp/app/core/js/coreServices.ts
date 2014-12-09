/// <reference path="_module.ts" />
/// <reference path="utils.ts" />
/// <reference path="../../../../d.ts/angularjs/angular.d.ts" />
module Core {

  /*
   * constants, values, factories, services and providers registered in "hawtioCore" module
   * Remember all of the above are Angular.js singletons.
   * If a service doesn't need DI than it doesn't have to be service/factory - it's enough to use value.
   * value: simplest singletons (objects, strings, even functions)
   * factory: if the above needs to use DI
   * service: if the service is created by "new ClassName(dep1, dep2, dep3, ...)"
   * provider: most general form. adds possibility to configure using module.config()
   * constant: may be used as dependency for provider (values/factories/services can't)
   */

  /**
   * Holds a mapping of plugins to layouts, plugins use this to specify a full width view, tree view or their own custom view
   */
  _module.value("viewRegistry", {});

  /**
   * Local storage object to wrap the HTML5 browser storage
   */
  _module.factory("localStorage", [ "$window", ($window) => {
    return $window.localStorage ? $window.localStorage : new DummyStorage();
  }]);

}
