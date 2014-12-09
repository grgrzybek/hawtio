/// <reference path="../../../../d.ts/hawtio-plugin-loader.d.ts" />
/// <reference path="../../../../d.ts/js-logger.d.ts" />
/// <reference path="../../../../d.ts/angularjs/angular.d.ts" />
/// <reference path="../../../../d.ts/angularjs/angular-route.d.ts" />
/**
 * Main module of hawtio.
 * (Hawtio should be able to run with only this module enabled)
 */
module Core {

  /**
   * Name of plugin registered to hawtio's plugin loader and Angularjs module name
   * @property pluginName
   * @for Core
   * @type String
   */
  export var pluginName:string = "hawtioCore";

  /**
   * Path to template files for this plugin
   * @property pluginName
   * @for Core
   * @type String
   */
  export var templatePath:string = "app/core/html/";

  /**
   * The main hawtioCore Angular.js module
   * @type {IModule}
   * @private
   */
  export var _module:ng.IModule = angular.module(pluginName, [ "ngRoute" ]);

  // each module should configure $routeProvider
  _module.config(["$routeProvider", "$locationProvider", ($routeProvider:ng.route.IRouteProvider, $locationProvider:ng.ILocationProvider) => {
    $routeProvider
        .when("/welcome", { templateUrl: templatePath + "welcome.html" })
        .when("/about", { templateUrl: templatePath + "about.html" })
        .when("/help/:topic", { templateUrl: templatePath + "help.html" })
        .when("/help/:topic/:subtopic", { templateUrl: templatePath + "help.html" })
        .otherwise({ redirectTo: "/welcome" });

    $locationProvider.html5Mode(true);
    //$locationProvider.html5Mode({ enabled: true, requireBase: true, rewriteLinks: true });
  }]);

  _module.run(["$rootScope", ($rootScope) => {
    $rootScope.$on("$routeChangeSuccess", (event:ng.IAngularEvent) => {
    });
  }]);

}

// each module should register itself in hawtioPluginLoader
hawtioPluginLoader.addModule(Core.pluginName);
