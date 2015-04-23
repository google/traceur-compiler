// Copyright 2011 Traceur Authors.
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
import {
  FORMAL_PARAMETER_LIST,
  FUNCTION_DECLARATION
} from '../../../src/syntax/trees/ParseTreeType.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import expectedArgumentCount from '../../../src/staticsemantics/ExpectedArgumentCount.js';

suite('ExpectedArgumentCount.js', function() {

  function assertExpectedArgumentCount(expected, code) {
    test(code, () => {
      var file = new SourceFile('inline', code);
      var tree = new Parser(file).parseScript();
      assert.equal(1, tree.scriptItemList.length);
      var func = tree.scriptItemList[0];
      assert.equal(func.type, FUNCTION_DECLARATION);
      var params = func.parameterList;
      assert.equal(params.type, FORMAL_PARAMETER_LIST);
      assert.equal(expected, ExpectedArgumentCount(params));
    });
  }

  assertExpectedArgumentCount(0, 'function f() {}');
  assertExpectedArgumentCount(1, 'function f(x) {}');
  assertExpectedArgumentCount(2, 'function f(x, y) {}');
  assertExpectedArgumentCount(3, 'function f(x, y, z) {}');

  assertExpectedArgumentCount(0, 'function f(...xs) {}');
  assertExpectedArgumentCount(1, 'function f(x, ...xs) {}');
  assertExpectedArgumentCount(2, 'function f(x = 1, y, ...xs) {}');

  assertExpectedArgumentCount(0, 'function f(x = 0) {}');
  assertExpectedArgumentCount(0, 'function f(x = 0, y = 1) {}');
  assertExpectedArgumentCount(1, 'function f(x, y = 1) {}');
  assertExpectedArgumentCount(2, 'function f(x = 0, y) {}');

  assertExpectedArgumentCount(1, 'function f(x, {y} = {}) {}');

  assertExpectedArgumentCount(3, 'function f(x = 0, y = 1, z) {}');
});
