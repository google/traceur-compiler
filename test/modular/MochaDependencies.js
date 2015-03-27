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

/** @fileoverview Mocha dependencies from Node */

  export var Mocha;
  export var Runner;
  export var reporters;

  if (typeof window === 'undefined') {
    Mocha = require('mocha');
    Runner = require('mocha/lib/runner');
    reporters = require('mocha/lib/reporters');
  } else {
    Mocha = window.Mocha;
    Runner = Mocha.Runner;
    reporters = Mocha.reporters;
  }
