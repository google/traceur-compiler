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

import {ErrorReporter} from '../../../src/util/ErrorReporter.js';
import {Options} from '../../../src/Options.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {TypeAssertionTransformer} from '../../../src/codegeneration/TypeAssertionTransformer.js';
import {UniqueIdentifierGenerator} from '../../../src/codegeneration/UniqueIdentifierGenerator.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('TypeAssertionTransformer.js', function() {

  function parseExpression(content, reporter, options) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, reporter, options);
    return parser.parseExpression();
  }

  function testAssertions(code, expected) {
    var options = new Options();
    options.types = true;
    options.typeAssertions = true;
    var tree = parseExpression(code, reporter, options);
    var expectedTree = parseExpression(expected, reporter, options);
    var identifierGenerator = new UniqueIdentifierGenerator();
    var reporter = new ErrorReporter();

    var transformer = new TypeAssertionTransformer(identifierGenerator, reporter, options);
    var transformed = transformer.transformAny(tree);

    assert.equal(write(transformed), write(expectedTree));
  }

  // https://github.com/google/traceur-compiler/issues/1443
  test('Arrow function with body', function() {
    var code =
      'function test():string {\n' +
      '  var a = () => { return 0;};\n' +
      '  a();\n' +
      '  return "str";\n' +
      '}';

    var expected =
      'function test():string {\n' +
      '  var a = () => { return 0;};\n' +
      '  a();\n' +
      '  return assert.returnType(("str"), string);\n' +
      '}';

    testAssertions(code, expected);
  });

  // https://github.com/google/traceur-compiler/issues/1443
  test('Arrow function with concise body', function() {
    var code =
      'function test():string {\n' +
      '  var a = () => 0;\n' +
      '  a();\n' +
      '  return "str";\n' +
      '}';

    var expected =
      'function test():string {\n' +
      '  var a = () => 0;\n' +
      '  a();\n' +
      '  return assert.returnType(("str"), string);\n' +
      '}';

    testAssertions(code, expected);
  });
});
