describe("Tests of hawtio plugin loader", function () {

  var plugins = {
    "plugin1": {
      "Name": "plugin 1",
      "Context": "/plugin1",
      "Domain": null,
      "Scripts": ["script.js"]
    },
    "plugin2": {
      "Name": "plugin 2",
      "Context": "/plugin2",
      "Domain": null,
      "Scripts": ["script1.js", "script2.js"]
    }
  };
  var resources = {
    "plugin": plugins,
    "/jolokia/read/hawtio%3Atype%3Dplugin%2Cname%3D*/*": {
      "timestamp": 42,
      "status": 200,
      "request": {
        "mbean": "hawtio:name=*,type=plugin",
        "type": "read"
      },
      "value": plugins
    },
    "/plugin1/script.js": "window.result[\"s\"] = \"s\";",
    "/plugin2/script1.js": "window.result[\"s1\"] = \"s1\";",
    "/plugin2/script2.js": "window.result[\"s2\"] = \"s2\";"
  };

  beforeEach(function () {
    hawtioPluginLoader.setLoaderCallback(null);
    hawtioPluginLoader.modules = [];
    hawtioPluginLoader.urls = [];
    hawtioPluginLoader.tasks = [];
    //Logger.setLevel(Logger.DEBUG);
  });

  afterEach(function () {
  });

  it("May be used to parse query strings into map of search terms", function () {
    var map = hawtioPluginLoader.parseQueryString("");
    expect(_.keys(map).length).toBe(0);

    map = hawtioPluginLoader.parseQueryString("http://localhost/#/x?a=b?a?a?a&c=1&c=2&d");
    expect(_.keys(map).length).toBe(3);
    expect(map).toEqual({ "a": [ "b?a?a?a" ], "c": [ "1", "2" ], "d": [ "" ] });
  });

  it("May parse window.location.href", function () {
    spyOn(hawtioPluginLoader, "windowLocation").and.returnValue({
      href: "http://localhost/hawtio?a=b?c&a=d&b=e"
    });
    var map = hawtioPluginLoader.parseQueryString(undefined);

    expect(_.keys(map).length).toBe(2);
    expect(map).toEqual({ "a": [ "bc", "d" ], "b": [ "e" ] });
  });

  it("Should do nothing without urls, modules and tasks", function(done) {
    var invoked = false;
    hawtioPluginLoader.loadPlugins(function() {
      invoked = true;
      expect(invoked).toBe(true);
      done();
    });
  });

  it("Should call pre bootstrap tasks in order", function(done) {
    var results = [];
    hawtioPluginLoader.registerPreBootstrapTask(function (task) {
      results.push(1);
      task();
    });
    hawtioPluginLoader.registerPreBootstrapTask(function (task) {
      results.push(2);
      task();
    });
    hawtioPluginLoader.loadPlugins(function() {
      results.push(3);
      expect(results).toEqual([ 1, 2, 3 ]);
      done();
    });
  });

  it("Should store registered modules in order", function() {
    ["m2", "m1", "m3"].forEach(function (module) {
      hawtioPluginLoader.addModule(module);
    });
    var modules = hawtioPluginLoader.getModules();
    expect(modules).toEqual([ "m2", "m1", "m3" ]);
  });

  it("Should not call loader callback if there are no urls/plugins", function(done) {
    var urlCbResults = [];
    var scriptCbResults = [];
    hawtioPluginLoader.setLoaderCallback({
      urlLoaderCallback: function(totalUrls, urlsToLoadLength) {
        urlCbResults.push({ total: totalUrls, count: urlsToLoadLength });
      },
      scriptLoaderCallback: function(totalScripts, scriptsToLoadLength) {
        scriptCbResults.push({ total: totalScripts, count: scriptsToLoadLength });
      }
    });
    hawtioPluginLoader.loadPlugins(function() {
      expect(urlCbResults.length).toBe(0);
      expect(scriptCbResults.length).toBe(0);
      done();
    });
  });

  it("Should load all scripts from discovered plugins from given url (not using Jolokia) using real $.ajax() call", function(done) {
    var urlCbResults = [];
    var scriptCbResults = [];
    hawtioPluginLoader.setLoaderCallback({
      urlLoaderCallback: function(totalUrls, urlsToLoadLength) {
        urlCbResults.push({ total: totalUrls, count: urlsToLoadLength });
      },
      scriptLoaderCallback: function(totalScripts, scriptsToLoadLength) {
        scriptCbResults.push({ total: totalScripts, count: scriptsToLoadLength });
      }
    });

    // global variable available from fake plugin scripts
    window.result = {};
    hawtioPluginLoader.addUrl("/base/src/test/webapp/static-resources/plugin.json");
    hawtioPluginLoader.loadPlugins(function() {
      expect(urlCbResults).toEqual([ { total: 1, count: 0 } ]);
      expect(scriptCbResults).toEqual([ { total: 3, count: 2 }, { total: 3, count: 1 }, { total: 3, count: 0 } ]);
      expect(window.result).toEqual({ "s": "s", "s1": "s1", "s2": "s2" });
      done();
    });
  });

  describe("Tests with fake XHR", function() {

    beforeEach(function () {
      jasmine.Ajax.install();

      _.each(resources, function(resource, key) {
        var url, response, contentType;
        if (/\.js$/.test(key)) {
          // convert to RegExp. $.ajax adds timestamp query string to such URLs when fetching with "script" dataType
          url = new RegExp(key);
          response = resource;
          contentType = "text/javascript";
        } else /*if (/\.json$/.text(key))*/ {
          url = key;
          response = JSON.stringify(resource, null, 2);
          contentType = "application/json";
        }
        jasmine.Ajax.stubRequest(url).andReturn({
          "status": 200,
          "responseText": response,
          "contentType": contentType
        });
      });
    });

    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

    it("Should load all scripts from discovered plugins from given url (not using Jolokia) using jasmine.MockAjax call", function(done) {
      var urlCbResults = [];
      var scriptCbResults = [];
      hawtioPluginLoader.setLoaderCallback({
        urlLoaderCallback: function(totalUrls, urlsToLoadLength) {
          urlCbResults.push({ total: totalUrls, count: urlsToLoadLength });
        },
        scriptLoaderCallback: function(totalScripts, scriptsToLoadLength) {
          scriptCbResults.push({ total: totalScripts, count: scriptsToLoadLength });
        }
      });

      // global variable available from fake plugin scripts
      window.result = {};

      hawtioPluginLoader.addUrl("plugin");
      hawtioPluginLoader.loadPlugins(function() {
        expect(urlCbResults).toEqual([ { total: 1, count: 0 } ]);
        expect(scriptCbResults).toEqual([ { total: 3, count: 2 }, { total: 3, count: 1 }, { total: 3, count: 0 } ]);
        expect(window.result).toEqual({ "s": "s", "s1": "s1", "s2": "s2" });
        done();
      });
    });

    it("Should load all scripts from discovered plugins from Jolokia", function(done) {
      var urlCbResults = [];
      var scriptCbResults = [];
      hawtioPluginLoader.setLoaderCallback({
        urlLoaderCallback: function(totalUrls, urlsToLoadLength) {
          urlCbResults.push({ total: totalUrls, count: urlsToLoadLength });
        },
        scriptLoaderCallback: function(totalScripts, scriptsToLoadLength) {
          scriptCbResults.push({ total: totalScripts, count: scriptsToLoadLength });
        }
      });

      // global variable available from fake plugin scripts
      window.result = {};

      hawtioPluginLoader.addUrl("jolokia:/jolokia:hawtio:type=plugin,name=*");
      hawtioPluginLoader.loadPlugins(function() {
        expect(urlCbResults).toEqual([ { total: 1, count: 0 } ]);
        expect(scriptCbResults).toEqual([ { total: 3, count: 2 }, { total: 3, count: 1 }, { total: 3, count: 0 } ]);
        expect(window.result).toEqual({ "s": "s", "s1": "s1", "s2": "s2" });
        done();
      });
    });

  });

});
