
// https://www.npmjs.com/package/gulp-less
// https://www.npmjs.com/package/gulp-autoprefixer
// https://github.com/floridoo/gulp-sourcemaps

module.exports = function(gulp, plugins) {

  var gutil = require("gulp-util");
  var combiner = require('stream-combiner2');
  var sourcemaps = plugins.sourcemaps;

  function lessTask() {
    // https://github.com/gulpjs/gulp/blob/master/docs/recipes/combining-streams-to-handle-errors.md
    var combined = combiner.obj([
      gulp.src("./src/main/less/hawtio.less"),
      sourcemaps.init(),
      plugins.less({}),
      plugins.autoprefixer({
        browsers: [ "> 1%", "last 2 versions" ]
      }),
      sourcemaps.write("."),
      gulp.dest("./src/main/webapp/css")
    ]);
    combined.on('error', gutil.log);
    return combined;
  }

  function lessMinTask() {
    return gulp.src("./src/main/webapp/css/hawtio.css")
        .pipe(sourcemaps.init())
        .pipe(plugins.minifyCss({ keepBreaks: false }))
        .pipe(plugins.rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./src/main/webapp/css"));
  }

  return {
    less: lessTask,
    lessMin: lessMinTask
  };

};
