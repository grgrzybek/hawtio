
// gulp and plugins
var gulp = require("gulp");
var gutil = require("gulp-util");
var plugins = require("gulp-load-plugins")({ lazy: false });

// http://blog.nodejitsu.com/npmawesome-9-gulp-plugins/
// https://github.com/gulpjs/gulp-util
// https://github.com/wearefractal/gulp-concat
// https://github.com/terinjokes/gulp-uglify
// https://github.com/hparra/gulp-rename
// https://github.com/Metrime/gulp-filesize
// https://github.com/plus3network/gulp-less
// https://github.com/sindresorhus/gulp-changed
// https://github.com/floatdrop/gulp-watch

// Default
gulp.task("default", [ "bower" ], function() {
  require("run-sequence")("typescript-files", "test");
});


// Clean
// https://github.com/peter-vilja/gulp-clean
gulp.task("clean", function () {
  return gulp.src("dist", { read: false }).pipe(plugins.clean());
});


// Bower
// https://www.npmjs.com/package/gulp-bower
gulp.task("bower", function () {
  plugins.bower();
});


// Less
var lessTasks = require("./build/tasks/less.js")(gulp, plugins);
gulp.task("less", lessTasks.less);
gulp.task("less-min", [ "less" ], lessTasks.lessMin);
gulp.task("less-watch", [ "less-min" ], lessTasks.lessWatch);


// TypeScript compilation
// https://www.npmjs.com/package/gulp-typescript
var ts = plugins.typescript;
var eventStream = require("event-stream");
// https://github.com/floridoo/gulp-sourcemaps
var sourcemaps = plugins.sourcemaps;

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
        .pipe(plugins.concatSourcemap("app.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("src/main/webapp/app/")),
    tsResult.dts
        .pipe(plugins.concat("app.d.ts"))
        //.pipe(gulp.dest("src/main/webapp/app/"))
  );
});
gulp.task("watch", [ "typescript-files" ], function () {
  gulp.watch(sources, [ "typescript-files" ]);
});


// "gulp server" starts a webserver which hosts hawt.io without backend Java server
// this might be however very useful to connect to existing Jolokia agent
// https://github.com/schickling/gulp-webserver

// middlewares
var redirect = require("redirecter");

// minimal Jolokia server
var jolokia = function (req, res, next) {
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
};

// redirect non-resource requests to index.html (https://code.angularjs.org/1.3.5/docs/guide/$location#server-side)
var redirecter = function (req, res, next) {
  var lastPath = req.url.split("/").pop();
  var last = lastPath.split("?", 1)[0];
  if (last !== "" && !/\.[a-z0-9]+$/.test(last)) {
    console.log("Redirecting: " + req.url);
    redirect(req, res, "/");
  } else {
    // just invoke next middleware
    next();
  }
};

gulp.task("server", function () {
  gulp.src("src/main/webapp")
      .pipe(plugins.webserver({
        port: 9009,
        livereload: false,
        directoryListing: false,
        open: false,
        // we can use the following middleware:
        // * https://github.com/senchalabs/connect#user-content-middleware
        // * https://github.com/Raynos/http-framework/wiki/Modules
        // * generic middlewares in the form of "function(req, res, next) {}"
        // for what you can do with req and res, see http://nodejs.org/api/http.html
        middleware: [
          jolokia,
          redirecter
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
