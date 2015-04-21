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

import {IdentifierToken} from '../../../src/syntax/IdentifierToken.js';
import {LiteralToken} from '../../../src/syntax/LiteralToken.js';
import * as TokenType from '../../../src/syntax/TokenType.js';
import {Token} from '../../../src/syntax/Token.js';

import {write} from '../../../src/outputgeneration/TreeWriter.js';
import * as trees from '../../../src/syntax/trees/ParseTrees.js';


suite('writer.js', function() {

  test('WriteStatement', function() {
    var tree = new trees.Script(
      null,
      [new trees.VariableStatement(
        null,
        new trees.VariableDeclarationList(
          null,
          'var',
          [new trees.VariableDeclaration(
            null,
            new trees.IdentifierExpression(null, new IdentifierToken(null, 'x')),
            null,
            new trees.LiteralExpression(null, new LiteralToken(TokenType.NUMBER, '1', null)))]
        )
      ),
      new trees.IfStatement(
        null,
        new trees.BinaryExpression(
          null,
          new trees.IdentifierExpression(null, new IdentifierToken(null, 'x')),
          new Token(TokenType.CLOSE_ANGLE, null),
          new trees.LiteralExpression(null, new LiteralToken(TokenType.NUMBER, '0', null))
        ),
        new trees.Block(
          null,
          [new trees.PostfixExpression(
            null,
            new trees.IdentifierExpression(null, new IdentifierToken(null, 'x')),
            new Token(TokenType.PLUS_PLUS, null)
          )]
        ),
        null
      )
    ]);
    var actual = write(tree);

    var expected = 'var x = 1;\nif (x > 0) {\n  x++\n}\n';
    assert.equal(expected, actual);
  });

  var errorReporter = {
    reportError: function(position, message) {
      throw new chai.AssertionError({message: message + ', ' + position});
    }
  };

  function parse(name, source) {
    var sourceFile = new traceur.syntax.SourceFile(name, source);
    var parser = new traceur.syntax.Parser(sourceFile, errorReporter);
    return parser.parseScript();
  }

  function parseAndWrite(name, source) {
    var tree = parse(name, source);
    return write(tree);
  }

  test('ParseAndWriteKeywords', function() {
    var result = parseAndWrite('test', 'x.case = 5;\n');
    assert.equal('x.case = 5;\n', result);
    var result = parseAndWrite('test', 'var obj = {var: 42};\n');
    assert.equal('var obj = {var: 42};\n', result);
  });

  test('pretty print', function() {
    var tree = parse('test', 'function f() { return 42; }');
    var result = write(tree);
    assert.equal(result, 'function f() {\n  return 42;\n}\n');

    result = write(tree, {prettyPrint: false});
    assert.equal(result, 'function f(){\nreturn 42;\n}\n');

    tree = parse('test', 'aaa.bbb');
    result = write(tree, {prettyPrint: false});
    assert.equal(result, 'aaa.bbb;\n');

    tree = tree.scriptItemList[0].expression;
    result = write(tree, {prettyPrint: false});
    assert.equal(result, 'aaa.bbb');
  });

});
