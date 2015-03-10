// Copyright 2014 Traceur Authors.
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

import {resolveUrl} from '../../../../src/util/url.js';
import {suite, test, assert} from '../../../unit/unitTestRunner.js';


var testScriptName = '../../unit/runtime/test_script.js';
System.loadAsScript(testScriptName, {referrerName: __moduleName}).then(function(result) {
  assert('A', result[0]);
  assert('B', result[1]);
  assert('C', result[2]);
}, function(error) {
  throw new Error('test_interpret loadAsScript FAILED: ' + error);
});

var testModuleName = '../../unit/runtime/test_module.js';
System.import(testModuleName, {referrerName: __moduleName}).then(function(mod) {
  assert('test', mod.name);
  assert('A', mod.a);
  assert('B', mod.b);
  assert('C', mod.c);
}, function(error) {
  throw new Error('test_interpret import FAILED: ' + error);
});

