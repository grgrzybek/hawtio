
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io, bootstrap3 edition");

  grunt.config.init({

    pkg: grunt.file.readJSON("package.json"),

    /* task configuration */

    // https://www.npmjs.org/package/grunt-bower
    bower: {
      install: {
        options: {
          targetDir: 'src/main/webapp/bower_components',
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
        src: [ "src/main/d.ts/*.d.ts", "src/main/webapp/app/*/**/*.ts", "src/main/webapp/app/baseHelpers.ts", "src/main/webapp/app/baseIncludes.ts" ],
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
    express: {
      server: {
        options: {
          port: 9001,
          bases: [ 'src/main/webapp', 'dist' ]
        }
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  /* task aliases */

  // "grunt server" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("server", "Starts a webserver which hosts hawt.io without backend Java server", [ "express:server", "express-keepalive" ]);

  // test related tasks

  grunt.registerTask("test", "Runs unit tests once", [ "karma:unit" ]);
  grunt.registerTask("test-watch", "Runs unit tests continuously", [ "karma:unit-watch" ]);
  grunt.registerTask("test-chrome", "Runs unit tests continuously with autowatching", [ "karma:chrome" ]);
  grunt.registerTask("e2e", [ "protractor:all" ]);

  // TS compiler with fast incremental watcher
  grunt.registerTask("tsc", [ "typescript:dev" ]);

  // distribution tasks

  grunt.registerTask("default", [
    "bower",
    "wiredep",
    "typescript:base",
    "rename",
    "karma:unit",
    "ngAnnotate:app"
  ]);

  grunt.registerTask("dist", [
    "default",
    "copy:html",
    "useminPrepare",
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'cacheBust'
  ]);

};
