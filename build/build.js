// Copyright 2012 Google Inc.
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

require('../src/traceur-node.js');

flags.option('--out <FILE>', 'path to the file to output');
flags.option('--all-options-off', 'all options are set to false');
flags.on('all-options-off', function() {
  traceur.options.reset(true);
});
flags.option('--dep', 'echo dependencies to stdout');
flags.on('dep', function() {
  if (!flags.out)
    flags.missingArgument('out');
  else
    flags.depTarget = flags.out;
});
traceur.options.addOptions(flags);

flags.parse(process.argv);

var outputfile = flags.out;
if (!outputfile)
  flags.help();

var includes = flags.args;
if (!includes.length) {
  console.error('\n  At least one input file is needed');
  flags.help();
}

var ErrorReporter = traceur.util.ErrorReporter;
var TreeWriter = traceur.outputgeneration.TreeWriter;

function existsSync(p) {
  return fs.existsSync ? fs.existsSync(p) : path.existsSync(p);
}

/**
 * Recursively makes all directoires, similar to mkdir -p
 * @param {string} dir
 */
function mkdirRecursive(dir) {
  var parts = path.normalize(dir).split('/');

  dir = '';
  for (var i = 0; i < parts.length; i++) {
    dir += parts[i] + '/';
    if (!existsSync(dir)) {
      fs.mkdirSync(dir, 0x1FF);
    }
  }
}

var resolvedIncludes = includes.map(function(include) {
  return path.resolve(include);
});

var reporter = new ErrorReporter();

var inlineAndCompile = require('./inline-module.js').inlineAndCompile;

inlineAndCompile(resolvedIncludes, flags, reporter, function(tree) {
  // Currently, passing flags.depTarget is the only reason tree would be null,
  // but in the future there may be other reasons to require a no-op here.
  if (tree) {
    mkdirRecursive(path.dirname(outputfile));
    fs.writeFileSync(outputfile, TreeWriter.write(tree), 'utf8');
  }
  process.exit(0);
}, function(err) {
  process.exit(1);
});
