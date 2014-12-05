describe("Tests for logging configuration", function () {

  beforeEach(function() {
    spyOn(originalWindowConsole, "log");
    spyOn(originalWindowConsole, "info");
    spyOn(originalWindowConsole, "warn");
    spyOn(originalWindowConsole, "error");
  });

  it("Uses Lo-Dash to check object types", function() {
    expect(_.isString("")).toBe(true);
    expect(_.isString(1)).toBe(false);
    expect(_.isArray([])).toBe(true);
    expect(_.isArray(1)).toBe(false);
    expect(_.isObject({})).toBe(true);
    expect(_.isObject("")).toBe(false);
  });

  it("There should be global logger configured", function () {
    Logger.info("hello 1!");
    expect(originalWindowConsole.info).toHaveBeenCalledWith("hello 1!");
    Logger.setLevel(Logger.DEBUG);
    Logger.debug("hello 2!");
    expect(originalWindowConsole.log).toHaveBeenCalledWith("hello 2!");
  });

  it("Logger should delegate to window.console", function () {
    Logger.get("C2").setLevel(Logger.DEBUG);
    Logger.get("C2").debug("debug message");
    expect(originalWindowConsole.log).toHaveBeenCalledWith("[C2] debug message");

    Logger.get("X").info("info message");
    expect(originalWindowConsole.info).toHaveBeenCalledWith("[X] info message");

    Logger.get("Y").warn("warn message", "2nd message", window);
    expect(originalWindowConsole.warn).toHaveBeenCalledWith("[Y] warn message", "2nd message", window);

    Logger.get("Z").error("error message", "2nd message", {});
    expect(originalWindowConsole.error).toHaveBeenCalledWith("[Z] error message", "2nd message", {});
  });

  it("Should respect logging level", function() {
    Logger.get("C2").setLevel(Logger.WARN);
    Logger.get("C2").info("debug message");
    expect(originalWindowConsole.info).not.toHaveBeenCalled();
  });

  it("Should append category to first message", function() {
    Logger.get("my.logger").info("hello", "hello");
    expect(originalWindowConsole.info).toHaveBeenCalledWith("[my.logger] hello", "hello");
  });

  it("Should log simple string messages to the logging panel", function () {
    var panel = $("<div id='log-panel'><div><ul id='log-panel-statements'></ul></div></div>");
    panel.appendTo("body");
    var lps = $("#log-panel-statements");
    expect($("li", lps).length).toBe(0);
    Logger.info("hello");
    Logger.info("world");
    expect($("li", lps).length).toBe(2);
    expect($("li:eq(0)", lps).html()).toBe("hello");
    expect($("li:eq(1)", lps).html()).toBe("world");
    panel.remove();
  });

  it("Should log with category if present", function () {
    var panel = $("<div id='log-panel'><div><ul id='log-panel-statements'></ul></div></div>");
    panel.appendTo("body");
    var lps = $("#log-panel-statements");
    expect($("li", lps).length).toBe(0);
    Logger.info("msg1");
    Logger.get("category").info("msg2");
    expect($("li", lps).length).toBe(2);
    expect($("li:eq(0)", lps).contents().filter(function() { return this.nodeType == 3; })[0].nodeValue).toBe("msg1");
    expect($("li:eq(1) > span", lps).html()).toBe("category");
    expect($("li:eq(1)", lps).contents().filter(function() { return this.nodeType == 3; })[0].nodeValue).toBe("[");
    expect($("li:eq(1)", lps).contents().filter(function() { return this.nodeType == 3; })[1].nodeValue).toBe("] msg2");
    panel.remove();
  });

  it("Should log object and arrays preformatted", function () {
    var panel = $("<div id='log-panel'><div><ul id='log-panel-statements'></ul></div></div>");
    panel.appendTo("body");
    var lps = $("#log-panel-statements");
    expect($("li", lps).length).toBe(0);
    Logger.info("msg1", { a: "a" });
    Logger.get("category").info("msg2", [ 1, 42 ]);
    expect($("li", lps).length).toBe(2);
    expect($("li:eq(0) > pre", lps).html()).toBe("{\n  \"a\": \"a\"\n}");
    expect($("li:eq(1) > pre", lps).html()).toBe("[\n  1,\n  42\n]");
    panel.remove();
  });

  it("Should log errors with stacktrace", function () {
    var panel = $("<div id='log-panel'><div><ul id='log-panel-statements'></ul></div></div>");
    panel.appendTo("body");
    var lps = $("#log-panel-statements");
    expect($("li", lps).length).toBe(0);
    var e = new Error("error message");
    e.stack = "1\n2";
    Logger.error(e);
    Logger.error("error!", e);
    // single error adds two <li>s
    expect($("li", lps).length).toBe(4);
    expect($("li:eq(0)", lps).html()).toBe("error message");
    expect($("li:eq(1) > div > p:eq(0)", lps).html()).toBe("1");
    expect($("li:eq(2)", lps).html()).toBe("error! error message");
    expect($("li:eq(3) > div > p:eq(1)", lps).html()).toBe("2");
    panel.remove();
  });

});
