// Copyright 2014 Traceur Authors.
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

import {
  AttachModuleNameTransformer
} from './codegeneration/module/AttachModuleNameTransformer.js';
import {FromOptionsTransformer} from './codegeneration/FromOptionsTransformer.js';
import {Parser} from './syntax/Parser.js';
import {PureES6Transformer} from './codegeneration/PureES6Transformer.js';
import {SourceFile} from './syntax/SourceFile.js';
import {CollectingErrorReporter} from './util/CollectingErrorReporter.js';
import {
  Options,
  options as traceurOptions,
  versionLockedOptions
} from './Options.js';

import {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter.js';
import {ParseTreeWriter} from './outputgeneration/ParseTreeWriter.js';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration.js';

function merge(...srcs) {
  var dest = Object.create(null);
  srcs.forEach((src) => {
    Object.keys(src).forEach((key) => {
      dest[key] = src[key];
    });
    var srcModules = src.modules;  // modules is a getter on prototype
    if (typeof srcModules !== 'undefined') {
      dest.modules = srcModules;
    }

  });
  return dest;
}

function basePath(name) {
  if (!name)
    return null;
  var lastSlash = name.lastIndexOf('/');
  if (lastSlash < 0)
    return null;
  return name.substring(0, lastSlash + 1);
}

/**
 * Synchronous source to source compiler using default values for options.
 * @param {Options=} overridingOptions
 */
export class Compiler {
  constructor(overridingOptions = {}) {
    this.options_ = new Options(this.defaultOptions());
    this.options_.setFromObject(overridingOptions);
    // Only used if this.options_.sourceMaps is set.
    this.sourceMapConfiguration_ = null;
    // Only used if this.options_sourceMaps = 'memory'.
    this.sourceMapInfo_ = null;
  }
  /**
   * Use Traceur to compile ES6 type=script source code to ES5 script.
   *
   * @param  {string} content ES6 source code.
   * @param  {Object=} options Traceur options to override defaults.
   * @return {Promise<{js: string, errors: Array, sourceMap: string}>} Transpiled code.
   */
  static script(content, options = {}) {
    options = new Options(options);  // fresh copy, don't write on argument.
    options.script = true;
    return new Compiler(options).compile(content);
  }
  /**
   * Use Traceur to compile ES6 module source code to 'register' module format.
   *
   * @param  {string} content ES6 source code.
   * @param  {Object=} options Traceur options to override defaults.
   * @return {Promise<{js: string, errors: Array, sourceMap: string}>} Transpiled code.
   */
  static module(content, options = {}) {
    options = new Options(options);  // fresh copy, don't write on argument.
    options.modules = 'register';
    return new Compiler(options).compile(content);
  }
  /**
   * Options to create 'amd' module format.
   *
   * @param  {Object=} options Traceur options to override defaults.
   * @return {Object}
   */
  static amdOptions(options = {}) {
    var amdOptions = {
      modules: 'amd',
      sourceMaps: false,
      moduleName: false
    };
    return merge(amdOptions, options);
  }
  /**
   * Options to create 'goog'/Closure module format.
   *
   * @param  {Object=} options Traceur options to override defaults.
   * @return {Object}
   */
  static closureOptions(options = {}) {
    var closureOptions = {
      modules: 'closure',
      sourceMaps: false,
      moduleName: true
    };
    return merge(closureOptions, options);
  }
  /**
   * Options to create 'commonjs' module format.
   *
   * @param  {Object=} options Traceur options to override defaults.
   * @return {Object}
   */
  static commonJSOptions(options = {}) {
    var commonjsOptions = {
      modules: 'commonjs',
      sourceMaps: false,
      moduleName: false
    };
    return merge(commonjsOptions, options);
  }

  /**
   * Compile ES6 source code with Traceur.
   *
   * @param {string} content ES6 source code.
   * @param {string} sourceName
   * @param {string} outputName
   * @param {string} sourceRoot defaults to dir of outputName
   * @return {string} equivalent ES5 source.
   */
  compile(content, sourceName = '<compileSource>',
      outputName = '<compileOutput>', sourceRoot = undefined) {

    sourceName = this.normalize(sourceName);
    outputName = this.normalize(outputName);
    var tree = this.parse(content, sourceName);

    var moduleName = this.options_.moduleName;
    if (moduleName) {  // true or non-empty string.
      if (typeof moduleName !== 'string')  // true means resolve filename
        moduleName = sourceName;
    }
    tree = this.transform(tree, moduleName);
    // Attach the sourceURL only if the input and output names differ.
    var sourceURL = sourceName !== outputName ? sourceName : undefined;
    return this.write(tree, outputName, sourceRoot, sourceURL);
  }

  throwIfErrors(errorReporter) {
    if (errorReporter.hadError())
      throw errorReporter.errors;
  }

  /**
   * @param {string} content to be compiled.
   * @param {string} sourceName inserted into sourceMaps
   */
  parse(content, sourceName = '<compiler-parse-input>') {
    sourceName = this.normalize(sourceName);
    this.sourceMapConfiguration_ = null;
    // Here we mutate the global/module options object to be used in parsing.
    traceurOptions.setFromObject(this.options_);

    var errorReporter = new CollectingErrorReporter();
    var sourceFile = new SourceFile(sourceName, content);
    var parser = new Parser(sourceFile, errorReporter);
    var tree =
        this.options_.script ? parser.parseScript() : parser.parseModule();
    this.throwIfErrors(errorReporter);

    return tree;
  }

  /**
   * Apply transformations selected by options to tree.
   * @param {ParseTree} tree
   * @param {string} moduleName value for __moduleName if any
   * @param {string} sourceName used as the moduleName if defined and requested
   *     by the module system configuration.
   * @return {ParseTree}
   */
  transform(tree, moduleName = undefined, sourceName = undefined) {
    var transformer;

    if (!moduleName && this.options_.moduleName) {
      // this.options_.moduleName is true or non-empty string.
      if (typeof this.options_.moduleName === 'string') {
        moduleName = this.options_.moduleName;
      } else {
        // use filename as moduleName
        moduleName = sourceName;
      }
    }

    if (moduleName) {
      var transformer = new AttachModuleNameTransformer(moduleName);
      tree = transformer.transformAny(tree);
    }

    var errorReporter = new CollectingErrorReporter();

    if (this.options_.outputLanguage.toLowerCase() === 'es6') {
      transformer = new PureES6Transformer(errorReporter);
    } else {
      transformer = new FromOptionsTransformer(errorReporter);
    }

    var transformedTree = transformer.transform(tree);
    this.throwIfErrors(errorReporter);
    return transformedTree;
  }

  createSourceMapConfiguration_(outputName, sourceRoot = undefined) {
    if (this.options_.sourceMaps) {
      return {
        sourceMapGenerator: new SourceMapGenerator({
          file: outputName,
          sourceRoot: sourceRoot
        }),
        sourceRoot: sourceRoot
      };
    }
  }

  getSourceMap() {
    if (this.sourceMapConfiguration_)
      return this.sourceMapConfiguration_.sourceMapGenerator.toString();
  }

  get sourceMapInfo() {
    return this.sourceMapInfo_;
  }

  /**
   * Produce output source from tree.
   * @param {ParseTree} tree
   * @param {string} outputName used for sourceMap URL and default sourceRoot.
   * @param {string} sourceRoot base for sourceMap sources
   * @param {string} sourceURL value for sourceURL
   * @return {string}
   */
  write(tree, outputName = undefined, sourceRoot = undefined,
      sourceURL = undefined) {
    outputName = this.normalize(outputName);
    sourceRoot = this.normalize(sourceRoot) || basePath(outputName);

    var writer;
    this.sourceMapConfiguration_ =
        this.createSourceMapConfiguration_(outputName, sourceRoot);
    if (this.sourceMapConfiguration_) {
      writer =
          new ParseTreeMapWriter(this.sourceMapConfiguration_, this.options_);
    } else {
      writer = new ParseTreeWriter(this.options_);
    }

    writer.visitAny(tree);

    var compiledCode = writer.toString();

    if (this.sourceMapConfiguration_) {
      var sourceMappingURL =
          this.sourceMappingURL(outputName || sourceURL || 'unnamed.js');
      compiledCode += '\n//# sourceMappingURL=' + sourceMappingURL + '\n';
      // The source map info for in-memory maps
      this.sourceMapInfo_ = {
        url: sourceURL,
        outputName: outputName,
        map: this.getSourceMap()
      };
    }

    if (sourceURL)
      compiledCode += '//# sourceURL=' + sourceURL;

    return compiledCode;
  }

  sourceName(filename) {
    return filename;
  }

  sourceMappingURL(path) {
    // This implementation works for browsers. The NodeCompiler overrides
    // to use nodejs functions.
    if (this.options_.sourceMaps === 'inline') {
      if (Reflect.global.btoa) {
        return 'data:application/json;base64,' +
            btoa(unescape(encodeURIComponent(this.getSourceMap())));
      }
    }
    path = path || 'unamed.js';
    return path.replace(/\.[^.]+$/, '.map');
  }

  sourceNameFromTree(tree) {
    return tree.location.start.source.name;
  }

  defaultOptions() {
    return versionLockedOptions;
  }

  normalize(name) {
    return name && name.replace(/\\/g,'/');
  }
}
