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

import {CONST, LET, VAR} from '../../../src/syntax/TokenType.js';
import {Compiler} from '../../../src/Compiler.js';
import {ParseTreeVisitor} from '../../../src/syntax/ParseTreeVisitor.js';
import {suite, test, assert} from '../../unit/unitTestRunner.js';

suite('TempVarTransformerUseLet.js', function() {

  class CheckDeclarations extends ParseTreeVisitor {
    constructor(declarationType) {
      super();
      this.declarationType = declarationType;
    }
    visitVariableDeclarationList(tree) {
      if (this.declarationType === LET) {
        assert(tree.declarationType === LET || tree.declarationType === CONST,
            `Expecte let or const but found ${tree.declarationType}`);
      } else {
        assert.equal(tree.declarationType, this.declarationType);
      }
      super.visitVariableDeclarationList(tree);
    }

  }

  function testResult(declarationType, content, expectedResult) {
    test('', function() {
      let compiler = new Compiler({
        exponentiation: true,
        blockBinding: declarationType === VAR || 'parse',
        script: true,
        sourceMaps: false
      });
      let tree = compiler.parse(content);
      let transformed = compiler.transform(tree);
      let visitor = new CheckDeclarations(declarationType);
      visitor.visitAny(transformed);
    });
  }

  testResult(VAR, '({a, b} = {})');
  testResult(LET, '({a, b} = {})');

  testResult(VAR, 'const [x, y] = []');
  testResult(LET, 'const [x, y] = []');

  testResult(VAR, '() => this');
  testResult(LET, '() => this');

  testResult(VAR, 'function f() { () => arguments; }');
  testResult(LET, 'function f() { () => arguments; }');

  testResult(VAR, 'let x = 2; x **= 3;');
  testResult(LET, 'let x = 2; x **= 3;');

  // TODO(arv): ForOfTransformer does not do the right thing here.
  // testResult(VAR, 'for (let x of []) {}');
  // testResult(LET, 'for (let x of []) {}');

  testResult(VAR, 'obj.m(1, ...[2, 3])');
  testResult(LET, 'obj.m(1, ...[2, 3])');
});
