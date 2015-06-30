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

import {suite, test, assert} from '../../unit/unitTestRunner.js';
import getDependencies from '../../../src/node/get-dependencies.js';

suite('get-dependencies.js', () => {
  test('Empty', () => {
    let deps = getDependencies();
    assert.equal(deps.size, 0);
  });

  test('Basic', () => {
    let path = './test/unit/runtime/resources/test_module.js';
    let deps = getDependencies(path);
    assert.equal(deps.size, 4);
    let a = [...deps].map((d) => {
      d = d.replace(/\\/g, '/');
      let i = d.indexOf('/test/');
      return d.slice(i);
    });
    assert.deepEqual(a, [
      '/test/unit/runtime/resources/test_module.js',
      '/test/unit/runtime/resources/test_a.js',
      '/test/unit/runtime/resources/test_b.js',
      '/test/unit/runtime/resources/test_c.js'
    ]);
  });

});
