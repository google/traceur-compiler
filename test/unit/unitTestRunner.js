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

import {NodeTraceurTestRunner} from '../modular/NodeTraceurTestRunner.js';
import {BrowserTraceurTestRunner} from '../modular/BrowserTraceurTestRunner.js';

export let unitTestRunner;
let chai;
if (typeof window !== 'undefined') {
  unitTestRunner = new BrowserTraceurTestRunner();
  chai = window.chai;
} else {
  unitTestRunner = new NodeTraceurTestRunner();
  chai = require('chai');
}

var context = unitTestRunner.getContext();

export var suite = function(title, tests) {
  if (typeof window !== 'undefined' && title.startsWith('node-only:')) {
    return;
  }
  return context.suite(title, tests);
};

export var test = context.test;
export var setup = context.setup;
export var teardown = context.teardown;

export var assert = chai.assert;
export var AssertionError = chai.AssertionError;

export function assertArrayEquals(expected, actual) {
  assert.equal(JSON.stringify(actual, null, 2),
               JSON.stringify(expected, null, 2));
}

unitTestRunner.applyOptions([
    'test/unit/util/*.js',
    'test/unit/syntax/*.js',
    'test/unit/codegeneration/*.js',
    'test/unit/semantics/*.js',
    'test/unit/tools/*.js',
    'test/unit/runtime/*.js',
    'test/unit/system/*.js',
    'test/unit/node/*.js',
    'test/unit/*.js'
]);