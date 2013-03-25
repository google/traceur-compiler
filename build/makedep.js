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

// This file is used to create 'build/dep.mk', which is used by 'make' to find
// out the dependencies for 'bin/traceur.js'.
//
// The output of this file is something like:
//
//   bin/traceur.js: src/options.js
//   bin/traceur.js: src/codegeneration/RestParameterTransformer.js

'use strict';

var fs = require('fs');
var path = require('path');

var flags;
var cmdName = path.basename(process.argv[1]);
try {
  flags = new (require('commander').Command)(cmdName);
} catch (ex) {
  console.error('Commander.js is required for this to work. To install it ' +
                'run:\n\n  npm install commander\n');
  process.exit(1);
}
flags.setMaxListeners(100);

var traceur = require('../src/node/traceur.js');

flags.option('--depTarget <FILE>', 'path to the dependency target');

traceur.options.addOptions(flags);

flags.parse(process.argv);

if (!flags.depTarget) {
  console.error('\n  `--depTarget\' missing.\n');
  process.exit(1);
}

var includes = flags.args;
if (!includes.length) {
  console.error('\n  At least one input file is needed.\n');
  process.exit(1);
}

var ErrorReporter = traceur.util.ErrorReporter;

var resolvedIncludes = includes.map(function(include) {
  return path.resolve(include);
});

var reporter = new ErrorReporter();

var inlineAndCompile = require('../src/node/inline-module.js').inlineAndCompile;

inlineAndCompile(resolvedIncludes, flags, reporter, function(tree) {
  process.exit(0);
}, function(err) {
  process.exit(1);
});
