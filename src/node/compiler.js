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

function writeTreeToFile(tree, filename, useSourceMaps, opt_sourceRoot) {
  var options = null;
  if (useSourceMaps) {
    var sourceMapFilePath = getSourceMapFileName(filename);
    var config = {
      file: path.basename(filename),
      sourceRoot: opt_sourceRoot
    };
    var sourceMapGenerator = new SourceMapGenerator(config);
    options = {sourceMapGenerator: sourceMapGenerator};
  }

  var compiledCode = TreeWriter.write(tree, options);
  if (useSourceMaps) {
    compiledCode += '\n//# sourceMappingURL=' +
        path.basename(sourceMapFilePath) + '\n';
  }
  writeFile(filename, compiledCode);
  if (useSourceMaps)
    writeFile(sourceMapFilePath, options.sourceMap);
}

function compileToSingleFile(outputFile, includes, useSourceMaps) {
  var reporter = new ErrorReporter();
  var resolvedOutputFile = path.resolve(outputFile);
  var outputDir = path.dirname(resolvedOutputFile);

  // Resolve includes before changing directory.
  var resolvedIncludes = includes.map(function(include) {
    return path.resolve(include);
  });

  mkdirRecursive(outputDir);
  process.chdir(outputDir);

  // Make includes relative to output dir so that sourcemap paths are correct.
  resolvedIncludes = resolvedIncludes.map(function(include) {
    return normalizePath(path.relative(outputDir, include));
  });

  inlineAndCompile(resolvedIncludes, {}, reporter, function(tree) {
    writeTreeToFile(tree, resolvedOutputFile, useSourceMaps);
    process.exit(0);
  }, function(err) {
    process.exit(1);
  });
}

function compileToDirectory(outputFile, includes, useSourceMaps) {
  var reporter = new ErrorReporter();
  var outputDir = path.resolve(outputFile);

  var current = 0;

  function next() {
    if (current === includes.length)
      process.exit(0);

    inlineAndCompile(includes.slice(current, current + 1), {}, reporter,
        function(tree) {
          var outputFile = path.join(outputDir, includes[current]);
          var sourceRoot = path.relative(path.dirname(outputFile), '.');
          writeTreeToFile(tree, outputFile, useSourceMaps, sourceRoot);
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
