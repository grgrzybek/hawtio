
// https://www.npmjs.com/package/gulp-typescript
// https://github.com/floridoo/gulp-sourcemaps

module.exports = function(gulp, plugins) {

  var eventStream = require("event-stream");
  var ts = plugins.typescript;
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

  function tsTask() {
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
  }

  return {
    ts: tsTask
  };

};
