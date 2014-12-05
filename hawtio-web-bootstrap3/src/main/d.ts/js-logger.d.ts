declare module JsLogger {

  export enum LogLevelValue {
    DEBUG = 1, INFO = 2, WARN = 4, ERROR = 8, OFF = 99
  }

  /**
   * Logging level
   */
  export interface LogLevel {
    value:LogLevelValue;
    name:string;
  }

  export interface Logger {

    /**
     * Changes the current logging level for the logging instance.
     * @param level
     */
    setLevel(level:LogLevel);

    /**
     * Is the logger configured to output messages at the supplied level?
     * @param level
     */
    enabledFor(level:LogLevel);

    /**
     * Logs at DEBUG level. (Equivalent of window.console.log == window.console.debug)
     */
    debug(...message:any[]);

    /**
     * Logs at INFO level. (Equivalent of window.console.info)
     */
    info(...message:any[]);

    /**
     * Logs at WARN level. (Equivalent of window.console.warn)
     */
    warn(...message:any[]);

    /**
     * Logs at ERROR level. (Equivalent of window.console.error)
     */
    error(...message:any[]);

  }

  /**
   * Context object used internally in log methods
   */
  export interface LoggingContext {
    /** Name of the logger */
    name:string;
    /** Logging level associated with logging invocation */
    level:LogLevel;
    /** Logging level associated logger used */
    filterLevel:LogLevel;
  }

  /**
   * Used to get logger instances and configuring logging library
   */
  export interface LoggerStatic extends Logger {

    /**
     * Set the global logging handler. The supplied function should expect two arguments, the first being an arguments
     * object with the supplied log messages and the second being a context object which contains a hash of stateful
     * parameters which the logging function can consume.
     * @param handler
     */
    setHandler(handler:(arguments:string[], context:LoggingContext) => void);

    /**
     * Sets the global logging filter level which applies to *all* previously registered, and future Logger instances.
     * (note that named loggers (retrieved via `Logger.get`) can be configured independently if required).
     * @param level
     */
    setLevel(level:LogLevel);

    /**
     * Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
     * default context and log handler.
     * @param name
     */
    get(name:string):Logger;

    /**
     * Configure and example a Default implementation which writes to the `window.console` (if present).
     * @param defaultLevel
     */
    useDefaults(defaultLevel:LogLevel);

    DEBUG:LogLevel;
    INFO:LogLevel;
    WARN:LogLevel;
    ERROR:LogLevel;
    OFF:LogLevel;

  }

}

/**
 * js-logger utilitly to log information using global or named logger.
 * See: http://github.com/jonnyreeves/js-logger
 */
declare var Logger:JsLogger.LoggerStatic;
