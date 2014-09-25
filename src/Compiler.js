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
    this.options_ = merge(this.defaultOptions(), overridingOptions);
    this.sourceMapGenerator_ = null;
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
   * @param {string} sourceRoot defaults to dir of outputName
   * @return {string} equivalent ES5 source.
   */
  compile(content, sourceName = '<compileSource>',
      outputName = '<compileOutput>', sourceRoot = undefined) {

    var tree = this.parse(content, sourceName);

    var moduleName = this.options_.moduleName;
    if (moduleName) {  // true or non-empty string.
      if (typeof moduleName !== 'string')  // true means resolve filename
        moduleName = sourceName.replace(/\.js$/, '').replace(/\\/g,'/');
    }
    tree = this.transform(tree, moduleName);

    return this.write(tree, outputName, sourceRoot);
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
    this.sourceMapGenerator_ = null;
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
   * @param {string} moduleName Value for __moduleName or true
   *     to use input filename.
   * @return {ParseTree}
   */
  transform(tree, moduleName = undefined) {
    var transformer;

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

  createSourceMapGenerator_(outputName, sourceRoot = undefined) {
    if (this.options_.sourceMaps) {
      var sourceRoot = sourceRoot || basePath(outputName);
      return new SourceMapGenerator({
        file: outputName,
        sourceRoot: sourceRoot
      });
    }
  }

  getSourceMap() {
    if (this.sourceMapGenerator_)
      return this.sourceMapGenerator_.toString();
  }

  /**
   * Produce output source from tree.
   * @param {ParseTree} tree
   * @param {string} outputName used for sourceMap URL and defaut sourceRoot.
   * @param {string} sourceRoot base for sourceMap sources
   * @return {string}
   */
  write(tree, outputName = undefined, sourceRoot = undefined) {
    var writer;
    this.sourceMapGenerator_ =
        this.createSourceMapGenerator_(outputName, sourceRoot);
    if (this.sourceMapGenerator_) {
      writer = new ParseTreeMapWriter(this.sourceMapGenerator_, sourceRoot,
          this.options_);
    } else {
      writer = new ParseTreeWriter(this.options_);
    }

    writer.visitAny(tree);
    return writer.toString(tree);
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
