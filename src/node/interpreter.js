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

var fs = require('fs');
var Module = require('module');
var traceur = require('./traceur.js');
var util = require('./file-util.js');
var inlineAndCompile = require('./inline-module.js').inlineAndCompile;

var ErrorReporter = traceur.util.ErrorReporter;
var TreeWriter = traceur.outputgeneration.TreeWriter;

var ext = '.traceur-compiled';

Module._extensions[ext] = function(module, filename) {
  module.filename = filename.slice(0, -ext.length);
  module._compile(module.compiledCode, module.filename);
};

function interpret(filename, argv, flags) {
  var reporter = new ErrorReporter();
  var execArgv = [require.main.filename].concat(flags || []);

  filename = fs.realpathSync(filename);
  process.argv = ['traceur', filename].concat(argv || []);
  process.execArgv = process.execArgv.concat(execArgv);

  inlineAndCompile([filename], {}, reporter, function(tree) {
    var module = new Module(filename, require.main);

    module.compiledCode = TreeWriter.write(tree);
    module.load(filename + ext);
  }, function(err) {
    console.error(err);
    process.exit(1);
  });
}

module.exports = interpret;
