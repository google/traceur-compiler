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
var path = require('path');

var traceur = require('./traceur.js');

var inlineAndCompile = require('./inline-module.js').inlineAndCompile;
var util = require('./file-util.js');
var writeFile = util.writeFile;
var mkdirRecursive = util.mkdirRecursive;
var normalizePath = util.normalizePath;

var ErrorReporter = traceur.util.ErrorReporter;
var TreeWriter = traceur.outputgeneration.TreeWriter;
var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;

function getSourceMapFileName(name) {
  return name.replace(/\.js$/, '.map');
}

var SourceMapType = {
  NONE: 0,
  EXTERNAL: 1,
  INLINE: 2
};

var SM_PRELUDE = '\n//# sourceMappingURL=';
var INLINE_SM_PRELUDE = SM_PRELUDE + 'data:application/json;base64,';

function writeTreeToFile(tree, filename, sourceMapType, opt_sourceRoot) {
  var options;
  var sourceMapFilePath;
  if (sourceMapType === true) sourceMapType = SourceMapType.EXTERNAL;
  if (sourceMapType > SourceMapType.NONE) {
    sourceMapFilePath = getSourceMapFileName(filename);
    var config = {
      file: path.basename(filename),
      sourceRoot: opt_sourceRoot
    };
    var sourceMapGenerator = new SourceMapGenerator(config);
    options = {sourceMapGenerator: sourceMapGenerator};
  }

  var compiledCode = TreeWriter.write(tree, options);
  if (sourceMapType === SourceMapType.EXTERNAL) {
    compiledCode += SM_PRELUDE + path.basename(sourceMapFilePath) + '\n';
  } else if (sourceMapType === SourceMapType.INLINE) {
    var base64sm = new Buffer(options.sourceMap).toString('base64');
    compiledCode += INLINE_SM_PRELUDE + base64sm + '\n';
  }
  writeFile(filename, compiledCode);
  if (sourceMapType === SourceMapType.EXTERNAL)
    writeFile(sourceMapFilePath, options.sourceMap);
}

function compileToSingleFile(outputFile, includes, sourceMapType) {
  var reporter = new ErrorReporter();
  var resolvedOutputFile = path.resolve(outputFile);
  var outputDir = path.dirname(resolvedOutputFile);

  // Resolve includes before changing directory.
  var resolvedIncludes = includes.map(function(include) {
    include.name = path.resolve(include.name);
    return include;
  });

  mkdirRecursive(outputDir);
  process.chdir(outputDir);

  // Make includes relative to output dir so that sourcemap paths are correct.
  resolvedIncludes = resolvedIncludes.map(function(include) {
    include.name = normalizePath(path.relative(outputDir, include.name));
    return include;
  });

  inlineAndCompile(resolvedIncludes, traceur.options, reporter, function(tree) {
    writeTreeToFile(tree, resolvedOutputFile, sourceMapType);
    process.exit(0);
  }, function(err) {
    console.error(err);
    process.exit(1);
  });
}

function compileToDirectory(outputDir, includes, sourceMapType) {
  var reporter = new ErrorReporter();
  var outputDir = path.resolve(outputDir);

  var current = 0;

  function next() {
    if (current === includes.length)
      process.exit(0);

    inlineAndCompile(includes.slice(current, current + 1), traceur.options,
        reporter,
        function(tree) {
          var outputFile = path.join(outputDir, includes[current].name);
          var sourceRoot = path.relative(path.dirname(outputFile), '.');
          writeTreeToFile(tree, outputFile, sourceMapType, sourceRoot);
          current++;
          next();
        },
        function(err) {
          process.exit(1);
        });
  }

  next();
}

exports.compileToSingleFile = compileToSingleFile;
exports.compileToDirectory = compileToDirectory;
exports.writeTreeToFile = writeTreeToFile;
exports.SourceMapType = SourceMapType;
