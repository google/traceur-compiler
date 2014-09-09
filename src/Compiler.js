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
} from './codegeneration/module/AttachModuleNameTransformer';
import {FromOptionsTransformer} from './codegeneration/FromOptionsTransformer';
import {Parser} from './syntax/Parser';
import {PureES6Transformer} from './codegeneration/PureES6Transformer';
import {SourceFile} from './syntax/SourceFile';
import {CollectingErrorReporter} from './util/CollectingErrorReporter';
import {
  Options,
  options as traceurOptions,
  versionLockedOptions
} from './Options';

import {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter';
import {ParseTreeWriter} from './outputgeneration/ParseTreeWriter';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration';

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

/**
 * Synchronous source to source compiler using default values for options.
 * @param {Options=} overridingOptions
 * @param {string} sourceRoot base path for sourcemaps, eg cwd or baseURL.
 */
export class Compiler {
  constructor(overridingOptions = {}, sourceRoot = undefined) {
    this.options_ = merge(this.defaultOptions(), overridingOptions);
    this.sourceMapGenerator_ = null;
    this.sourceRoot = sourceRoot;
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
   * @return {string} equivalent ES5 source.
   */
  compile(content, sourceName = '<compileSource>',
      outputName = '<compileOutput>') {
    return this.write(this.transform(
        this.parse(content, sourceName)), outputName);
  }

  throwIfErrors(errorReporter) {
    if (errorReporter.hadError())
      throw errorReporter.errors;
  }

  parse(content, sourceName) {
    if (!content) {
      throw new Error('Compiler: no content to compile.');
    } else if (!sourceName) {
      throw new Error('Compiler: no source name for content.');
    }

    this.sourceMapGenerator_ = null;
    // Here we mutate the global/module options object to be used in parsing.
    traceurOptions.setFromObject(this.options_);

    var errorReporter = new CollectingErrorReporter();
    sourceName = this.sourceName(sourceName);
    var sourceFile = new SourceFile(sourceName, content);
    var parser = new Parser(sourceFile, errorReporter);
    var tree =
        this.options_.script ? parser.parseScript() : parser.parseModule();
    this.throwIfErrors(errorReporter);
    return tree;
  }

  transform(tree) {
    var transformer;
    if (this.options_.moduleName) {  // true or non-empty string.
      var moduleName = this.options_.moduleName;
      if (typeof moduleName !== 'string') // true means resolve filename
        moduleName = this.resolveModuleName(this.sourceNameFromTree(tree));
      if (moduleName) {
        transformer = new AttachModuleNameTransformer(moduleName);
        tree = transformer.transformAny(tree);
      }
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

  createSourceMapGenerator_(outputName) {
    if (this.options_.sourceMaps) {
      return new SourceMapGenerator({
        file: outputName,
        sourceRoot: this.sourceRoot
      });
    }
  }

  getSourceMap() {
    if (this.sourceMapGenerator_)
      return this.sourceMapGenerator_.toString();
  }

  write(tree, outputName) {
    var writer;
    this.sourceMapGenerator_ = this.createSourceMapGenerator_(outputName);
    if (this.sourceMapGenerator_) {
      writer = new ParseTreeMapWriter(this.sourceMapGenerator_, this.options_);
    } else {
      writer = new ParseTreeWriter(this.options_);
    }

    writer.visitAny(tree);
    return writer.toString(tree);
  }

  resolveModuleName(filename) {
    return filename;
  }

  sourceName(filename) {
    return filename;
  }

  sourceNameFromTree(tree) {
    return tree.location.start.source.name;
  }

  defaultOptions() {
    return versionLockedOptions;
  }

}
