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

import {suite, test, assert, setup} from '../../unit/unitTestRunner.js';

import {InlineModuleTransformer} from '../../../src/codegeneration/InlineModuleTransformer.js';
import {Options} from '../../../src/Options.js';
import * as ParseTreeFactory from '../../../src/codegeneration/ParseTreeFactory.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('InlineModuleTransformer.js', function() {

  var transformer = null

  setup(function() {
    transformer = new InlineModuleTransformer(null, null, new Options());
  });

  function str(s) {
    return ParseTreeFactory.createExpressionStatement(
        ParseTreeFactory.createStringLiteral(s));
  }

  function removeWhiteSpaces(str) {
    return str.replace(/\s/g, '');
  }

  function assertEqualIgnoringWhiteSpaces(a, b) {
    assert.equal(removeWhiteSpaces(a), removeWhiteSpaces(b));
  }

  suite('wrapModule', function() {
    function writeArray(arr) {
      return arr.map(function(item) {
        return write(item, undefined, '/');
      }).join('');
    }

    test('without this', function() {
      transformer.moduleName = "test/module";
      assertEqualIgnoringWhiteSpaces(
          'var $__test_47_module__ = (function(){"CODE";})();',
          writeArray(transformer.wrapModule([str('CODE')])));
    });

    test('with this', function() {
      transformer.moduleName = "test/module";
      assertEqualIgnoringWhiteSpaces(
          "var$__test_47_module__=(function(){this})();",
          writeArray(transformer.wrapModule([ParseTreeFactory.createThisExpression()])));
    });
  });
});
