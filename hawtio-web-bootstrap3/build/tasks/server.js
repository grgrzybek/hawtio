
// "gulp server" starts a webserver which hosts hawt.io without backend Java server
// this might be however very useful to connect to existing Jolokia agent
// https://github.com/schickling/gulp-webserver

module.exports = function(gulp, plugins) {

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

  function serverTask() {
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
  }

  return {
    server: serverTask
  };

};
