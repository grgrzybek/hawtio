
// gulp and plugins
var gulp = require("gulp");
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
//gulp.task("default", [ "bower" ], function() {
//  require("run-sequence")("typescript-files", "test");
//});


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


// Less compilation
var lessTasks = require("./build/tasks/less")(gulp, plugins);
gulp.task("less", lessTasks.less);
gulp.task("less-min", [ "less" ], lessTasks.lessMin);
gulp.task("less-watch", [ "less-min" ], function() {
  gulp.watch([ "./src/main/less/**/*.less" ], [ "less-min" ]);
});


// TypeScript compilation
var tsTasks = require("./build/tasks/typescript")(gulp, plugins);
gulp.task("ts", tsTasks.ts);
gulp.task("ts-watch", [ "ts" ], function () {
  gulp.watch([ "src/main/d.ts/**/*.d.ts", "src/main/webapp/app/**/*.ts" ], [ "ts" ]);
});


// Server
var serverTasks = require("./build/tasks/server")(gulp, plugins);
gulp.task("server", serverTasks.server);


// Testing with Karma
var karmaTasks = require("./build/tasks/karma")(gulp, plugins);
gulp.task("test", karmaTasks.test);
gulp.task("tdd", karmaTasks.tdd);
gulp.task("tdd-chrome", karmaTasks.tddChrome);
