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

require('../src/node/traceur.js');

flags.option('--out <FILE>', 'Compile all input files into a single file',
             'compiled.js');

flags.option('--sourcemap', 'Generate source maps');
flags.on('sourcemap', function() {
  flags.sourceMaps = traceur.options.sourceMaps = true;
});

flags.option('--dep', 'Used by the build system to generate a dependency file');
flags.on('dep', function() {
  if (!flags.out)
    flags.missingArgument('out');
  else
    flags.depTarget = flags.out;
});

flags.option('--longhelp', 'Show all known options');
flags.on('longhelp', function() {
  flags.help();
  process.exit();
});

flags.on('--help', function() {
  console.log('  Examples:');
  console.log('');
  console.log('    $ %s a.js', cmdName);
  console.log('    $ %s b.js c.js --out compiled.js', cmdName);
  console.log('');
});

traceur.options.addOptions(flags);

flags.usage('[options] [files]');

// Override commander.js's optionHelp to filter out the Traceur feature flags
// from showing up in the help message.
var optionHelp = flags.optionHelp;
flags.optionHelp = function() {
  if (!flags.longhelp) {
    this.options = this.options.filter(function(command) {
      var dashedName = command.long.slice(2);
      return dashedName !== 'dep' && traceur.options.filterOption(dashedName);
    });
  }
  return optionHelp.call(this);
}

flags.parse(process.argv);

var outputfile = flags.out;
var includes = flags.args;


if (!includes.length) {
  // TODO: Start trepl
  console.error('\n  Error: At least one input file is needed');
  flags.help();
  process.exit(1);
}

function getSourceMapFileName(name) {
  return name.replace(/\.js$/, '.map');
}

function writeTreeToFile(tree, filename) {
  var options = null;
  if (flags.sourceMaps) {
    var sourceMapFilePath = getSourceMapFileName(filename);
    var config = {file: path.basename(filename)};
    var sourceMapGenerator = new SourceMapGenerator(config);
    options = {sourceMapGenerator: sourceMapGenerator};
  }

  var compiledCode = TreeWriter.write(tree, options);
  if (flags.sourceMaps) {
    compiledCode += '\n//@ sourceMappingURL=' +
        path.basename(sourceMapFilePath);
  }
  writeFile(filename, compiledCode);
  if (flags.sourceMaps)
    writeFile(sourceMapFilePath, options.sourceMap);
}

var ErrorReporter = traceur.util.ErrorReporter;
var TreeWriter = traceur.outputgeneration.TreeWriter;
var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;

var util = require('../src/node/util.js');
var writeFile = util.writeFile;
var removeCommonPrefix = util.removeCommonPrefix;
var mkdirRecursive = util.mkdirRecursive;

mkdirRecursive(path.dirname(outputfile));

// Resolve includes before changing directory.
var resolvedIncludes = includes.map(function(include) {
  return path.resolve(include);
});

outputfile = path.resolve(outputfile);
var outputDir = path.dirname(outputfile);
process.chdir(outputDir);

// Make includes relative to output dir so that sourcemap paths are correct.
resolvedIncludes = resolvedIncludes.map(function(include) {
  return path.relative(outputDir, include);
});

var reporter = new ErrorReporter();

var inlineAndCompile = require('./inline-module.js').inlineAndCompile;

inlineAndCompile(resolvedIncludes, flags, reporter, function(tree) {
  // Currently, passing flags.depTarget is the only reason tree would be null,
  // but in the future there may be other reasons to require a no-op here.
  if (tree)
    writeTreeToFile(tree, outputfile);
  process.exit(0);
}, function(err) {
  process.exit(1);
});
