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

/** @fileoverview Configure mocha for Traceur testing on node. */

import {TraceurTestRunner} from './TraceurTestRunner.js';

export function globPatterns(patterns) {
  // This require will cause a compile error if at module scope.
  // TOOD async load the class.
  let glob = require('glob');
  return Promise.all(
    patterns.map((pattern) => {
      return new Promise((resolve, reject) => {
        glob(pattern, {}, (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(files);
          }
        });
      });
    })).then((arrayOfFiles) => {
      let allFiles = [];
      arrayOfFiles.forEach((files) => {
        allFiles.push(...files);
      });
      return allFiles.map((file) => file.replace(/\\/g, '/'));
    });
}

export class NodeTraceurTestRunner extends TraceurTestRunner {
  constructor(traceurTestOptions) {
    super({
      ui: 'tdd',
      ignoreLeaks: true,
      reporter: 'dot',
      importMetadata: {
        traceurOptions: {
          sourceMaps: 'memory',
          require: true // Some unit tests use require()
        }
      }
    }, traceurTestOptions);
  }

  // Reads process arguments, merges defaults options, returns options object.
  getOptions() {
    let {Command} = require('commander');
    let testOptions = this.defaultOptions();
    let commandLine =
        new Command(process.argv[0] + ' ' + process.argv[1]);

    Object.keys(testOptions).forEach((prop) => {
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

  expandPatterns() {
    return globPatterns(this.patterns_).then((files) => {
      files.forEach((file) => this.addFile(file));
    });
  }

};
