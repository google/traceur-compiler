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

/* @fileoverview Configure mocha for Traceur testing. */

import {Mocha6} from './Mocha6.js';
let {Command} = require('commander');
let glob = require('glob');

export class TraceurTestRunner extends Mocha6 {
  constructor(defaultOptions) {
    super({
      ui: 'tdd',
      ignoreLeaks: true,
      importMetadata: {
        traceurOptions: {
          sourceMaps: 'memory',
          require: true // Some unit tests use require()
        }
      }
    });
    this.defaultOptions_ = defaultOptions;
  }

  // For derived classes to override.
  defaultOptions() {
    return this.defaultOptions_;
  }

  // Reads process arguments, merges defaults options, returns options object.
  parseCommandLine() {
    let testOptions = this.defaultOptions();
    let commandLine =
        new Command(process.argv[0] + ' ' + process.argv[1]);

    Object.getOwnPropertyNames(testOptions).forEach((prop) => {
      commandLine[prop] = testOptions[prop];
    });

    commandLine.option('-?, --help', 'Show this help text', () => {
      commandLine.help();
    }).usage('[options] [files]')

    // Selected mocha options supported.
    commandLine.option('-g, --grep <pattern>', 'only run tests matching <pattern>').
        option('-i, --invert', 'inverts --grep matches').
        option('-b, --bail', 'bail after first test failure');

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

  applyOptions(testOptions) {
    // Apply the mocha options
    if (testOptions.grep)
      this.grep(new RegExp(testOptions.grep));
    if (testOptions.invert)
      this.invert();
    if (testOptions.bail)
      this.bail();

    testOptions.patterns.forEach((pattern) => {
      let files = glob.sync(pattern, {});
      files.forEach((file) => this.addFile(file));
    });
  }

  run() {
    let failed = 0;
    super.run().then((runner) => {
      runner.on('fail', (err) => {
        failed++;
      });
      runner.on('end', () => {
        console.log('TraceurTestRunner.run calling exit');
        process.exit(failed);
      });
    }, (ex) => {
      console.log('Test setup FAILED ', ex.stack || ex);
      process.exit(failed);
    });
  }

  parseOptionsAndRun() {
    this.applyOptions(this.parseCommandLine());
    this.run();
  }
};
