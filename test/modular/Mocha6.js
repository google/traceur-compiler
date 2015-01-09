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

/* @fileoverview Wrap Mocha in es6 layer, extend to accept VinylFiles */

var Mocha = require('mocha');
var path = require('path');
var Runner = require('mocha/lib/runner');
var reporters = require('mocha/lib/reporters');

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
    var context = this.suite.ctx;
    var file = '';
    this.suite.emit('pre-require', context, file, this);
    return context;
  }

  loadFiles() {
    // no-op, we don't use require() in Mocha6.
  }

  importFiles() {
    var promiseImports = this.files.map((file) => {
      file = path.resolve(file);
      this.suite.emit('pre-require', global, file, this);
      return System.import(file, this.options.importOptions).
          then(() => {
            this.suite.emit('require', global, file, this);
            this.suite.emit('post-require', global, file, this);
          });
    });
    return Promise.all(promiseImports);
  }

  /**
   * Run tests and invoke `fn()` when complete.
   *
   * @return {Runner}
   * @api public
   */

  run(fn) {
    return this.importFiles().then(() => {
      // The base mocha.run will not load files, see loadFiles() override.
      super.run(fn);
    });
  }
}
