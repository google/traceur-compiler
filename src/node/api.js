// Copyright 2013 Traceur Authors.
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

// Node.js API
//
// This is what you get when you `require('traceur')`.
// It's suppose to be used by custom scripts or tools such as Grunt or Karma.

'use strict';

var path = require('path');
var traceur = require('./traceur.js');
var AttachModuleNameTransformer =
    traceur.codegeneration.module.AttachModuleNameTransformer;
var ErrorReporter = traceur.util.TestErrorReporter;
var FromOptionsTransformer = traceur.codegeneration.FromOptionsTransformer;
var PureES6Transformer = traceur.codegeneration.PureES6Transformer;
var Parser = traceur.syntax.Parser;
var SourceFile = traceur.syntax.SourceFile;
var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;
var TreeWriter = traceur.outputgeneration.TreeWriter;
var traceurOptions = traceur.options;

function merge(dest) {
  var src, i;
  for (i = 1; i < arguments.length; i++) {
    src = arguments[i];
    Object.keys(src).forEach(function(key) {
      dest[key] = src[key];
    });
  }

  return dest;
}

// The absolute path to traceur-runtime.js -- the file that should be executed
// if you want to run Traceur-compiled scripts when the compiler isn't present.
var RUNTIME_PATH = path.join(__dirname, '../../bin/traceur-runtime.js');

/**
 * Compile ES6 source code with Traceur.
 *
 * TODO(vojta): Support source maps.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options.
 * @return {string} Transpiled ES5 code.
 */
function compile(content, options) {
  options = merge({
    outputLanguage: 'es5',
    modules: 'commonjs',
    filename: '<unknown file>',
    sourceMap: false,
    cwd: process.cwd()
  }, options || {});

  traceurOptions.reset();
  merge(traceurOptions, options);

  var errorReporter = new ErrorReporter();
  var sourceFile = new SourceFile(options.filename, content);
  var parser = new Parser(sourceFile, errorReporter);
  var tree = parser.parseModule();
  var moduleName = options.filename.replace(/\.js$/, '');
  moduleName = path.relative(options.cwd, moduleName).replace(/\\/g,'/');
  var transformer = new AttachModuleNameTransformer(moduleName);
  tree = transformer.transformAny(tree);

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
    js: TreeWriter.write(transformedTree, treeWriterOptions),
    errors: errorReporter.errors,
    sourceMap: treeWriterOptions.sourceMap || null
  };
};

// extend traceur module
module.exports = Object.create(traceur);
module.exports.compile = compile;
module.exports.RUNTIME_PATH = RUNTIME_PATH;
