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

import {AttachModuleNameTransformer} from './codegeneration/module/AttachModuleNameTransformer';
import {FromOptionsTransformer} from './codegeneration/FromOptionsTransformer';
import {Parser} from './syntax/Parser';
import {PureES6Transformer} from './codegeneration/PureES6Transformer';
import {SourceFile} from './syntax/SourceFile';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration';
import {CollectingErrorReporter} from './util/CollectingErrorReporter';
import {options as traceurOptions} from './options';
import {write} from './outputgeneration/TreeWriter';

function merge(dest, ...srcs) {
  srcs.forEach((src) => {
    Object.keys(src).forEach((key) => {
      dest[key] = src[key];
    });
  });

  return dest;
}

/**
 * Synchronous source to source compiler using default values for options.
 */
export class Compiler {
  constructor(options = {}) {
    this.defaultOptions = merge({}, options);
  }

  /**
   * Compile ES6 source code with Traceur.
   *
   * @param  {string} content ES6 source code.
   * @param  {Object=} options Traceur options.
   * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
   */
  compile(content, options = {}) {
    var output = this.stringToTree({content: content, options: options});
    if (output.errors.length)
      return output;
    output = this.treeToTree(output);
    if (output.errors.length)
      return output;
    return this.treeToString(output);
  }

  stringToTree({content, options}) {
    //  The caller may send us traceurOptions; make a copy so we can reset it
    //  without altering the input object.
    var copyOptions = merge({}, options);
    options = merge(this.defaultOptions, copyOptions);
    traceurOptions.reset();
    options = merge(traceurOptions, options);

    var errorReporter = new CollectingErrorReporter();
    var sourceFile = new SourceFile(options.filename, content);
    var parser = new Parser(sourceFile, errorReporter);
    var tree = options.modules ? parser.parseModule() : parser.parseScript();
    return {
      tree: tree,
      options: options,
      errors: errorReporter.errors
    };
  }

  parse(input) {
    return this.promise(this.stringToTree, input);
  }

  treeToTree({tree, options}) {
    var transformer;

    if (options.moduleName) {  // true or non-empty string.
      var moduleName = options.moduleName;
      if (typeof moduleName !== 'string') // true means resolve filename
        moduleName = this.resolveModuleName(options.filename);
      if (moduleName) {
        transformer = new AttachModuleNameTransformer(moduleName);
        tree = transformer.transformAny(tree);
      }
    }

    var errorReporter = new CollectingErrorReporter();
    if (options.outputLanguage.toLowerCase() === 'es6') {
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
        options: options,
        errors: errorReporter.errors
      };
    }
  }

  transform(input) {
    return this.promise(this.treeToTree, input);
  }

  treeToString({tree, options, errors}) {
    var treeWriterOptions = {};

    if (options.sourceMap) {
      treeWriterOptions.sourceMapGenerator = new SourceMapGenerator({
        file: options.filename,
        sourceRoot: this.sourceRootForFilename(options.filename)
      });
    }

    return {
      js: write(tree, treeWriterOptions),
      errors: errors,
      sourceMap: treeWriterOptions.sourceMap || null
    };
  }

  write(input) {
    return this.promise(this.treeToString, input);
  }

  resolveModuleName(filename) {
    return filename;
  }

  sourceRootForFilename(filename) {
    return filename;
  }

  promise(method, input) {
    return new Promise((resolve, reject) => {
      var output = method.call(this, input);
      if (output.errors.length)
        reject(new Error(output.errors.join('\n')));
      else
        resolve(output);
    });
  }
}

export class ModuleToCommonJSCompiler extends Compiler {
  constructor() {
    super({
      modules: 'commonjs',
      filename: '<unknown file>',
      sourceMap: false,
      moduleName: false
    });
  }
}

export class ModuleToAmdCompiler extends Compiler {
  constructor() {
    super({
      modules: 'amd',
      filename: undefined,
      sourceMap: false,
      moduleName: true
    });
  }
}

/**
 * Basic compile function. Specify the options when calling this function,
 * or use one of the pre-specified functions below.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object} options Traceur options to override defaults.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
export function compile(content, options) {
  return new Compiler().compile(content, options);
}

/**
 * Use Traceur to compile ES6 type=script source code to ES5 script.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options to override defaults.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
export function script(content, options = {}) {
  options.modules = false;
  return new Compiler().compile(content, options);
}

/**
 * Use Traceur to compile ES6 module source code to 'register' module format.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options to override defaults.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
export function module(content, options = {}) {
  options.modules = 'register';
  return new Compiler().compile(content, options);
}

/**
 * Use Traceur to compile ES6 module source code to 'amd' module format.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
export function moduleToAmd(content, options = undefined) {
  return new ModuleToAmdCompiler().compile(content, options);
}

/**
 * Use Traceur to compile ES6 module source code to 'commonjs' module format.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options to override defaults.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
export function moduleToCommonJS(content, options = undefined) {
  return new ModuleToCommonJSCompiler().compile(content, options);
}

