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

/** @fileoverview Configure mocha for Traceur testing.in browsers */

import {TraceurTestRunner} from './TraceurTestRunner.js';
import {webLoader} from '../../src/loader/webLoader.js';

function optionsOnURL() {
  let params = window.location.search.substring(1);
  let nameValuePairs = params.split('&');
  let options = {};
  nameValuePairs.forEach(function(pair){
    let segments = pair.split('=');
    options[segments[0]] = decodeURIComponent(segments[1]);
  });
  return options;
}

export class BrowserTraceurTestRunner extends TraceurTestRunner {

  constructor(mochaOptions = optionsOnURL(), traceurTestOptions) {
    mochaOptions.reporter = mochaOptions.reporter || 'html';
    mochaOptions.ui = mochaOptions.ui || 'tdd';
    mochaOptions.importMetadata = mochaOptions.importMetadata || {
      traceurOptions: {
        sourceMaps: 'inline'
      }
    }
    super(mochaOptions, traceurTestOptions);
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
