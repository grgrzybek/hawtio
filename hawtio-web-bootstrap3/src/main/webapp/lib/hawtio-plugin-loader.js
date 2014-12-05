/*
 * Simple script loader and registry
 */

// this should be a single global in entire hawtio
var hawtioPluginLoader = (function(self, window, undefined) {

  var LOG = Logger.get("PluginLoader");

  /**
   * May be set to false to prevent (e.g., unit or integration tests) from bootstraping Angular.js
   * @type {boolean}
   */
  self.autoStart = true;

  // single instance of loader callback
  self.loaderCallback = null;

  /**
   * List of URLs that the plugin loader will try and discover plugins from
   * @type {Array}
   */
  self.urls = [];

  /**
   * Holds all of the angular modules that need to be bootstrapped
   * @type {Array}
   */
  self.modules = [];


  /**
   * Tasks to be run before bootstrapping, tasks can be async.
   * Supply a function that takes the next task to be executed as an argument and be sure to call the passed in function.
   * @type {Array}
   */
  self.tasks = [];

  /**
   * Register a task that will be executed before bootstraping Angular.js
   * @param task
   */
  self.registerPreBootstrapTask = function(task) {
    self.tasks.push(task);
  };

  /**
   * Adds hawtio module
   * @param module
   */
  self.addModule = function(module) {
    LOG.debug("Adding module: " + module);
    self.modules.push(module);
  };

  /**
   * Adds an URL to discover plugins
   * @param url
   */
  self.addUrl = function(url) {
    LOG.debug("Adding URL: " + url);
    self.urls.push(url);
  };

  /**
   * Returns a shallow copy of regitered modules
   * @returns {*}
   */
  self.getModules = function() {
    //return _.clone(self.modules);
    return self.modules.slice(0);
  };

  /**
   * Parses the given query search string of the form "?foo=bar&whatnot"
   * @param text
   * @return {*} a map of key/values
   */
  self.parseQueryString = function(text) {
    // just look in window.location.href, sometimes location.search isn't set yet when this function is run
    var search = null;
    var parts = self.windowLocation().href.split('?');
    if (parts) {
      search = _.last(parts, parts.length - 1).join("");
    }
    var query = (text || search || '?');
    var idx;
    if (_.isArray(query)) {
      query = query[0];
    }
    idx = query.indexOf("?");
    if (idx >= 0) {
      query = query.substr(idx + 1);
    }
    // if query string ends with #/ then lets remove that too
    idx = query.indexOf("#/");
    if (idx > 0) {
      query = query.substr(0, idx);
    }
    var map = {};
    query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
      (map[key] = map[key] || []).push(value);
    });
    return map;
  };

  /**
   * Sets loader callback (replaces existing)
   * @param cb
   */
  self.setLoaderCallback = function(cb) {
    self.loaderCallback = cb;
    if (cb) {
      LOG.debug("Setting callback to : ", self.loaderCallback);
    } else {
      LOG.debug("Removing callback");
    }
  };

  /**
   * Prints information about registered modules and URLs
   */
  self.debug = function() {
    LOG.debug("urls and modules");
    LOG.debug(self.urls);
    LOG.debug(self.modules);
  };

  /**
   * Main function which loads all urls, discovers plugin scripts, loads them and executes passed callback
   * @param callback
   */
  self.loadPlugins = function(callback) {
    var lcb = self.loaderCallback;

    var plugins = {};

    var urlsToLoadLength = self.urls.length;
    var totalUrls = urlsToLoadLength;

    /**
     * Bootstrap hawtio after loading all plugins
     */
    var bootstrap = function() {
      self.tasks.push(callback);
      var numTasks = self.tasks.length;

      var executeTask = function() {
        var task = self.tasks.shift();
        if (task) {
          LOG.debug("Executing task " + (numTasks - self.tasks.length) + " of " + numTasks);
          task(executeTask);
        } else {
          LOG.debug("All tasks executed");
        }
      };

      executeTask();
    };

    /**
     * Load scripts from discovered plugins
     */
    var loadScripts = function() {
      // keep track of when scripts are loaded so we can execute the callback
      var scriptsToLoadLength = 0;
      _.each(plugins, function (value, key) {
        scriptsToLoadLength += value["Scripts"].length;
      });

      var totalScripts = scriptsToLoadLength;

      var scriptLoaded = function() {
        $.ajaxSetup({ async: false });
        scriptsToLoadLength--;
        if (lcb) {
          lcb.scriptLoaderCallback(totalScripts, scriptsToLoadLength);
        }
        if (scriptsToLoadLength == 0) {
          bootstrap();
        }
      };

      if (scriptsToLoadLength > 0) {
        _.each(plugins, function (value, key) {
          value["Scripts"].forEach(function (script) {
            LOG.debug("Loading script: ", value["Name"], " script: ", script);
            var scriptName = value.Context + "/" + script;
            LOG.debug("Fetching script: ", scriptName);
            $.ajaxSetup({ async: false });
            $.getScript(scriptName)
                .done(function(data, textStatus) {
                  LOG.debug("Loaded script: ", scriptName);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                  LOG.error("Failed loading script: \"", errorThrown.message, "\" (<a href=\"", scriptName, ":", errorThrown.lineNumber, "\">", scriptName, ":", errorThrown.lineNumber, "</a>)");
                })
                .always(scriptLoaded);
          });
        });
      } else {
        // no scripts to load, so just do the bootstrap
        $.ajaxSetup({ async: true });
        bootstrap();
      }
    };

    /**
     * Invoked after loading plugin metadata from given url
     */
    var urlLoaded = function () {
      urlsToLoadLength--;
      if (lcb) {
        lcb.urlLoaderCallback(totalUrls, urlsToLoadLength);
      }
      if (urlsToLoadLength == 0) {
        // load scripts after loading plugin info from urls
        loadScripts();
      }
    };

    if (urlsToLoadLength > 0) {
      // first we need to discover plugins
      self.urls.forEach(function (url, index) {
        var pluginsData = null;
        if (/^jolokia/.test(url)) {
          var parts = url.split(":");
          parts = parts.reverse();
          parts.pop();

          url = parts.pop();
          var attribute = parts.reverse().join(":");
          var jolokia = new Jolokia(url);
          try {
            pluginsData = jolokia.getAttribute(attribute, null);
            $.extend(plugins, pluginsData);
            urlLoaded();
          } catch (exception) {
            LOG.error(exception);
          }
        } else {
          LOG.debug("Trying url: ", url);
          $.get(url, function (data) {
            if (_.isString(data)) {
              try {
                pluginsData = JSON.parse(data);
                //LOG.debug("Got data: ", data);
                $.extend(plugins, pluginsData);
              } catch (exception) {
                // ignore this source of plugins
                LOG.warn(exception);
              }
            }
          }, "text").always(function() {
            urlLoaded();
          });
        }
      });
    } else {
      // no urls declared, load scripts immediately
      // TODO: but where those script come from then when there are no plugins?
      loadScripts();
    }
  };

  /**
   * Returns window.location. May be mocked/spyOn
   * @returns {Location|String|Location|*}
   */
  self.windowLocation = function() {
    return window.location;
  };

  // sets a callback invoked after all modules and urls are loaded
  self.setLoaderCallback({
    scriptLoaderCallback: function (total, remaining) {
      LOG.debug("Total scripts: ", total, " Remaining: ", remaining);
    },
    urlLoaderCallback: function (total, remaining) {
      LOG.debug("Total URLs: ", total, " Remaining: ", remaining);
    }
  });

  LOG.info("hawtio-plugin-loader.js loaded");

  return self;

})(hawtioPluginLoader || {}, window, void 0);
