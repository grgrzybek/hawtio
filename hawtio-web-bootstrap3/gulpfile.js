
// gulp and plugins
var gulp = require("gulp");
var plugins = require("gulp-load-plugins")({ lazy: false });


// Default
gulp.task("default", [ "bower" ], function() {
  require("run-sequence")("typescript-files", "test");
});

// Bower
gulp.task("bower", function () {
  plugins["bower"]();
});

// TypeScript compilation
// https://www.npmjs.com/package/gulp-typescript
var ts = plugins["typescript"];
var eventStream = require("event-stream");
// https://github.com/floridoo/gulp-sourcemaps
var sourcemaps = plugins["sourcemaps"];

var tsProject = ts.createProject({
  removeComments: true,
  module: "commonjs",
  target: "ES5",
  declarationFiles: true,
  noExternalResolve: true,
  sortOutput: true
});

var sources = [ "src/main/d.ts/**/*.d.ts", "src/main/webapp/app/**/*.ts" ];
gulp.task("typescript-files", function () {
  var tsResult = gulp.src(sources)
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject));

  return eventStream.merge(
    tsResult.js
        .pipe(plugins["concatSourcemap"]("app.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("src/main/webapp/app/")),
    tsResult.dts
        .pipe(plugins["concat"]("app.d.ts"))
        //.pipe(gulp.dest("src/main/webapp/app/"))
  );
});
gulp.task("watch", [ "typescript-files" ], function () {
  gulp.watch(sources, [ "typescript-files" ]);
});


// "gulp server" starts a webserver which hosts hawt.io without backend Java server
// this might be however very useful to connect to existing Jolokia agent

// middlewares
var redirect = require("redirecter");

gulp.task("server", function () {
  gulp.src("src/main/webapp")
      .pipe(plugins["webserver"]({ // https://github.com/schickling/gulp-webserver
        port: 9009,
        livereload: false,
        directoryListing: false,
        open: false,
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
      }));
});


// testing with Karma
// karma (https://github.com/karma-runner/gulp-karma)
var karma = require("karma").server;

gulp.task("test", function (done) {
  karma.start({ configFile: __dirname + "/src/test/config/karma.conf.js" });
});
gulp.task("tdd", function (done) {
  karma.start({ configFile: __dirname + "/src/test/config/karma.conf.js", autoWatch: true, singleRun: false });
});
gulp.task("tdd-chrome", function (done) {
  karma.start({ configFile: __dirname + "/src/test/config/karma.conf.js", autoWatch: true, singleRun: false, browsers: [ "Chrome" ] });
});
