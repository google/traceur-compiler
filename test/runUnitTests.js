// Copyright 2015 Traceur Authors.
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

/* @fileoverview Configure mocha and run the test list */

import {unitTestRunner} from './unit/unitTestRunner.js';

let globs = [
  'test/unit/util/*.js',
  'test/unit/syntax/*.js',
  'test/unit/codegeneration/*.js',
  'test/unit/semantics/*.js',
  'test/unit/tools/*.js',
  'test/unit/runtime/*.js',
  'test/unit/system/*.js',
  'test/unit/node/*.js',
  'test/unit/*.js'
];

let inputGlob = process.argv[2];

if (inputGlob) {
	globs = [inputGlob];
}

unitTestRunner.applyOptions(globs);

unitTestRunner.run().then((failures) => {
    process.exit(failures);
  },(ex) => {
    console.log('unitTestRunner FAILED', ex.stack || ex);
    process.exit(-1);
  }
);
