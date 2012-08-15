// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('runtime', function() {
  'use strict';

  // TODO(arv): I stripped the resolvers to make this simpler for now.

  var Parser = traceur.syntax.Parser;
  var SourceFile = traceur.syntax.SourceFile
  var ModuleAnalyzer = traceur.semantics.ModuleAnalyzer;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var Project = traceur.semantics.symbols.Project;

  var ModuleTransformer = traceur.codegeneration.ModuleTransformer;
  var ProgramTransformer = traceur.codegeneration.ProgramTransformer;
  var TreeWriter = traceur.outputgeneration.TreeWriter;
  var ModuleRequireVisitor = traceur.codegeneration.module.ModuleRequireVisitor;

  var canonicalizeUrl = traceur.util.canonicalizeUrl;
  var resolveUrl = traceur.util.resolveUrl;
  var ObjectMap = traceur.util.ObjectMap;
  var ArrayMap = traceur.util.ArrayMap;

  var assert = traceur.assert;

  // TODO(arv): Implement
  var base = Object.freeze(Object.create(null, {
    Array: {value: Array},
    Boolean: {value: Boolean},
    Date: {value: Date},
    Error: {value: Error},
    EvalError: {value: EvalError},
    Function: {value: Function},
    JSON: {value: JSON},
    Math: {value: Math},
    Number: {value: Number},
    Object: {value: Object},
    RangeError: {value: RangeError},
    ReferenceError: {value: ReferenceError},
    RegExp: {value: RegExp},
    String: {value: String},
    SyntaxError: {value: SyntaxError},
    TypeError: {value: TypeError},
    URIError: {value: URIError},

    undefined: {value: void 0}
  }));


  var NOT_STARTED = 0;
  var LOADING = 1;
  var LOADED = 2;
  var PARSED = 3;
  var TRANSFORMED = 4;
  var COMPLETE = 5;
  var ERROR = 6;

  /**
   * Base class representing a piece of code that is to be loaded or evaluated.
   * @param {InternalLoader} loader The loader that is managing this dependency.
   * @param {string} url The URL of this dependency. If this is evaluated code
   *     the URL is the URL of the loader.
   * @param {number} state
   * @constructor
   */
  function CodeUnit(loader, url, state) {
    this.loader = loader;
    this.url = url;
    this.state = state;
    this.uid = traceur.getUid();
  }

  CodeUnit.prototype = {
    state_: NOT_STARTED,
    get state() {
      return this.state_;
    },
    set state(state) {
      if (state < this.state_) {
        throw new Error('Invalid state change');
      }
      this.state_ = state;
    },

    get reporter() {
      return this.loader.reporter;
    },

    get project() {
      return this.loader.project;
    },

    get tree() {
      return this.project.getParseTree(this.file);
    },

    get moduleSymbol() {
      // TODO(arv): This is not correct. What module is eval code
      // evaluated in?
      return this.project.getRootModule();
    },

    /**
     * Adds callback for COMPLETE and ERROR.
     */
    addListener: function(callback, errback) {
      if (!this.listeners) {
        this.listeners = [];
      }
      this.listeners.push(callback, errback);
    },

    dispatchError: function(value) {
      this.dispatch_(value, 1);
    },

    dispatchComplete: function(value) {
      this.dispatch_(value, 0);
    },

    dispatch_: function(value, error) {
      var listeners = this.listeners;
      if (!listeners) {
        return;
      }
      // Clone to prevent mutations during dispatch
      listeners = listeners.concat();
      this.listeners = [];

      for (var i = error; i < listeners.length; i += 2) {
        var f = listeners[i];
        if (f) {
          f(value);
        }
      }
    },

    /**
     * Parses the codeUnit
     * @return {boolean} Whether the parse succeeded.
     */
    parse: function() {
      var reporter = this.reporter;
      var project = this.project;
      var url = this.url;
      var program = this.text;
      var file = new SourceFile(url, program);
      project.addFile(file);
      this.file = file;

      var parser = new Parser(reporter, file);
      var tree = parser.parseProgram(this.allowLoad);

      if (reporter.hadError()) {
        this.error = 'Parse error';
        return false;
      }

      project.setParseTree(file, tree);

      this.state = PARSED;

      return true;
    },

    transform: function() {
      return ProgramTransformer.transformFile(this.reporter, this.project,
                                              this.file);
    }
  }

  /**
   * CodeUnit used for {@code Loader.load}.
   * @param {InternalLoader} loader
   * @param {string} url
   * @constructor
   * @extends {CodeUnit}
   */
  function LoadCodeUnit(loader, url) {
    CodeUnit.call(this, loader, url, NOT_STARTED);
  }

  LoadCodeUnit.prototype = traceur.createObject(CodeUnit.prototype, {
    allowLoad: true,

    get moduleSymbol() {
      return this.project.getModuleForUrl(this.url)
    },

    /**
     * Override to add parse tree as an external module symbol.
     * @return {boolean}
     * @override
     */
    parse: function() {
      if (!CodeUnit.prototype.parse.call(this)) {
        return false;
      }

      var project = this.loader.project;
      var tree = this.tree;
      var url = this.url;
      // External modules have no parent module.
      var moduleSymbol = new ModuleSymbol(null, null, tree, url);
      project.addExternalModule(moduleSymbol);

      return true;
    },

    transform: function() {
      return ProgramTransformer.transformFileAsModule(this.reporter,
          this.project, this.moduleSymbol, this.file);
    }
  });

  /**
   * CodeUnit used for {@code Loader.eval}.
   * @param {InternalLoader} loader
   * @param {string} code
   * @constructor
   * @extends {CodeUnit}
   */
  function EvalCodeUnit(loader, code) {
    CodeUnit.call(this, loader, loader.url, LOADED);
    this.text = code;
  }

  EvalCodeUnit.prototype = traceur.createObject(CodeUnit.prototype, {
    allowLoad: false
  });

  /**
   * CodeUnit used for {@code Loader.evalLoad}.
   * @param {InternalLoader} loader
   * @param {string} code
   * @constructor
   * @extends {CodeUnit}
   */
  function EvalLoadCodeUnit(loader, code) {
    CodeUnit.call(this, loader, loader.url, LOADED);
    this.text = code;
  }

  EvalLoadCodeUnit.prototype = traceur.createObject(CodeUnit.prototype, {
    allowLoad: true
  })


  /**
   * The internal implementation of the code loader.
   * @param {ErrorReporter} reporter
   * @param {Project} project.
   * @constructor
   */
  function InternalLoader(reporter, project) {
    this.reporter = reporter;
    this.project = project;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
  }

  InternalLoader.prototype = {
    get url() {
      return this.project.url;
    },

    loadTextFile: function(url, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        if (xhr.status == 200 || xhr.status == 0) {
          callback(xhr.responseText);
        } else {
          errback();
        }
        xhr = null;
      };
      xhr.onerror = function() {
        errback();
      }
      xhr.open('GET', url, true);
      xhr.send();
      return xhr;
    },

    load: function(url) {
      url = resolveUrl(this.url, url);
      var codeUnit = this.getCodeUnit(url);
      if (codeUnit.state != NOT_STARTED || codeUnit.state == ERROR) {
        return codeUnit;
      }

      codeUnit.state = LOADING;
      var loader = this;
      var xhr = codeUnit.xhr = this.loadTextFile(url, function(text) {
        codeUnit.text = text;
        codeUnit.state = LOADED;
        loader.handleCodeUnitLoaded(codeUnit);
      }, function() {
        codeUnit.state = ERROR;
        loader.handleCodeUnitLoadError(codeUnit);
      });
      return codeUnit;
    },

    evalLoad: function(code) {
      var codeUnit = new EvalLoadCodeUnit(this, code);
      this.cache.put({}, codeUnit);
      return codeUnit;
    },

    eval: function(code) {
      var codeUnit = new EvalCodeUnit(this, code);
      this.cache.put({}, codeUnit);
      this.handleCodeUnitLoaded(codeUnit);
      return codeUnit;
    },

    getKey: function(url) {
      if (url in this.urlToKey) {
        return this.urlToKey[url];
      }

      return this.urlToKey[url] = {};
    },

    getCodeUnit: function(url) {
      var key = this.getKey(url);
      var cacheObject = this.cache.get(key);
      if (!cacheObject) {
        cacheObject = new LoadCodeUnit(this, url);
        this.cache.put(key, cacheObject);
      }
      return cacheObject;
    },

    areAll: function(state) {
      return this.cache.values().every(function(codeUnit) {
        return codeUnit.state >= state;
      });
    },

    /**
     * This is called when a codeUnit is loaded.
     * @param {CodeUnit} codeUnit
     */
    handleCodeUnitLoaded: function(codeUnit) {
      // Parse
      if (!codeUnit.parse()) {
        this.abortAll();
        return;
      }

      // Analyze to find dependencies
      var requireVisitor = new ModuleRequireVisitor(this.reporter);
      requireVisitor.visit(codeUnit.tree);
      var baseUrl = codeUnit.url;
      codeUnit.dependencies = requireVisitor.requireUrls.map(function(url) {
        url = resolveUrl(baseUrl, url);
        return this.load(url);
      }, this);

      if (this.areAll(PARSED)) {
        this.analyze();
        this.transform();
        this.evaluate();
      }
    },

    /**
     * This is called when a code unit failed to load.
     * @param {CodeUnit} codeUnit
     */
    handleCodeUnitLoadError: function(codeUnit) {
      this.error = codeUnit.error = 'Failed to load \'' + codeUnit.url + '\'';
      this.abortAll();
    },

    /**
     * Aborts all loading code units.
     */
    abortAll: function() {
      this.cache.values().forEach(function(codeUnit) {
        if (codeUnit.xhr) {
          codeUnit.xhr.abort();
          codeUnit.state = ERROR;
        }
      });

      this.cache.values().forEach(function(codeUnit) {
        codeUnit.dispatchError(codeUnit.error);
      }, this);
    },

    analyze: function() {
      var project = this.project;
      var dependencies = this.cache.values();
      var trees = [];
      var modules = [];
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];

        // We should not have gotten here if not all are PARSED or larget.
        assert(codeUnit.state >= PARSED);

        if (codeUnit.state == PARSED) {
          trees.push(codeUnit.tree);
          modules.push(codeUnit.moduleSymbol);
        }
      }

      var analyzer = new ModuleAnalyzer(this.reporter, this.project);
      analyzer.analyzeModuleTrees(trees, modules);

      if (this.reporter.hadError()) {
        for (var i = 0; i < dependencies.length; i++) {
          var codeUnit = dependencies[i];
          if (codeUnit.state >= COMPLETE) {
            continue;
          }
          codeUnit.state = ERROR;
        }

        for (var i = 0; i < dependencies.length; i++) {
          var codeUnit = dependencies[i];
          if (codeUnit.state == ERROR) {
            codeUnit.dispatchError('Failed to analyze');
          }
        }
      }
    },

    transform: function() {
      var dependencies = this.cache.values();
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= TRANSFORMED) {
          continue;
        }

        codeUnit.transformedTree = this.transformCodeUnit(codeUnit);
        codeUnit.state = TRANSFORMED;
      }
    },

    transformCodeUnit: function(codeUnit) {
      var results = codeUnit.transform();
      return results.get(codeUnit.file);
    },

    evaluate: function() {
      // Order the dependencies.
      var visited = new ObjectMap();
      var ordered = [];
      function orderCodeUnits(codeUnit) {
        // Cyclic dependency.
        if (visited.has(codeUnit)) {
          return;
        }

        visited.put(codeUnit, true);
        codeUnit.dependencies.forEach(orderCodeUnits);
        ordered.push(codeUnit);
      }
      this.cache.values().forEach(orderCodeUnits);
      var dependencies = ordered;

      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }

        assert(currentCodeUnit === undefined);
        currentCodeUnit = codeUnit;
        var result;

        try {
          result = this.evalCodeUnit(codeUnit);
        } catch (ex) {
          codeUnit.error = ex.message
          this.abortAll();
          return;
        } finally {
          // Ensure that we always clean up currentCodeUnit.
          assert(currentCodeUnit === codeUnit);
          currentCodeUnit = undefined;
        }

        codeUnit.result = result
        codeUnit.transformedTree = null;
        codeUnit.text = null;
      }

      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        codeUnit.state = COMPLETE;
        codeUnit.dispatchComplete(codeUnit.result);
      }
    },

    evalCodeUnit: function(codeUnit) {
      // TODO(arv): Eval in the right context.
      return traceur.strictGlobalEval(
          TreeWriter.write(codeUnit.transformedTree));
    }
  };

  /**
   * This is the current code unit object being evaluated.
   */
  var currentCodeUnit;

  var standardModuleUrlRegExp = /^@\w+$/;

  /**
   * This is used to find the module for a require url ModuleExpression.
   * @param {string} url
   * @return {Object} A module instance object for the given url in the current
   *     code loader.
   */
  function getModuleInstanceByUrl(url) {
    if (standardModuleUrlRegExp.test(url))
      return traceur.runtime.modules[url] || null;

    assert(currentCodeUnit);
    url = resolveUrl(currentCodeUnit.url, url);
    for (var i = 0; i < currentCodeUnit.dependencies.length; i++) {
      if (currentCodeUnit.dependencies[i].url == url) {
        return currentCodeUnit.dependencies[i].result;
      }
    }

    return null;
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {CodeLoader} parentLoader The parent loader or null if this is
   *     the initial loader.
   * @constructor
   */
  function CodeLoader(reporter, project, parentLoader, opt_resolver) {
    // TODO(arv): Implement parent loader
    // TODO(arv): Implement resolver
    this.internalLoader_ = new InternalLoader(reporter, project)
  }

  CodeLoader.prototype = {

    /**
     * The load method takes a string representing a module URL and a callback
     * that receives the result of loading, compiling, and executing the module
     * at that URL. The compiled code is statically associated with this loader,
     * and its URL is the given URL. The additional callback is used if an error
     * occurs.
     */
    load: function(url, callback, opt_errback) {
      var codeUnit = this.internalLoader_.load(url);
      codeUnit.addListener(callback, opt_errback);
    },

    /**
     * The eval method takes a string representing a Program(false) (that is, a
     * program that cannot load external modules) and returns the result of
     * compiling and executing the program. The compiled code is statically
     * associated with this loader, and its URL is the base URL of this loader.
     *
     * @param {string} program The source code to eval.
     * @return {*} The completion value of evaluating the code.
     */
    eval: function(program) {
      var codeUnit = this.internalLoader_.eval(program);
      return codeUnit.result;
    },

    /**
     * The evalLoad method takes a string representing a Program(true) (this is,
     * a program that can load external modules) and a callback that receives
     * the result of compiling and executing the program. The compiled code is
     * statically associated with this loader, and its URL is the base URL of
     * this loader. The additional callback is used if an error occurs.
     */
    evalLoad: function(program, callback, opt_errback) {
      var codeUnit = this.internalLoader_.evalLoad(program);
      codeUnit.addListener(callback, opt_errback);
      this.internalLoader_.handleCodeUnitLoaded(codeUnit);
    },

    /**
     * The import method takes a module instance object and dynamically imports
     * its non-module exports into the global namespace encapsulated by this
     * loader. (In other words, it dynamically performs the equivalent of
     * import m.*.)
     */
    'import': function(moduleInstanceObject) {
      throw Error('Not implemented');
    },

    /**
     * The defineGlobal method defines a global binding in the global namespace
     * encapsulated by this loader.
     */
    defineGlobal: function(name, value) {
      throw Error('Not implemented');
    },

    /**
     * The defineModule method takes a string name and a module instance object
     * and defines a global module binding in the global namespace encapsulated
     * by this loader. If the optional third argument is provided, it is used as
     * a key and the module instance is stored in the module instance cache with
     * that key.
     * @return {void}
     */
    defineModule: function(name, moduleInstanceObject, opt_cacheKey) {
      throw Error('Not implemented');
    },

    /**
     * The create method creates a child loader, i.e. a new loader whose parent
     * is this loader.
     *
     * The first argument is a module instance object representing the base
     * library (containing the Object, Array, String, etc. standard libraries).
     * This module must contain bindings for all the global functions and
     * constructors of the standard library.
     * The second, optional argument is a resolver, which may contain
     * compilation hooks (see below).
     *
     * @return {CodeLoader}
     */
    create: function(moduleInstanceObject, opt_resolver) {
      var url = this.project_.url;
      var project = new Project(url);
      var loader = new CodeLoader(this.reporter, project, this, opt_resolver);
      // TODO(arv): Implement globals
      // TODO(arv): Implement resolver
      return loader;
    },

    /**
     * The createBase method creates a fresh base library.
     *
     * Note that this does not include a Loader binding. When creating a child
     * loader, no loader is exposed to its global namespace by default. A loader
     * can easily be shared via defineGlobal.
     */
    createBase: function() {
      return base;
    }
  };

  return {
    CodeLoader: CodeLoader,
    getModuleInstanceByUrl: getModuleInstanceByUrl,
    internals: {
      CodeUnit: CodeUnit,
      EvalCodeUnit: EvalCodeUnit,
      EvalLoadCodeUnit: EvalLoadCodeUnit,
      InternalLoader: InternalLoader,
      LoadCodeUnit: LoadCodeUnit,
    }
  };
});
