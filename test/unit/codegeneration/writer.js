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

suite('writer.js', function() {

  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var IdentifierToken = get('src/syntax/IdentifierToken').IdentifierToken;
  var LiteralToken = get('src/syntax/LiteralToken').LiteralToken;
  var TokenType = get('src/syntax/TokenType');
  var Token = get('src/syntax/Token').Token;

  var write = get('src/outputgeneration/TreeWriter').write;
  var trees = get('src/syntax/trees/ParseTrees');

  test('WriteStatement', function() {
    var tree = new trees.Script(
      'loc',
      [new trees.VariableStatement(
        'loc',
        new trees.VariableDeclarationList(
          'loc',
          'var',
          [new trees.VariableDeclaration(
            'loc',
            new trees.IdentifierExpression('loc', new IdentifierToken('loc', 'x')),
            null,
            new trees.LiteralExpression('loc', new LiteralToken(TokenType.NUMBER, '1', 'loc')))]
        )
      ),
      new trees.IfStatement(
        'loc',
        new trees.BinaryOperator(
          'loc',
          new trees.IdentifierExpression('loc', new IdentifierToken('loc', 'x')),
          new Token(TokenType.CLOSE_ANGLE, 'loc'),
          new trees.LiteralExpression('loc', new LiteralToken(TokenType.NUMBER, '0', 'loc'))
        ),
        new trees.Block(
          'loc',
          [new trees.PostfixExpression(
            'loc',
            new trees.IdentifierExpression('loc', new IdentifierToken('loc', 'x')),
            new Token(TokenType.PLUS_PLUS, 'loc')
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
