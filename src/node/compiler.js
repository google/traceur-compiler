// Copyright 2012 Traceur Authors.
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

require('./traceur.js');

flags.option('--out <FILE>', 'Compile all input files into a single file',
             'compiled.js');

flags.option('--sourcemap', 'Generate source maps');
flags.on('sourcemap', function() {
  flags.sourceMaps = traceur.options.sourceMaps = true;
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
      return traceur.options.filterOption(dashedName);
    });
  }
  return optionHelp.call(this);
}

flags.parse(process.argv);

var outputFile = flags.out;
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

function writeTreeToFile(tree, filename, opt_sourceRoot) {
  var options = null;
  if (flags.sourceMaps) {
    var sourceMapFilePath = getSourceMapFileName(filename);
    var config = {
      file: path.basename(filename),
      sourceRoot: opt_sourceRoot
    };
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

var reporter = new ErrorReporter();

var util = require('./file-util.js');
var inlineAndCompile = require('./inline-module.js').inlineAndCompile;

var writeFile = util.writeFile;
var mkdirRecursive = util.mkdirRecursive;

var isSingleFileCompile = /\.js$/.test(outputFile);

var resolvedOutputFile = path.resolve(outputFile);
var outputDir = isSingleFileCompile ?
    path.dirname(resolvedOutputFile) : resolvedOutputFile;

if (isSingleFileCompile) {

  // Resolve includes before changing directory.
  var resolvedIncludes = includes.map(function(include) {
    return path.resolve(include);
  });

  mkdirRecursive(outputDir);
  process.chdir(outputDir);

  // Make includes relative to output dir so that sourcemap paths are correct.
  resolvedIncludes = resolvedIncludes.map(function(include) {
    return path.relative(outputDir, include);
  });

  inlineAndCompile(resolvedIncludes, flags, reporter, function(tree) {
    writeTreeToFile(tree, resolvedOutputFile);
    process.exit(0);
  }, function(err) {
    process.exit(1);
  });

} else {
  var current = 0;

  var next = function() {
    if (current === includes.length)
      process.exit(0);

    inlineAndCompile(includes.slice(current, current + 1), flags, reporter,
        function(tree) {
          var outputFile = path.join(outputDir, includes[current]);
          var sourceRoot = path.relative(path.dirname(outputFile));
          writeTreeToFile(tree, outputFile, sourceRoot);
          current++;
          next();
        },
        function(err) {
          process.exit(1);
        });
  };

  next();
}
