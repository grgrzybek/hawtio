// Karma configuration
// Generated on Fri Nov 28 2014 12:40:10 GMT+0100 (CET)

module.exports = function(config) {

  var basedir = "src/main/webapp/";
  var libdir = basedir + "lib/";
  var testdir = "src/test/";

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "../../..",


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [ "jasmine-ajax", "jasmine" ],


    // list of files / patterns to load in the browser
    // generally the list matches a list of javascript files from index.html
    files: [
        testdir + "specs/lib/test-utils.js",
        basedir + "bower_components/lodash/dist/lodash.min.js",
        basedir + "bower_components/js-logger/src/logger.min.js",
        libdir + "hawtio-logger-init.js",
        basedir + "bower_components/jquery/dist/jquery.js",
        basedir + "lib/jolokia/debug/jolokia.js",
        basedir + "lib/jolokia/debug/jolokia-simple.js",
        libdir + "hawtio-plugin-loader.js",
        basedir + "bower_components/angular/angular.js",
        basedir + "bower_components/angular-route/angular-route.js",
        basedir + "bower_components/toastr/toastr.min.js",
        basedir + "app/app.js",
        // test specifications
        testdir + "specs/specs-js/**/*.js",
        // other resources (e.g., for $.ajax())
        { pattern: testdir + "webapp/static-resources/*.json", included: false, served: true, watched: true },
        { pattern: testdir + "webapp/static-resources/**/*.js", included: false, served: true, watched: true }
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ "progress" ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ "PhantomJS" ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
