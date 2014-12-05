// This is the place where we bootstrap Angular.js using all registered modules
// We use jQuery() to run method after DOMContentLoaded
// Without this file, we have only a set of Angular.js modules. Unit tests may load all (or some of) the modules without
// this bootstrap script to perform tests on a set of modules

(<JQueryStatic>$)(() => {
  hawtioPluginLoader.loadPlugins(() => {
    if (hawtioPluginLoader.autoStart) {
      var doc = angular.element(document);
      var docEl = angular.element(document.documentElement);
      Logger.get("Core").info("Bootstrapping hawtio application");
      angular.bootstrap(doc, hawtioPluginLoader.getModules());
    }
  });
});
