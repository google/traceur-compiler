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

import {TraceurTestRunner} from './TraceurTestRunner.js';
import {webLoader} from '../../src/runtime/webLoader.js';

export class BrowserTraceurTestRunner extends TraceurTestRunner {

  constructor(traceurTestOptions) {
    super({
      reporter: 'html',
      ui: 'tdd',
      importMetadata: {
        traceurOptions: {
          sourceMaps: 'inline'
        }
      }
    }, traceurTestOptions);
  }

  expandPatterns() {
    let url = './traceurService/testGlobs?patterns=';
    url += encodeURIComponent(JSON.stringify(this.patterns_));
    return new Promise((resolve, reject) => {
      webLoader.load(url, (files) => {
        resolve(JSON.parse(files).forEach((file) => this.addFile(file)));
      }, (ex) => {
        console.error(url + ' FAILED ', ex.stack || ex);
      });
    });
  }

  getOptions() {
    return this.defaultOptions();
  }

};
