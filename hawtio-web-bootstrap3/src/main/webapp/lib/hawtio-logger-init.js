(function(window, jsConsole, document) {

  // we'll default to 100 statements I guess...
  window["LogBuffer"] = 100;

  window["logInterceptors"] = [];

  // helper functions

  function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  }

  function isError(obj) {
    //return obj instanceof Error;
    return obj && getType(obj) === "Error";
  }

  function isObject (obj) {
    // to prevent treating Error instances as Objects
    return obj && getType(obj) === 'Object';
  }

  function formatStackTraceString(stack) {
    var lines = stack.split("\n");

    if (lines.length > 100) {
      // too many lines, let's snip the middle so the browser doesn't bail
      var start = 20;
      var amount = lines.length - start * 2;
      lines.splice(start, amount, ">>> snipped " + amount + " frames <<<");
    }

    var stackTrace = "<div class=\"log-stack-trace\">\n";

    for (var j = 0; j < lines.length; j++) {
      var line = lines[j];
      if (line.trim().length === 0) {
        continue;
      }
      //line = line.replace(/\s/g, "&nbsp;");
      stackTrace = stackTrace + "<p>" + line + "</p>\n";
    }
    stackTrace = stackTrace + "</div>\n";

    return stackTrace;
  }

  // Delegate handler using standard window.console if present
  var consoleLoggerHandler = null;

  Logger.setLevel(Logger.INFO);

  if (_.has(window, "localStorage")) {
    if ("logLevel" in window.localStorage) {
      var logLevel = JSON.parse(window.localStorage["logLevel"]);
      //jsConsole.log("Using log level: ", logLevel);
      Logger.setLevel(logLevel);
    }
    if ("showLog" in window.localStorage) {
      var showLog = window.localStorage["showLog"];
      //console.log("showLog: ", showLog);
      if (showLog === "true") {
        var container = document.getElementById("log-panel");
        if (container) {
          container.setAttribute("style", "bottom: 50%");
        }
      }
    }
    if ("logBuffer" in window.localStorage) {
      var logBuffer = window.localStorage["logBuffer"];
      window["LogBuffer"] = parseInt(logBuffer);
    } else {
      window.localStorage["logBuffer"] = window["LogBuffer"];
    }
  }

  if (jsConsole != void 0) {
    consoleLoggerHandler = function(messages, context) {
      var handler = jsConsole.log;

      // Prepend the logger's name to the log message for easy identification.
      if (context.name) {
        messages[0] = "[" + context.name + "] " + messages[0];
      }

      // Delegate through to custom warn/error loggers if present on the console.
      if (context.level === Logger.WARN && _.has(jsConsole, "warn")) {
        handler = jsConsole.warn;
      } else if (context.level === Logger.ERROR && _.has(jsConsole, "error")) {
        handler = jsConsole.error;
      } else if (context.level === Logger.INFO && _.has(jsConsole, "info")) {
        handler = jsConsole.info;
      }

      if (handler && handler.apply) {
        try {
          handler.apply(jsConsole, messages);
        } catch (e) {
          // ?
          jsConsole.log(messages);
        }
      }
    };
  }

  // js-logger handler
  Logger.setHandler(function(messages, context) {
    // log to slide down panel
    var container = document.getElementById("log-panel");
    var panel = document.getElementById("log-panel-statements");
    var node = document.createElement("li");
    var text = "";
    var postLog = [];

    // try and catch errors logged via console.error(e.toString) and reformat as Errors
    if (context.level === Logger.ERROR && messages.length == 1) {
      if (_.isString(messages[0])) {
        var messageSplit = messages[0].split(/\n/);
        if (messageSplit.length > 1) {
          // we may have more cases that require normalizing, so a more flexible solution
          // may be needed
          var error = new Error();
          var lookFor = "Error: Jolokia-Error: ";
          if (messageSplit[0].search(lookFor) == 0) {
            var msg = messageSplit[0].slice(lookFor.length);
            if (jsConsole) {
              jsConsole.info("msg: " + msg);
            }
            try {
              var errorObject = JSON.parse(msg);
              error.message = errorObject.error;
              error.stack = errorObject.stacktrace.replace("\\t", "&nbsp;&nbsp").replace("\\n", "\n");
              messages = [ error ];
            } catch (e) {
              // we'll just bail and let it get logged as a string...
            }
          } else {
            // general case
            error.message = messageSplit[0];
            error.stack = messages[0];
            messages = [ error ];
          }
        }
      }
    }

    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      if (_.isArray(message) || isObject(message)) {
        var obj = "";
        try {
          obj = "<pre data-language='javascript'>" + JSON.stringify(message, null, 2) + "</pre>";
        } catch (error) {
          obj = message + " (failed to convert)";
          // silently ignore, could be a circular object...
        }
        text += obj;
      } else if (isError(message)) {
        if (_.has(message, "message")) {
          if (i > 0) {
            text += " ";
          }
          text += message.message;
        }
        if (_.has(message, "stack")) {
          postLog.push(function () {
            var stackTrace = formatStackTraceString(message.stack);
            var logger = Logger;
            if (context.name) {
              logger = Logger.get(context.name);
            }
            logger.info("Stack trace: ", stackTrace);
          });
        }
      } else {
        text += message;
      }
    }

    if (context.name) {
      text = "[<span class='green'>" + context.name + "</span>] " + text;
    }

    node.innerHTML = text;
    node.className = context.level.name;

    // container: <div id="log-panel">
    // panel: <ul id="log-panel-statements">
    var scroll = false;
    if (container) {
      if (container.scrollHeight == 0) {
        scroll = true; // ?
      }
      if (panel.scrollTop > (panel.scrollHeight - container.scrollHeight - 200)) {
        scroll = true;
      }
    }

    function onAdd() {
      if (panel) {
        panel.appendChild(node);
        if (panel.childNodes.length > parseInt(window["LogBuffer"])) {
          panel.removeChild(panel.firstChild);
        }
        if (scroll) {
          panel.scrollTop = panel.scrollHeight;
        }
      }

      // delegate to window.console
      if (consoleLoggerHandler) {
        consoleLoggerHandler(messages, context);
      }

      var interceptors = window["logInterceptors"];

      for (var i = 0; i < interceptors.length; i++) {
        interceptors[i](context.level.name, text);
      }
    }

    onAdd();

    postLog.forEach(function(func) { func(); });

    //try {
    //  Rainbow.color(node, onAdd);
    //} catch (e) {
    //  // in case rainbow hits an error...
    //  onAdd();
    //}
  });

  // Catch uncaught exceptions and stuff so we can log them
  window.onerror = function (msg, url, line, column, errorObject) {
    if (errorObject && _.isObject(errorObject)) {
      Logger.get("Window").error(errorObject);
    } else {
      var href = " (<a href='" + url + ":" + line + "'>" + url + ":" + line;
      if (column) {
       href += ":" + column;
      }
      href += "</a>)";
      Logger.get("Window").error(msg, href);
    }
    return true;
  };

  Logger.get('hawtio').info("hawtio-logger-init.js loaded");

  // sneaky hack to redirect console.log !
  window.console = {
    log: Logger.log,
    warn: Logger.warn,
    info: Logger.info,
    error: Logger.error
  };

})(window, window.console, document);
