
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io, bootstrap3 edition");

  var redirect = require("redirecter");

  grunt.config.init({

    pkg: grunt.file.readJSON("package.json"),

    /* task configuration */

    // https://www.npmjs.org/package/grunt-bower
    bower: {
      install: {
        options: {
          targetDir: "src/main/webapp/bower_components",
          copy: false
        }
      }
    },

    // https://www.npmjs.org/package/grunt-karma
    karma: {
      unit: {
        configFile: "src/test/config/karma.conf.js"
      },
      "unit-watch": {
        configFile: "src/test/config/karma.conf.js",
        autoWatch: true,
        singleRun: false
      },
      chrome: {
        configFile: "src/test/config/karma.conf.js",
        autoWatch: true,
        singleRun: false,
        browsers: [ "Chrome" ]
      }
    },

    // https://www.npmjs.org/package/grunt-typescript (~8 seconds)
    typescript: {
      base: {
        src: [ "src/main/d.ts/*.d.ts", "src/main/webapp/app/**/*.ts" ],
        dest: "src/main/webapp/app/app.js",
        options: {
          removeComments: true,
          module: "commonjs",
          target: "ES5",
          declaration: true,
          sourceMap: true,
          watch: false
        }
      },
      dev: {
        src: [ "src/main/d.ts/**/*.d.ts", "src/main/webapp/app/**/*.ts" ],
        dest: "src/main/webapp/app/app.js",
        options: {
          removeComments: true,
          module: "commonjs",
          target: "ES5",
          declaration: false,
          sourceMap: true,
          watch: grunt.option("watch") ? {
            path: "src/main/webapp/app",
            atBegin: true
          } : false
        }
      }
    },

    // https://www.npmjs.org/package/grunt-express
    // https://github.com/blai/grunt-express
    // http://stackoverflow.com/a/5290324/250517
    express: {
      server: {
        options: {
          port: 9001,
          bases: [ "src/main/webapp" ],
          //server: "src/test/servers/server1.js"
          middleware: [
              // we can use the following middleware:
              // * https://github.com/senchalabs/connect#user-content-middleware
              // * https://github.com/Raynos/http-framework/wiki/Modules
              // * generic middlewares in the form of "function(req, res, next) {}"
              // for what you can do with req and res, see http://nodejs.org/api/http.html

              // minimal Jolokia server
              function (req, res, next) {
                if (/^\/jolokia/.test(req.url)) {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.write(JSON.stringify({
                    "timestamp": 1417766745,
                    "status": 200,
                    "request": {"type": "version"},
                    "value": {
                      "protocol": "7.2",
                      "config": {"agentId": "agentid", "agentType": "servlet"},
                      "agent": "1.2.3",
                      "info": {}
                    }
                  }, null, 0));
                  res.end();
                } else {
                  next();
                }
              },
              // redirect non-resource requests to index.html (https://code.angularjs.org/1.3.5/docs/guide/$location#server-side)
              function (req, res, next) {
                var lastPath = req.url.split("/").pop();
                var last = lastPath.split("?", 1)[0];
                if (last !== "" && !/\.[a-z0-9]+$/.test(last)) {
                  console.log("Redirecting: " + req.url);
                  redirect(req, res, "/");
                } else {
                  // just invoke next middleware (created from options.bases)
                  next();
                }
              }
          ]
        }
      }
    }

  });

  require("load-grunt-tasks")(grunt);

  /* task aliases */

  // "grunt server" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("server", "Starts a webserver which hosts hawt.io without backend Java server", [ "express:server", "express-keepalive" ]);

  // test related tasks

  grunt.registerTask("test", "Runs unit tests once", [ "karma:unit" ]);
  grunt.registerTask("test-watch", "Runs unit tests continuously with PhantomJS browser", [ "karma:unit-watch" ]);
  grunt.registerTask("test-chrome", "Runs unit tests continuously with Chrome browser", [ "karma:chrome" ]);
  grunt.registerTask("e2e", [ "protractor:all" ]);

  // TS compiler with fast incremental watcher
  grunt.registerTask("tsc", [ "typescript:dev" ]);

};
