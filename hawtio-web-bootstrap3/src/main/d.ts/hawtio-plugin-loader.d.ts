declare module Hawtio {

  /**
   * Object containing callbacks invoked during the process of loading plugin URLs and scripts
   */
  export interface LoaderCallback {

    /**
     * Invoked after set of plugin metadata was loaded from given URL
     * @param totalUrls
     * @param urlsToLoadLength
     */
    urlLoaderCallback(totalUrls:number, urlsToLoadLength:number):void;

    /**
     * Invoked after single script of a plugin was fetched
     * @param totalUrls
     * @param urlsToLoadLength
     */
    scriptLoaderCallback(totalUrls:number, urlsToLoadLength:number):void;

  }

  /**
   * Static (non-instance) part of Hawtio Plugin Loader interface
   */
  export interface HawtioPluginLoaderStatic {

    /**
     * Sets loader callback (replaces existing) which is called after loading URLs and scripts
     * @param loaderCallback
     */
    setLoaderCallback(loaderCallback:LoaderCallback):void;

    /**
     * Registers a task to be executed during bootstrap (not angular.bootstrap, but after loading all scripts from plugin URLs)
     * @param task a function which is invoked during bootstrap. This function <b>must</b> invoke the passed function (which in turn invokes remaining tasks)
     */
    registerPreBootstrapTask(task:(nextTask:() => void) => void):void;

    /**
     * Registers Angular.js module on the list of modules to be created in Angular.js.
     * @param module
     */
    addModule(module:any):void;

    /**
     * Adds an URL from witch information about plugins is retrieved. There may be 2 kinds of URLs specified:<ul>
     *   <li>"jolokia:&lt;jolokia-servlet-url&gt;:&lt;mbean pattern&gt;: to get plugins directly from Jolokia (usually using "hawtio:type=plugin,name=*" mbean pattern)</li>
     *   <li>any other URL not starting with "jolokia" - to get plugins using <code>jQuery.get()</code></li>
     * </ul>
     * @param url
     */
    addUrl(url:string):void;

    /**
     * Returns a list of registered modules
     */
    getModules():Array<string>;

    /**
     * Parses given (or <code>window.location.href</code>) query string into map of string -> string[]
     * @param fragment
     */
    parseQueryString(fragment?:string):{};

    /**
     * Prints information about registered modules and URLs
     */
    debug():void;

    /**
     * Performs bootstrap procedure which:<ul>
     *   <li>fetches plugin metadata from registered URLs</li>
     *   <li>fetches and executes (using <code>jQuery.getScript()</code>) scripts declared for plugins</li>
     *   <li>executes registered tasks</li>
     *   <li>finally: invokes passed <code>callback</code> which may (should) be used to bootstrap Angular.js using registered modules</li>
     * </ul>
     * @param callback
     */
    loadPlugins(callback:() => void):void;

    /**
     * Flag which allows to configure whether application will bootstrap Angular.js
     */
    autoStart:boolean;
  }

}

/**
 * Hawtio Plugin Loader is used to register:
 *  - urls to load plugin metadata from (using Jolokia or plain GET)
 *  - tasks to be performed before bootstraping application
 *  - Angular.js modules
 * Then, at some point ("DOMContentLoaded") all modules are used to bootstrap Angular.js application
 */
declare var hawtioPluginLoader:Hawtio.HawtioPluginLoaderStatic;
