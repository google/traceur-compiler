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

'use strict';

var vm = require('vm');
var nodeRepl = require('repl');

var traceur = require('./traceur.js');
var TestErrorReporter = traceur.util.TestErrorReporter;
var FromOptionsTransformer = traceur.codegeneration.FromOptionsTransformer;
var Parser = traceur.syntax.Parser;
var SourceFile = traceur.syntax.SourceFile;
var TreeWriter = traceur.outputgeneration.TreeWriter;
var traceurOptions = traceur.options;

function compile(content, filename) {
  // TODO: Too many "compile" functions (in repl.js, compiler.js, require.js,
  // and api.js). Use one of them here instead (perhaps inlineAndCompileSync).

  var errorReporter = new TestErrorReporter();
  var sourceFile = new SourceFile(filename, content);
  var parser = new Parser(errorReporter, sourceFile);
  var tree = parser.parseScript();
  var transformer = new FromOptionsTransformer(errorReporter);
  var transformedTree = transformer.transform(tree);

  if (errorReporter.hadError()) {
    var message = errorReporter.errors.join('\n');

    // marker used by node >= 0.11.7 to detect multi-line commands
    var endOfInput = "Unexpected end of input";
    throw new SyntaxError(message.contains(endOfInput) ? endOfInput : message);
  }

  var code = TreeWriter.write(transformedTree, null);

  return code;
};

function traceurEval(cmd, context, filename, callback) {
  try {
    var code = compile(cmd, filename);
    var result = vm.runInContext(
        code, context, filename, { displayErrors: false });
  } catch (err) {
    callback(err);
    return;
  }
  callback(null, result);
}

/**
 * Runs the Traceur REPL.
 *
 * @param {Object} options The options for the REPL -- same as for
 *     <http://nodejs.org/api/repl.html> except that 'eval' is ignored.
 */
function start(options) {
  options = options || {};
  if (typeof options !== 'object') {
    // The old options syntax of node's repl is not supported.
    throw new TypeError('options must be an Object');
  }

  options.eval = traceurEval;

  return nodeRepl.start(options);
}

exports.compile = compile;
exports.eval = traceurEval;
exports.start = start;
