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

import {InlineModuleTransformer} from '../../../src/codegeneration/InlineModuleTransformer.js';
import * as ParseTreeFactory from '../../../src/codegeneration/ParseTreeFactory.js';
import {ParseTreeTransformer} from '../../../src/codegeneration/ParseTreeTransformer.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('low_level_tests.js', function() {

  var createBreakStatement = ParseTreeFactory.createBreakStatement;
  var createContinueStatement = ParseTreeFactory.createContinueStatement;
  var createCatchStatement = ParseTreeFactory.createCatchStatement;
  var createIdentifierToken = ParseTreeFactory.createIdentifierToken;
  var createCatch = ParseTreeFactory.createCatch;

  function toTree(errorReporter, name, source) {
    var sourceFile = new SourceFile(name, source);
    var parser = new Parser(sourceFile, errorReporter);
    var tree = parser.parseScript();
    return tree;
  }

  function TestTransformer() {}

  TestTransformer.prototype = Object.create(ParseTreeTransformer.prototype);
  TestTransformer.prototype.transformBreakStatement = function(tree) {
    return createBreakStatement(tree.name);  // issue 75
  };
  TestTransformer.prototype.transformContinueStatement = function(tree) {
    return createContinueStatement(tree.name);  // issue 75
  };
  TestTransformer.prototype.transformCatch = function(tree) {
    var catchBody = this.transformAny(tree.catchBody);
    var binding = this.transformAny(tree.binding);

    return createCatch(binding.identifierToken, catchBody); // issue 71
  };

  function oneTest(name, source) {
    var errors = [];

    var errorReporter = {
      reportError: function(position, message) {
        errors.push({position: String(position), message: message});
      }
    };

    var tree = toTree(errorReporter, name, source);
    var transformer = new TestTransformer();
    var output_tree = transformer.transformAny(tree);
    ParseTreeValidator.validate(output_tree);

    var outputSource = write(output_tree);

    var inputValue = eval(source);
    var outputValue = eval(outputSource);
    // console.log('output: ' + outputValue + ' :\n ' + outputSource);
    assert.equal(inputValue, outputValue);
  }

  test('CreateBreakStatement', function() {
    var name = 'createBreakStatement';
    var source =
       'function f() {\n' +
       '  var a = 1;\n' +
       '  L1: while(a < 10) {\n' +
       '    while(a < 9) {\n' +
       '      a++;\n' +
       '      break L1;\n' +
       '    }\n' +
       '    a++;\n' +
       '  }\n' +
       '  return a;\n' +
       '}\n' +
       'f()\n';
    oneTest(name, source);
  });

  test('CreateContinueStatement', function() {
    var name = 'createContinueStatement';
    var source =
       'function f() {\n' +
       '  var a = 1, b = 1;\n' +
       '  L1: while(a < 10) {\n' +
       '    a++;\n' +
       '    while(b < a) {\n' +
       '      b++;\n' +
       '      continue L1;\n' +
       '    }\n' +
       '    b++;\n' +
       '  }\n' +
       '  return b;\n' +
       '}\n' +
       'f()\n';
    oneTest(name, source);
  });

  test('CreateCatch', function() {
    var name = 'createCatch';
    var source =
       'function f() {\n' +
       '  var a = 1;\n' +
       '  try {\n' +
       '    throw undefined;\n' +
       '  } catch (exc) {\n' +
       '    a = 2;\n' +
       '  }\n' +
       '  return a;\n' +
       '}\n' +
       'f()\n';
    oneTest(name, source);
  });

});
