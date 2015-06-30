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

export class TraceurTestRunner extends Mocha6 {
  constructor(mochaOptions, traceurTestOptions) {
    super(mochaOptions);
    this.defaultOptions_ = traceurTestOptions || {};
    this.patterns_ = [];
  }

  // For derived classes to override.
  defaultOptions() {
    return this.defaultOptions_;
  }

  applyOptions(patterns) {
    // Apply the mocha options
    var testOptions = this.getOptions();
    if (testOptions.grep)
      this.grep(new RegExp(testOptions.grep));
    if (testOptions.invert)
      this.invert();
    if (testOptions.bail)
      this.bail();
    this.patterns_ = patterns;
  }

  run() {
    let numberOfFailures = 0;
    return this.expandPatterns().then(() => {
      return super.run()
    });
  }
};
