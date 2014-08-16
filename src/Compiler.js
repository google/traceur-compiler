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
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration';
import {CollectingErrorReporter} from './util/CollectingErrorReporter';
import {
  Options,
  options as traceurOptions,
  versionLockedOptions
} from './Options';
import {write} from './outputgeneration/TreeWriter';

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
 */
export class Compiler {
  constructor(overridingOptions = {}) {
    this.options_ = merge(this.defaultOptions(), overridingOptions);
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
    return new Compiler(options).stringToString(content);
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
    return new Compiler(options).stringToString(content);
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
      filename: undefined,
      sourceMaps: false,
      moduleName: true
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
      filename: '<unknown file>',
      sourceMaps: false,
      moduleName: false
    };
    return merge(commonjsOptions, options);
  }

  /**
   * Compile ES6 source code with Traceur.
   *
   * @param  {string} content ES6 source code.
   * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
   */
  stringToString(content) {
    var output = this.parse(content);
    if (output.errors.length)
      return output;
    output = this.transform(output.tree);
    if (output.errors.length)
      return output;
    return this.treeToString(output);
  }

  parse(content) {
    // Here we mutate the global/module options object to be used in parsing.
    traceurOptions.setFromObject(this.options_);

    var errorReporter = new CollectingErrorReporter();
    var sourceFile = new SourceFile(this.options_.filename, content);
    var parser = new Parser(sourceFile, errorReporter);
    var tree = this.options_.script ? parser.parseScript() : parser.parseModule();
    return {
      tree,
      errors: errorReporter.errors
    };
  }

  transform(tree) {
    var transformer;
    if (this.options_.moduleName) {  // true or non-empty string.
      var moduleName = this.options_.moduleName;
      if (typeof moduleName !== 'string') // true means resolve filename
        moduleName = this.resolveModuleName(this.options_.filename);
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

    if (errorReporter.hadError()) {
      return {
        js: null,
        errors: errorReporter.errors
      };
    } else {
      return {
        tree: transformedTree,
        errors: errorReporter.errors
      };
    }
  }

  treeToString({tree, errors}) {
    var treeWriterOptions = {};
    if (this.options_.sourceMaps) {
      treeWriterOptions.sourceMapGenerator = new SourceMapGenerator({
        file: this.options_.filename,
        sourceRoot: this.sourceRootForFilename(this.options_.filename)
      });
    }

    return {
      js: write(tree, treeWriterOptions),
      errors: errors,
      generatedSourceMap: treeWriterOptions.generatedSourceMap || null
    };
  }

  resolveModuleName(filename) {
    return filename;
  }

  sourceRootForFilename(filename) {
    return;
  }

  defaultOptions() {
    return versionLockedOptions;
  }

}
