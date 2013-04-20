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

var Module = require('module');
var traceur = require('./traceur.js');
var inlineAndCompileSync = require('./inline-module.js').inlineAndCompileSync;

var TreeWriter = traceur.outputgeneration.TreeWriter;
var ErrorReporter = traceur.util.ErrorReporter;

var ext = '.traceur-compiled';

Module._extensions[ext] = function(module, filename) {
  module.filename = filename.slice(0, -ext.length);
  module._compile(module.compiledCode, module.filename);
};

module.exports = function require(filename) {
  var reporter = new ErrorReporter();
  var tree = inlineAndCompileSync([filename], null, reporter);
  if (reporter.hadError()) {
    // TODO(arv): Provide a SyntaxErrorReporter that throws a SyntaxError on the
    // first error.
    throw new Error();
  }

  var source = TreeWriter.write(tree);
  var module = new Module(filename, require.main);
  module.compiledCode = source;
  module.load(filename + ext);
  return module.exports;
};
