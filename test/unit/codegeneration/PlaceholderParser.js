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

import {suite, test, assert} from '../../unit/unitTestRunner.js';

  import * as ParseTreeType from '../../../src/syntax/trees/ParseTreeType.js';
  import {
    parseExpression,
    parseModule,
    parseScript,
    parseStatement,
    parseStatements
  } from '../../../src/codegeneration/PlaceholderParser.js';
  import {write} from '../../../src/outputgeneration/TreeWriter.js';
  import {IdentifierToken} from '../../../src/syntax/IdentifierToken.js';

suite('PlaceholderParser', function() {

  test('ParseExpressionIdentifierExpression', function() {
    var id = new IdentifierToken(null, 'x');
    var tree = parseExpression `1 + ${id}`;
    assert.equal('1 + x', write(tree));
  });

  test('ParseExpressionNumber', function() {
    var tree = parseExpression `1 + ${42}`;
    assert.equal('1 + 42', write(tree));
  });

  test('ParseExpressionBoolean', function() {
    var tree = parseExpression `1 + ${true}`;
    assert.equal('1 + true', write(tree));
  });

  test('ParseExpressionString', function() {
    var s = 'Hello';
    var tree = parseExpression `1 + ${s}`;
    assert.equal('1 + "Hello"', write(tree));
  });

  test('ParseExpressionNull', function() {
    var tree = parseExpression `1 + ${null}`;
    assert.equal('1 + null', write(tree));
  });

  test('ParseExpressionUndefined', function() {
    var tree = parseExpression `1 + ${undefined}`;
    assert.equal('1 + (void 0)', write(tree));
  });

  test('ParseExpressionTree', function() {
    var xTree = parseExpression `x`;
    var tree = parseExpression `1 + ${xTree}`;
    assert.equal('1 + x', write(tree));
  });

  test('ParseExpressionFunction', function() {
    var tree = parseExpression `function() {}`;
    assert.equal('function() {}', write(tree));
  });

  test('ParseExpressionPropertyName', function() {
    var id = 'x';
    var tree = parseExpression `{${id}: ${id}}`;
    assert.equal('{x: "x"}', write(tree));
  });

  test('ParseExpressionPropertyNameIdentifier', function() {
    var id = new IdentifierToken(null, 'x');
    var tree = parseExpression `{${id}: ${id}}`;
    assert.equal('{x: x}', write(tree));
  });

  test('ParseExpressionMethodName', function() {
    var id = 'm';
    var tree = parseExpression `{${id}() {}}`;
    assert.equal('{m() {}}', write(tree));
  });

  test('ParseExpressionMemberExpression', function() {
    var id = 'm';
    var tree = parseExpression `obj.${id}`;
    assert.equal('obj.m', write(tree));
  });

  test('ParseStatementVarBinding', function() {
    var id = 'x';
    var tree = parseStatement `var ${id}`;
    assert.equal('var x;', write(tree));

    tree = parseStatement `var [${id}] = [42]`;
    assert.equal('var [x] = [42];', write(tree));
  });

  test('ParseStatementFunctionBinding', function() {
    var id = 'x';
    var tree = parseStatement `function ${id}(){}`;
    assert.equal('function x() {}', write(tree));
  });

  test('StatementLifting', function() {
    var returnTree = parseStatement `return 42`;
    var tree = parseStatement `${returnTree}`;
    assert.equal(ParseTreeType.RETURN_STATEMENT, tree.type);
    assert.equal('return 42;', write(tree));

    var blockTree = parseStatement `{}`;
    assert.equal(ParseTreeType.BLOCK, blockTree.type);
    tree = parseExpression `function() { ${blockTree} }`;
    assert.equal('function() {}', write(tree));
  });

  test('ParseModuleExportDeclaration', function() {
    var className = 'Foo';
    var tree = parseModule `export default class ${className} {}`;
    assert.equal('export default class Foo {}\n', write(tree));
  });

  test('ParseModuleExportDeclarationUsingParseStatement', function() {
    var className = 'Foo';
    var tree = parseStatement `export default class ${className} {}`;
    assert.equal('export default class Foo {}', write(tree));
  });

  test('ParseModuleExportDeclarationUsingParseStatements', function() {
    var className = 'Foo';
    var trees = parseStatements `export default class ${className} {}`;
    assert.equal('export default class Foo {}', write(trees[0]));
  });

  test('ParseScriptFunctionDeclarations', function() {
    var f1 = 'f1';
    var f2 = 'f2';
    var tree = parseScript `function ${f1}() { } function ${f2}() { }`;
    assert.equal('function f1() {}\nfunction f2() {}\n', write(tree));
  });

  test('ParseModuleImportDeclaration', function() {
    var className = 'Foo';
    var tree = parseStatement `import {${className}} from 'name'`;
    assert.equal('import {Foo} from \'name\';', write(tree));
  });

  test('ParseModuleImportDeclaration', function() {
    var className = 'Foo';
    var tree = parseStatement `import {Bar as ${className}} from 'name'`;
    assert.equal('import {Bar as Foo} from \'name\';', write(tree));
  });

  test('ParseModuleImportDeclaration', function() {
    var className = 'Foo';
    var tree = parseStatement `import ${className} from 'name'`;
    assert.equal('import Foo from \'name\';', write(tree));
  });

  test('Type', function() {
    var a = 'a';
    var tree = parseStatement `var x: ${a};`;
    assert.equal('var x: a;', write(tree));
  });

  test('TypeName', function() {
    var b = 'b';
    var tree = parseStatement `var x: a.${b};`;
    assert.equal('var x: a.b;', write(tree));
  });

  test('Type null', function() {
    var tree = parseStatement `var x: ${null} = 1;`;
    assert.equal('var x = 1;', write(tree));
  });

  test('TypeName 2', function() {
    var a = 'a';
    var tree = parseStatement `var x: ${a}.b;`;
    assert.equal('var x: a.b;', write(tree));
  });

  test('TypeParams', function() {
    var a = 'a';
    var b = 'b';
    var tree = parseStatement `var x: ${a}<${b}>;`;
    assert.equal('var x: a<b>;', write(tree));

    var type = tree.declarations.declarations[0].typeAnnotation;
    tree = parseStatement `var x: ${type};`;
    assert.equal('var x: a<b>;', write(tree));
  });

  test('Exponentiation', function() {
    var tree = parseExpression `x ** ${42}`;
    assert.equal('x ** 42', write(tree));
  });

});
