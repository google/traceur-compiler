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
var writeCompiledCodeToFile = require('./compiler.js').writeCompiledCodeToFile;
var traceur = require('./traceur.js');

function compileSingleFile(inputFilePath, outputFilePath, compile) {
  return fs.read(inputFilePath).then(function(contents) {
    var result = compile(contents);

    if (result.error)
      throw new Error(result.errors.join('\n'));

    writeCompiledCodeToFile(result.js, outputFilePath, result.sourceMap);
  });
}

function onlyJsFiles(path, stat) {
  return stat.isFile() && /\.js$/.test(path) || false;
}

function compileAllJsFilesInDir(inputDir, outputDir, compile) {
  if (typeof compile !== 'function')
    throw new Error('Missing required function(string) -> result');

  inputDir = path.normalize(inputDir);
  outputDir = path.normalize(outputDir);
  fs.listTree(inputDir, onlyJsFiles).then(function(files) {
    files.forEach(function(inputFilePath) {
      var outputFilePath = inputFilePath.replace(inputDir, outputDir);
      compileSingleFile(inputFilePath, outputFilePath, compile).done();
    });
  }).done();
}

compileSingleFile.compileAllJsFilesInDir = compileAllJsFilesInDir;
module.exports = compileSingleFile;
