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

/** @fileoverview Wrap Mocha in es6 layer */

import {Mocha, Runner, reporters} from './MochaDependencies.js';

export class Mocha6 extends Mocha {

  constructor(options) {
    super(options);
    this._vinylFiles = Object.create(null);
  }

  /**
   * Setup the underlying mocha to accept files for testing.
   * @return {Object} A mocha thing with suite() and test() properties.
   */
  getContext() {
    let context = this.suite.ctx;
    let file = '';
    this.suite.emit('pre-require', context, file, this);
    return context;
  }

  loadFiles() {
    // no-op, we don't use require() in Mocha6.
  }

  importFiles() {
    let promiseImports = this.files.map((file) => {
      file = './' + file.replace(/\\/g, '/');
      let ctx = {};
      this.suite.emit('pre-require', ctx, file, this);
      return System.import(file, {metadata: this.options.importMetadata}).
          then(() => {
            this.suite.emit('require', ctx, file, this);
            this.suite.emit('post-require', ctx, file, this);
          });
    });
    return Promise.all(promiseImports);
  }

  /**
   * Run tests
   * @return {Runner}
   * @api public
   */

  run() {
    // The base mocha.run will not load files, see loadFiles() override.
    return this.importFiles().then(() => {
      return new Promise((resolve, reject) => {
        super.run((numberOfFailures) => {
          numberOfFailures ? reject(numberOfFailures) : resolve();
        })
      });
    });
  }
}
