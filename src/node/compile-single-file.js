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

var fs = require('q-io/fs');
var path = require('path');
var writeTreeToFile = require('./compiler.js').writeTreeToFile;

var traceur = require('./traceur.js');
var ErrorReporter = traceur.util.ErrorReporter;
var AttachModuleNameTransformer =
    traceur.codegeneration.module.AttachModuleNameTransformer;
var FromOptionsTransformer = traceur.codegeneration.FromOptionsTransformer;
var Parser = traceur.syntax.Parser;
var SourceFile = traceur.syntax.SourceFile;

function compileSingleFile(inputFilePath, outputFilePath, anonymousModules) {
  return fs.read(inputFilePath).then(function(contents) {
    var reporter = new ErrorReporter();
    var sourceFile = new SourceFile(inputFilePath, contents);
    var parser = new Parser(sourceFile, reporter);
    var tree = parser.parseModule();
    var moduleName, transformer;
    if (!anonymousModules) {
      moduleName = inputFilePath.replace(/\.js$/, '').replace(/\\/g,'/');
      // Module naming uses ./ to signal relative names.
      if (moduleName[0] !== '/')
        moduleName = './' + moduleName;
      transformer = new AttachModuleNameTransformer(moduleName);
      tree = transformer.transformAny(tree);
    }
    transformer = new FromOptionsTransformer(reporter);
    var transformed = transformer.transform(tree);

    if (!reporter.hadError()) {
      writeTreeToFile(transformed, outputFilePath);
    }
  });
}

function onlyJsFiles(path, stat) {
  return stat.isFile() && /\.js$/.test(path) || false;
}

function compileAllJsFilesInDir(inputDir, outputDir, anonymousModules) {
  inputDir = path.normalize(inputDir);
  outputDir = path.normalize(outputDir);
  fs.listTree(inputDir, onlyJsFiles).then(function(files) {
    files.forEach(function(inputFilePath) {
      var outputFilePath = inputFilePath.replace(inputDir, outputDir);
      compileSingleFile(inputFilePath, outputFilePath, anonymousModules).done();
    });
  }).done();
}

compileSingleFile.compileAllJsFilesInDir = compileAllJsFilesInDir;
module.exports = compileSingleFile;
