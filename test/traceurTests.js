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

import {testRunner} from './modular/testRunner.js';
let glob = require('glob');
let commander = require('commander');

function defaultTestOptions() {
  let patterns = [
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
  return {patterns: patterns};
}

function mergeWithOptions(testOptions) {

  let commandLine =
      new commander.Command(process.argv[0] + ' ' + process.argv[1]);

  for(let prop in testOptions)
    commandLine[prop] = testOptions[prop];

  commandLine.option('-?, --help', 'Show this help text', () =>{
    commandLine.help();
  }).usage('[options] [files]')

  // Selected mocha options supported.
  commandLine.option('-g, --grep <pattern>', 'only run tests matching <pattern>').
      option('-i, --invert', 'inverts --grep matches').
      option('-b, --bail', "bail after first test failure");
  
  commandLine.command('only <file> [files...]').
      description('only test these [files] ').action(
      (file, files) => {
        commandLine.patterns = [file];
        if (files)
          commandLine.patterns = commandLine.patterns.concat(files);

      });

  commandLine.parse(process.argv);

  return commandLine;
}

function runTests(testOptions) {
  // Apply the mocha options
  if (testOptions.grep) 
    testRunner.grep(new RegExp(testOptions.grep));
  if (testOptions.invert)
    testRunner.invert();
  if (testOptions.bail)
    testRunner.bail();
  
  testOptions.patterns.forEach((pattern) => {
    let files = glob.sync(pattern, {});
    files.forEach((file) => testRunner.addFile(file));
  });

  testRunner.run().then((runner) => {
    let failed = 0;
    runner.on('fail', (err) => {
      failed++;
    });
    runner.on('end', () => {
      process.exit(failed);
    });
  });
}

runTests(
    mergeWithOptions(
        defaultTestOptions()
    )
);
