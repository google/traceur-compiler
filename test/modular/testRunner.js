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

export var testRunner = new Mocha6({
  ui: 'tdd',
  ignoreLeaks: true
});

var context = testRunner.getContext();

export var suite = context.suite;
export var test = context.test;
export var setup = context.setup;
export var teardown = context.teardown;

var chai = require('chai');
export var assert = chai.assert;