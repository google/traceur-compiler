// Copyright 2012 Traceur Authors.
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

suite('PlaceholderParser.traceur.js', function() {

  // TODO(arv): Figure out how we can use import statmements here.

  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var parseExpression = traceur.codegeneration.parseExpression;
  var parseStatement = traceur.codegeneration.parseStatement;
  var write = traceur.outputgeneration.TreeWriter.write;

  test('ParseExpressionIdentifierExpression', function() {
    var id = new traceur.syntax.IdentifierToken(null, 'x');
    var tree = parseExpression `1 + ${id}`;
    assert.equal('1 + x\n', write(tree));
  });

  test('ParseExpressionNumber', function() {
    var tree = parseExpression `1 + ${42}`;
    assert.equal('1 + 42\n', write(tree));
  });

  test('ParseExpressionBoolean', function() {
    var tree = parseExpression `1 + ${true}`;
    assert.equal('1 + true\n', write(tree));
  });

  test('ParseExpressionString', function() {
    var s = 'Hello';
    var tree = parseExpression `1 + ${s}`;
    assert.equal('1 + "Hello"\n', write(tree));
  });

  test('ParseExpressionNull', function() {
    var tree = parseExpression `1 + ${null}`;
    assert.equal('1 + null\n', write(tree));
  });

  test('ParseExpressionUndefined', function() {
    var tree = parseExpression `1 + ${undefined}`;
    assert.equal('1 + (void 0)\n', write(tree));
  });

  test('ParseExpressionTree', function() {
    var xTree = parseExpression `x`;
    var tree = parseExpression `1 + ${xTree}`;
    assert.equal('1 + x\n', write(tree));
  });

  test('ParseExpressionFunction', function() {
    var tree = parseExpression `function() {}`;
    assert.equal('function() {}\n', write(tree));
  });

  test('ParseExpressionPropertyName', function() {
    var id = 'x';
    var tree = parseExpression `{${id}: ${id}}`;
    assert.equal('{x: "x"}\n', write(tree));
  });

  test('ParseExpressionPropertyNameIdentifier', function() {
    var id = new traceur.syntax.IdentifierToken(null, 'x');
    var tree = parseExpression `{${id}: ${id}}`;
    assert.equal('{x: x}\n', write(tree));
  });

  test('ParseExpressionMethodName', function() {
    var id = 'm';
    var tree = parseExpression `{${id}() {}}`;
    assert.equal('{m() {}}\n', write(tree));
  });

  test('ParseExpressionMemberExpression', function() {
    var id = 'm';
    var tree = parseExpression `obj.${id}`;
    assert.equal('obj.m\n', write(tree));
  });

  test('ParseStatementVarBinding', function() {
    var id = 'x';
    var tree = parseStatement `var ${id}`;
    assert.equal('var x;\n', write(tree));

    tree = parseStatement `var [${id}] = [42]`;
    assert.equal('var [x] = [42];\n', write(tree));
  });

  test('ParseStatementFunctionBinding', function() {
    var id = 'x';
    var tree = parseStatement `function ${id}(){}`;
    assert.equal('function x() {}\n', write(tree));
  });

  test('StatementLifting', function() {
    var returnTree = parseStatement `return 42`;
    var tree = parseStatement `${returnTree}`;
    assert.equal(ParseTreeType.RETURN_STATEMENT, tree.type);
    assert.equal('return 42;\n', write(tree));

    var blockTree = parseStatement `{}`;
    assert.equal(ParseTreeType.BLOCK, blockTree.type);
    tree = parseExpression `function() { ${blockTree} }`;
    assert.equal('function() {}\n', write(tree));
  });

});