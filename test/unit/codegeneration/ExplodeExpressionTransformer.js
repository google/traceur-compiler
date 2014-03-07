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

suite('ExplodeExpressionTransformer.js', function() {

  var ExplodeExpressionTransformer = $traceurRuntime.ModuleStore.
      getForTesting('src/codegeneration/ExplodeExpressionTransformer').
          ExplodeExpressionTransformer;
  var Parser = $traceurRuntime.ModuleStore.
      getForTesting('src/syntax/Parser').Parser;
  var SourceFile = $traceurRuntime.ModuleStore.
      getForTesting('src/syntax/SourceFile').SourceFile;
  var id = $traceurRuntime.ModuleStore.
      getForTesting('src/codegeneration/ParseTreeFactory').
          createIdentifierExpression;
  var write = $traceurRuntime.ModuleStore.
      getForTesting('src/outputgeneration/TreeWriter').write;

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
    parser.allowYield_ = true;
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

  testExplode('CommaExpression', '1, 2', '1, 2');
  testExplode('CommaExpression', 'a.b, c.d', '$0 = a.b, $1 = c.d, $1');

  testExplode('ArrayLiteralExpression', '[1, 2]', '[1, 2]');
  testExplode('ArrayLiteralExpression', '[a.b, c.d]',
      '$0 = a.b, $1 = c.d, $2 = [$0, $1], $2');
  testExplode('ArrayLiteralExpression', '[...x]', '[...x]');
  testExplode('ArrayLiteralExpression', '[...a.b]',
      '$0 = a.b, $1 = [...$0], $1');
  testExplode('ArrayLiteralExpression', '[...a.b.c]',
      '$0 = a.b, $1 = $0.c, $2 = [...$1], $2');
  testExplode('ArrayLiteralExpression', '[a.b, ...c.d, e.f]',
      '$0 = a.b, $1 = c.d, $2 = e.f, $3 = [$0, ...$1, $2], $3');
  testExplode('ArrayLiteralExpression', '[a.b, ...x]',
      '$0 = a.b, $1 = [$0, ...x], $1');

  testExplode('ObjectLiteralExpression', '{a: 1, b: 2}',
      '{\n  a: 1,\n  b: 2\n}');
  testExplode('ObjectLiteralExpression', '{a: b.c, d: e.f}',
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
});
