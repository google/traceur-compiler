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

var glob = require("glob")
var fs = require('fs');
var path = require('path');
var writeCompiledCodeToFile =
    require('./NodeCompiler.js').writeCompiledCodeToFile;

function compileSingleFile(inputFilePath, outputFilePath, compile) {
  return fs.readFile(inputFilePath, function(err, contents) {
    if (err)
      throw new Error('While reading ' + inputFilePath + ': ' + err);

    var result = compile(contents.toString());

    if (result.error)
      throw new Error(result.errors.join('\n'));

    writeCompiledCodeToFile(result.js, outputFilePath, result.generatedSourceMap);
  });
}

function compileAllJsFilesInDir(inputDir, outputDir, compile) {
  if (typeof compile !== 'function')
    throw new Error('Missing required function(string) -> result');

  inputDir = path.normalize(inputDir).replace(/\\/g, '/');
  outputDir = path.normalize(outputDir).replace(/\\/g, '/');

  glob(inputDir + '/**/*.js', {}, function (er, files) {
    if (er)
      throw new Error('While scanning ' + inputDir + ': ' + er);

    files.forEach(function(inputFilePath) {
      var outputFilePath = inputFilePath.replace(inputDir, outputDir);
      compileSingleFile(inputFilePath, outputFilePath, compile);
    });
  });
}

module.exports = {
  compileAllJsFilesInDir: compileAllJsFilesInDir
};
