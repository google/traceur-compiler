// Copyright 2016 Traceur Authors.
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

import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import bindingsInDestructuringPattern from '../../../src/semantics/bindingsInDestructuringPattern.js';

suite('bindingsInDestructuringPattern.js', function() {
  function makeTest(code, names) {
    test(code, function() {
      const parser = new Parser(new SourceFile('CODE', code));
      const tree = parser.parseScript();
      assert.equal(tree.scriptItemList.length, 1);
      const set = bindingsInDestructuringPattern(tree.scriptItemList[0]);
      assert.deepEqual(set.valuesAsArray(), names);
    });
  }

  makeTest('var x', ['x']);
  makeTest('let x = 1', ['x']);
  makeTest('const {x} = {x: 1}', ['x']);
  makeTest('var {x: y} = {x: 1}', ['y']);
  makeTest('let [x] = [1]', ['x']);
  makeTest('const [...x] = [1]', ['x']);

  makeTest('var x, y', ['x', 'y']);
  makeTest('let x = 1, y = 2', ['x', 'y']);
  makeTest('const {x, y} = {x: 1, y: 2}', ['x', 'y']);
  makeTest('var {x, y: y} = {x: 1, y: 2}', ['x', 'y']);
  makeTest('let [x, y] = [1, 2]', ['x', 'y']);
  makeTest('const [x, ...y] = [1]', ['x', 'y']);

  makeTest('var {x: {y}} = {x: {y: 2}}', ['y']);
  makeTest('let {x: {y: y}} = {x: {y: 2}}', ['y']);
  makeTest('const {x: [y]} = {x: [2]}', ['y']);
  makeTest('var {x: [...y]} = {x: [2]}', ['y']);

  makeTest('var {x = function f() { var z; }} = {x: 1}', ['x']);
  makeTest('let {x: x = function f() { var z; }} = {x: 1}', ['x']);
  makeTest('const [x = function f() { var z; }] = [1]', ['x']);

  makeTest('var {x} = {x: function f() { var z; }}', ['x']);
});
