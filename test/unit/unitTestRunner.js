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

export * from '../asserts.js';

export let unitTestRunner;
if (typeof require === 'undefined') {
  unitTestRunner = new BrowserTraceurTestRunner();
} else {
  unitTestRunner = new NodeTraceurTestRunner();
}

let context = unitTestRunner.getContext();

export let suite = context.suite;

export let test = context.test;
export let setup = context.setup;
export let teardown = context.teardown;
