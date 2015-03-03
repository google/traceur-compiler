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

import {suite, test, assert} from '../../unit/unitTestRunner.js';

suite('Object.js', function() {

  test('Object.assign(target, source)', function() {
    var target = {};
    var source = {foo: 1};

    assert.deepEqual(Object.assign(target, source), source);
  });

  test('Object.assign(target[, ...])', function() {
    var target = {};
    var a = {foo: 1};
    var b = {foo: 2, bar: 1};
    var c = {foo: 3, bar: 2, baz: 1};

    assert.deepEqual(
      Object.assign(target, a, b, c), {foo: 3, bar: 2, baz: 1}
    );
  });

  test('Object.assign, only non-enumerable', function() {
    var target = {};
    var a = Object.defineProperties({}, {
      foo: {
        value: 1,
        enumerable: false
      },
      bar: {
        value: 1,
        enumerable: true
      }
    });

    assert.deepEqual(
      Object.assign(target, a), {bar: 1}
    );
  });

  test('Object.assign(target, undefined)', function() {
    var target = {};
    var source = undefined;

    assert.deepEqual(Object.assign(target, source), target);
  });

  test('Object.assign(target, null)', function() {
    var target = {};
    var source = null;

    assert.deepEqual(Object.assign(target, source), target);
  });

});
