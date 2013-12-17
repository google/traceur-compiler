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

var traceur = require('./traceur.js');
var ErrorReporter = traceur.util.TestErrorReporter;
var FromOptionsTransformer = traceur.codegeneration.FromOptionsTransformer;
var Parser = traceur.syntax.Parser;
var SourceFile = traceur.syntax.SourceFile;
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
    modules: 'commonjs',
    filename: '<unknown file>'
  }, options || {});

  traceurOptions.reset();
  merge(traceurOptions, options);

  var errorReporter = new ErrorReporter();
  var sourceFile = new SourceFile(options.filename, content);
  var parser = new Parser(errorReporter, sourceFile);
  var tree = parser.parseModule();
  var transformer = new FromOptionsTransformer(errorReporter);
  var transformedTree = transformer.transform(tree);
  var code = errorReporter.hadError() ? null : TreeWriter.write(transformedTree, null);

  return {
    js: code,
    errors: errorReporter.errors
  };
};

// extend traceur module
module.exports = Object.create(traceur);
module.exports.compile = compile;
