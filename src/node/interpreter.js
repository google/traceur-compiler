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

var traceur = require('./traceur.js');
var util = require('./file-util.js');
var inlineAndCompile = require('./inline-module.js').inlineAndCompile;

var ErrorReporter = traceur.util.ErrorReporter;
var TreeWriter = traceur.outputgeneration.TreeWriter;

function interpret(filename, argv) {
  var reporter = new ErrorReporter();

  process.argv = ['traceur', filename].concat(argv || []);

  inlineAndCompile([filename], {}, reporter, function(tree) {
    var compiledCode = TreeWriter.write(tree);

    // TODO: use a new module rather than the main one.
    require.main.filename = filename;
    require.main._compile(compiledCode, filename);

    process.exit(0);
  }, function(err) {
    process.exit(1);
  });
}

module.exports = interpret;
