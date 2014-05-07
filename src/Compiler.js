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
 * Simple source to source compiler.
 */
export class Compiler {
  constructor() {
    this.defaultOptions = {
      outputLanguage: 'es5',
      modules: 'commonjs',
      filename: '<unknown file>',
      sourceMap: false,
      cwd: './',
      moduleName: false
    };
  }

  /**
   * Compile ES6 source code with Traceur.
   *
   * @param  {string} content ES6 source code.
   * @param  {Object=} options Traceur options.
   * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
   */
  compile(content, options = {}) {
    options = merge(this.defaultOptions, options);

    var moduleName = options.moduleName;

    traceurOptions.reset();
    merge(traceurOptions, options);

    var errorReporter = new CollectingErrorReporter();
    var sourceFile = new SourceFile(options.filename, content);
    var parser = new Parser(sourceFile, errorReporter);
    var tree = options.modules ? parser.parseModule() : parser.parseScript();
    var transformer;

    // TODO(arv): This is ugly. Clean up logic.
    if (moduleName === true || options.modules === 'register' ||
        options.modules === 'inline' || options.modules === 'amd') {
      if (options.modules !== 'amd' || typeof moduleName !== 'string')
        moduleName = this.resolveModuleName(options.cwd, options.filename);
      transformer = new AttachModuleNameTransformer(moduleName);
      tree = transformer.transformAny(tree);
    }

    if (options.outputLanguage.toLowerCase() === 'es6') {
      transformer = new PureES6Transformer(errorReporter);
    } else {
      transformer = new FromOptionsTransformer(errorReporter);
    }

    var transformedTree = transformer.transform(tree);

    if (errorReporter.hadError()) {
      return {
        js: null,
        errors: errorReporter.errors,
        sourceMap: null
      };
    }

    var treeWriterOptions = {};

    if (options.sourceMap) {
      treeWriterOptions.sourceMapGenerator = new SourceMapGenerator({
        file: options.filename,
        sourceRoot: null
      });
    }

    return {
      js: write(transformedTree, treeWriterOptions),
      errors: errorReporter.errors,
      sourceMap: treeWriterOptions.sourceMap || null
    };
  }

  resolveModuleName(cwd, filename) {
    return filename;
  }
}

/**
 * Compile ES6 source code with Traceur.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
export function compile(content, options = undefined) {
  return new Compiler().compile(content, options);
}
