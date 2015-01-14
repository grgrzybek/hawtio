
// karma (https://github.com/karma-runner/gulp-karma)

module.exports = function(gulp, plugins) {

  var karma = require("karma").server;

  function testTask(done) {
    karma.start({ configFile: __dirname + "/../../src/test/config/karma.conf.js" });
  }

  function tddTask(done) {
    karma.start({ configFile: __dirname + "/../../src/test/config/karma.conf.js", autoWatch: true, singleRun: false });
  }

  function tddChromeTask(done) {
    karma.start({ configFile: __dirname + "/../../src/test/config/karma.conf.js", autoWatch: true, singleRun: false, browsers: [ "Chrome" ] });
  }

  return {
    test: testTask,
    tdd: tddTask,
    tddChrome: tddChromeTask
  };

};
