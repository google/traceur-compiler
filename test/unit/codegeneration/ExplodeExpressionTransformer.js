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

import {ExplodeExpressionTransformer} from '../../../src/codegeneration/ExplodeExpressionTransformer.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {createIdentifierExpression as id} from '../../../src/codegeneration/ParseTreeFactory.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('ExplodeExpressionTransformer.js', function() {

  var counter = 0;
  var transformer;

  function stubAddTempVar() {
    var s = '$' + counter++;
    return id(s);
  }

  setup(function() {
    counter = 0;
    transformer = new ExplodeExpressionTransformer(null);
    transformer.addTempVar = stubAddTempVar;
  });

  function parseExpression(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file);
    return parser.parseExpression();
  }

  function testExplode(name, content, expected) {
    test(name, function() {
      var tree = parseExpression(content);
      var transformed = transformer.transformAny(tree);
      assert.equal(expected, write(transformed));
    });
  }

  testExplode('Literal', 'true', 'true');
  testExplode('Literal', 'null', 'null');
  testExplode('Literal', '42', '42');
  testExplode('Literal', '/reg/', '/reg/');
  testExplode('Ident', 'x', 'x');
  testExplode('MemberExpression', 'a.b', '$0 = a.b, $0');
  testExplode('MemberExpression', 'a.b.c', '$0 = a.b, $1 = $0.c, $1');

  testExplode('MemberLookupExpression', 'a[0]', '$0 = a[0], $0');
  testExplode('MemberLookupExpression', 'a[0][1]', '$0 = a[0], $1 = $0[1], $1');
  testExplode('MemberLookupExpression + MemberExpression',
      'a.b[c.d]', '$0 = a.b, $1 = c.d, $2 = $0[$1], $2');

  testExplode('ParenExpression', '(1)', '(1)');
  testExplode('ParenExpression', '(a.b)', '$0 = a.b, $0');
  testExplode('ParenExpression', '(a.b + c.d).e',
      '$0 = a.b, $1 = c.d, $2 = $0 + $1, $3 = $2.e, $3');

  testExplode('BinaryExpression', '1 + 2', '1 + 2');
  testExplode('BinaryExpression', '(1 + 2) * 3', '(1 + 2) * 3');
  testExplode('BinaryExpression', '1 + a.b', '$0 = a.b, 1 + $0');
  testExplode('BinaryExpression', 'a.b + b.c * d.e',
      '$0 = a.b, $1 = b.c, $2 = d.e, $0 + $1 * $2');

  testExplode('UnaryExpression', 'typeof 1', 'typeof 1');
  testExplode('UnaryExpression', 'typeof a.b', '$0 = a.b, typeof $0');
  testExplode('UnaryExpression', '!~a.b', '$0 = a.b, !~$0');

  testExplode('UnaryPlusPlus', '++x', '$0 = x + 1, x = $0, $0');
  testExplode('UnaryPlusPlus', '++a.b', '$0 = a.b, $1 = $0 + 1, a.b = $1, $1');
  testExplode('UnaryPlusPlus', '++a.b.c',
      '$0 = a.b, $1 = $0.c, $2 = $1 + 1, $0.c = $2, $2');

  testExplode('UnaryMinusMinus', '--x', '$0 = x - 1, x = $0, $0');
  testExplode('UnaryMinusMinus', '--a.b',
      '$0 = a.b, $1 = $0 - 1, a.b = $1, $1');

  testExplode('PostFixExpression', 'x++', '$0 = x, x = $0 + 1, $0');
  testExplode('PostFixExpression', 'x--', '$0 = x, x = $0 - 1, $0');

  testExplode('PostfixMemberExpression', 'a.b++', '$0 = a.b, a.b = $0 + 1, $0');
  testExplode('PostfixMemberExpression', 'a.b.c--',
      '$0 = a.b, $1 = $0.c, $0.c = $1 - 1, $1');

  testExplode('PostfixMemberLookupExpression', 'a.b[c.d]++',
      '$1 = a.b, $0 = c.d, $2 = $1[$0], $1[$0] = $2 + 1, $2');
  testExplode('PostfixMemberLookupExpression', 'a.b[c.d]--',
      '$1 = a.b, $0 = c.d, $2 = $1[$0], $1[$0] = $2 - 1, $2');

  testExplode('YieldExpression', 'yield 1', '$0 = yield 1, $0');
  testExplode('YieldExpression', 'yield a.b', '$0 = a.b, $1 = yield $0, $1');
  testExplode('YieldExpression', 'yield (yield a.b)',
      '$0 = a.b, $1 = yield $0, $2 = yield $1, $2');

  testExplode('YieldExpression', 'yield', '$0 = yield, $0');
  testExplode('YieldExpression', '(yield, yield)', '$0 = yield, $1 = yield, $1');
  testExplode('YieldExpression', '[yield, yield]',
      '$0 = yield, $1 = yield, $2 = [$0, $1], $2');
  testExplode('YieldExpression', 'fun(yield, yield)',
      '$0 = yield, $1 = yield, $2 = fun($0, $1), $2');
  testExplode('YieldExpression', '{x: yield}', '$0 = yield, $1 = {x: $0}, $1');
  testExplode('YieldExpression', '{x: yield, y: yield}',
      '$0 = yield, $1 = yield, $2 = {\n  x: $0,\n  y: $1\n}, $2');
  testExplode('YieldExpression', 'true ? yield : yield',
      'true ? ($0 = yield, $2 = $0) : ($1 = yield, $2 = $1), $2');

  testExplode('CommaExpression', '1, 2', '1, 2');
  testExplode('CommaExpression', 'a.b, c.d', '$0 = a.b, $1 = c.d, $1');

  testExplode('ArrayLiteral', '[1, 2]', '[1, 2]');
  testExplode('ArrayLiteral', '[a.b, c.d]',
      '$0 = a.b, $1 = c.d, $2 = [$0, $1], $2');
  testExplode('ArrayLiteral', '[...x]', '[...x]');
  testExplode('ArrayLiteral', '[...a.b]',
      '$0 = a.b, $1 = [...$0], $1');
  testExplode('ArrayLiteral', '[...a.b.c]',
      '$0 = a.b, $1 = $0.c, $2 = [...$1], $2');
  testExplode('ArrayLiteral', '[a.b, ...c.d, e.f]',
      '$0 = a.b, $1 = c.d, $2 = e.f, $3 = [$0, ...$1, $2], $3');
  testExplode('ArrayLiteral', '[a.b, ...x]',
      '$0 = a.b, $1 = [$0, ...x], $1');

  testExplode('ObjectLiteral', '{a: 1, b: 2}',
      '{\n  a: 1,\n  b: 2\n}');
  testExplode('ObjectLiteral', '{a: b.c, d: e.f}',
      '$0 = b.c, $1 = e.f, $2 = {\n  a: $0,\n  d: $1\n}, $2');

  testExplode('TemplateLiteralExpression', '`a${1}b${2}c`', '`a${1}b${2}c`');
  testExplode('TemplateLiteralExpression', '`a${b.c}d${e.f}g`',
      '$0 = b.c, $1 = e.f, $2 = `a${$0}d${$1}g`, $2');

  testExplode('TemplateLiteralExpression', 'f `a${1}b`', '$0 = f `a${1}b`, $0');
  testExplode('TemplateLiteralExpression', 'a.b `c${d.e}f`',
       '$0 = a.b, $1 = d.e, $2 = $0 `c${$1}f`, $2');

  testExplode('CallExpression', 'f(1, 2)', '$0 = f(1, 2), $0');
  testExplode('CallExpression', 'f(a.b, c.d)',
      '$0 = a.b, $1 = c.d, $2 = f($0, $1), $2');
  testExplode('CallExpression', 'f(...x)', '$0 = f(...x), $0');
  testExplode('CallExpression', 'f(...a.b)', '$0 = a.b, $1 = f(...$0), $1');

  testExplode('CallMemberExpression', 'f.g(a.b, c.d)',
      '$0 = f.g, $1 = a.b, $2 = c.d, $3 = $0.call(f, $1, $2), $3');
  testExplode('CallMemberExpression', 'f.g.h(a.b)',
      '$0 = f.g, $1 = $0.h, $2 = a.b, $3 = $1.call($0, $2), $3');
  testExplode('CallMemberExpression', 'f.g.h()',
      '$0 = f.g, $1 = $0.h, $2 = $1.call($0), $2');
  testExplode('CallMemberExpression', 'f.g(...a.b)',
      '$0 = f.g, $1 = a.b, $2 = $0.call(f, ...$1), $2');

  testExplode('CallMemberLookupExpression', 'a.b[c.d](a.b, c.d)',
      '$0 = a.b, $1 = c.d, $2 = $0[$1], $3 = a.b, $4 = c.d, ' +
      '$5 = $2.call($0, $3, $4), $5');
  testExplode('CallMemberLookupExpression', 'a[b.c]()',
      '$0 = b.c, $1 = a[$0], $2 = $1.call(a), $2');

  testExplode('NewExpression', 'new f(1, 2)', '$0 = new f(1, 2), $0');
  testExplode('NewExpression', 'new f(a.b, c.d)',
      '$0 = a.b, $1 = c.d, $2 = new f($0, $1), $2');
  testExplode('NewExpression', 'new f.g(a.b, c.d)',
      '$0 = f.g, $1 = a.b, $2 = c.d, $3 = new $0($1, $2), $3');
  testExplode('NewExpression', 'new f.g().m)',
      '$0 = f.g, $1 = new $0(), $2 = $1.m, $2');

  testExplode('ConditionalExpression', 'a ? b : c', 'a ? b : c');
  testExplode('ConditionalExpression', 'a.b ? c : d',
      '$0 = a.b, $0 ? ($1 = c) : ($1 = d), $1');
  testExplode('ConditionalExpression', 'a ? b.c : d',
      'a ? ($0 = b.c, $1 = $0) : ($1 = d), $1');
  testExplode('ConditionalExpression', 'a ? b : c.d',
      'a ? ($1 = b) : ($0 = c.d, $1 = $0), $1');
  testExplode('ConditionalExpression', 'a ? b.c : d.e',
      'a ? ($0 = b.c, $2 = $0) : ($1 = d.e, $2 = $1), $2');

  testExplode('Or expression', '1 || 2', '1 || 2');
  testExplode('Or expression', 'a.b || 2',
      '$0 = a.b, $0 ? ($1 = $0) : ($1 = 2), $1');
  testExplode('Or expression', '1 || a.b',
      '1 ? ($1 = 1) : ($0 = a.b, $1 = $0), $1');
  testExplode('Or expression', 'a.b || c.d',
      '$0 = a.b, $0 ? ($2 = $0) : ($1 = c.d, $2 = $1), $2');

  testExplode('And expression', '1 && 2', '1 && 2');
  testExplode('Or expression', 'a.b && 2',
      '$0 = a.b, $0 ? ($1 = 2) : ($1 = $0), $1');
  testExplode('Or expression', '1 && a.b',
      '1 ? ($0 = a.b, $1 = $0) : ($1 = 1), $1');
  testExplode('Or expression', 'a.b && c.d',
      '$0 = a.b, $0 ? ($1 = c.d, $2 = $1) : ($2 = $0), $2');

  testExplode('Assign', 'a = b', 'a = b, b');
  testExplode('Assign', 'a = b.c', '$0 = b.c, a = $0, $0');

  testExplode('AssignMemberExpression', 'a.b = 0', 'a.b = 0, 0');
  testExplode('AssignMemberExpression', 'a.b.c = 0', '$0 = a.b, $0.c = 0, 0');
  testExplode('AssignMemberExpression', 'a.b.c = d.e',
      '$0 = a.b, $1 = d.e, $0.c = $1, $1');

  testExplode('AssignMemberExpression', 'a.b += 6',
      '$0 = a.b, $1 = $0 + 6, a.b = $1, $1');
  testExplode('AssignMemberExpression', 'a.b.c += d.e',
      '$0 = a.b, $1 = d.e, $2 = $0.c, $3 = $2 + $1, $0.c = $3, $3');

  testExplode('AssignMemberLookupExpression', 'a[b] = 0', 'a[b] = 0, 0');
  testExplode('AssignMemberLookupExpression', 'a.b[c] = 0',
      '$0 = a.b, $0[c] = 0, 0');
  testExplode('AssignMemberLookupExpression', 'a.b[c.d] = 0',
      '$0 = a.b, $1 = c.d, $0[$1] = 0, 0');
  testExplode('AssignMemberLookupExpression', 'a.b[c.d] = e.f',
      '$0 = a.b, $1 = c.d, $2 = e.f, $0[$1] = $2, $2');

  testExplode('AssignMemberLookupExpression', 'a[b] += 6',
      '$0 = a[b], $1 = $0 + 6, a[b] = $1, $1');
  testExplode('AssignMemberLookupExpression', 'a.b[c.d] += e.f',
      '$0 = a.b, $1 = c.d, $2 = e.f, $3 = $0[$1], ' +
      '$4 = $3 + $2, $0[$1] = $4, $4');

  testExplode('AwaitExpression', 'await 1', '$0 = await 1, $0');
  testExplode('AwaitExpression', 'await a.b', '$0 = a.b, $1 = await $0, $1');
  testExplode('AwaitExpression', 'await (await a.b)',
      '$0 = a.b, $1 = await $0, $2 = await $1, $2');

  testExplode('FunctionExpression', 'a.b = function() { c.d }',
      '$0 = function() {\n  c.d;\n}, a.b = $0, $0');
  testExplode('Arrow', 'a.b = () => { c.d }',
      '$0 = () => {\n  c.d;\n}, a.b = $0, $0');
  testExplode('Arrow', 'a.b = () => c.d', '$0 = () => c.d, a.b = $0, $0');
  testExplode('ClassExpression', 'a.b = class { m() { c.d } }',
      '$0 = class {\n  m() {\n    c.d;\n  }\n}, a.b = $0, $0');
  testExplode('ClassExpression', 'a.b = class extends c.d { m() { e.f } }',
      '$0 = c.d, $1 = class extends $0 {\n  m() {\n    e.f;\n  }\n}, ' +
      'a.b = $1, $1');
});
