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

import {suite, test, assert, setup} from '../../unit/unitTestRunner.js';

import {AmdTransformer} from '../../../src/codegeneration/AmdTransformer.js';
import {Options} from '../../../src/Options.js';
import * as ParseTreeFactory from '../../../src/codegeneration/ParseTreeFactory.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('AmdTransformer.js', function() {

  var transformer = null

  setup(function() {
    transformer = new AmdTransformer(null, null, new Options());
  });

  function str(s) {
    return ParseTreeFactory.createExpressionStatement(
        ParseTreeFactory.createStringLiteral(s));
  }

  suite('wrapModule', function() {
    function writeArray(arr) {
      return arr.map(function(item) {
        return write(item);
      }).join('');
    }

    function removeWhiteSpaces(str) {
      return str.replace(/\s/g, '');
    }

    function assertEqualIgnoringWhiteSpaces(a, b) {
      assert.equal(removeWhiteSpaces(a), removeWhiteSpaces(b));
    }

    test('with no dependencies', function() {
      assertEqualIgnoringWhiteSpaces(
          'define([], function() {"CODE";});',
          writeArray(transformer.wrapModule([str('CODE')])));
    });

    test('with dependencies', function() {
      transformer.dependencies.push({path: './foo', local: '__dep0'});
      transformer.dependencies.push({path: './bar', local: '__dep1'});

      assertEqualIgnoringWhiteSpaces(
          'define(["./foo","./bar"],function(__dep0,__dep1){"CODE";});',
          writeArray(transformer.wrapModule([str('CODE')])));
    });
  });

});
