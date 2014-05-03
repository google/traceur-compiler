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

var traceur = require('./traceur.js');
var compileAllJsFilesInDir =
    require('./compile-single-file.js').compileAllJsFilesInDir;

if (process.argv.length < 4) {
  console.log('Not enough arguments!\n' +
              '  Usage node src/node/to-commonjs-compiler.js <inputDirectory> <outputDirectory>');
  process.exit(1);
}

// Nasty, we should rather pass the options to FromOptionsTransformer
traceur.options.modules = 'commonjs';

var inputDir = process.argv[2];
var outputDir = process.argv[3];

compileAllJsFilesInDir(inputDir, outputDir, true);
