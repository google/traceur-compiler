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

import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {CollectingErrorReporter as ErrorReporter} from '../../../src/util/CollectingErrorReporter.js';
import {validate as validateConst} from '../../../src/semantics/ConstChecker.js';
import {Options} from '../../../src/Options.js';

suite('ConstChecker.js', function() {

  function makeTest(name, code, expectedErrors, mode) {
    test(name, function() {
      var options = new Options();
      options.arrayComprehension = true;
      options.blockBinding = true;
      options.generatorComprehension = true;
      var reporter = new ErrorReporter();
      var parser =
          new Parser(new SourceFile('SOURCE', code), reporter, options);
      var tree = mode === 'script' ?
          parser.parseScript() : parser.parseModule();
      assert.deepEqual(reporter.errors, []);
      validateConst(tree, reporter);
      assert.deepEqual(reporter.errors, expectedErrors);
    });
  }

  makeTest('var', 'var x = 1; x += 1;', []);

  makeTest('const assignment', 'const x = 1; x &= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x |= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x ^= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x = 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x <<= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x -= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x %= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x += 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x >>= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x /= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x *= 1;',
      ['SOURCE:1:14: x is read-only']);
  makeTest('const assignment', 'const x = 1; x >>>= 1;',
      ['SOURCE:1:14: x is read-only']);

  makeTest('const prefix', 'const x = 1; ++x;', ['SOURCE:1:16: x is read-only']);
  makeTest('const prefix', 'const x = 1; --x;', ['SOURCE:1:16: x is read-only']);

  makeTest('const postfix', 'const x = 1; x++;', ['SOURCE:1:14: x is read-only']);
  makeTest('const postfix', 'const x = 1; x--;', ['SOURCE:1:14: x is read-only']);

  makeTest('function expression', '(function f() {\nf = 2;})',
      ['SOURCE:2:1: f is read-only']);

  makeTest('function declaration', 'function f() {\nf = 2;}', []);

  makeTest('import', 'import {x} from "abc";\nx = 1;',
      ['SOURCE:2:1: x is read-only']);
  makeTest('import', 'import {x, y} from "abc";\ny = 1;',
      ['SOURCE:2:1: y is read-only']);
  makeTest('import', 'import {x as z, y} from "abc";\nz = 1;',
      ['SOURCE:2:1: z is read-only']);
  makeTest('import default', 'import x from "abc";\nx = 1;',
      ['SOURCE:2:1: x is read-only']);

  makeTest('function params',
      'const x = 1;\n' +
      'function f(x) {\n' +
      '  x = 2;\n' +
      '}', []);
  makeTest('function params',
      'const x = 1;\n' +
      'function f({x}) {\n' +
      '  x = 2;\n' +
      '}', []);
  makeTest('function params',
      'const x = 1;\n' +
      'function f(y) {\n' +
      '  x = 2;\n' +
      '}', ['SOURCE:3:3: x is read-only']);
  makeTest('function params',
      'const x = 1;\n' +
      'function f(y = (x = 2)) {}',
      ['SOURCE:2:17: x is read-only']);

  makeTest('assign in initializer', 'const x = 1;\nvar y = (x = 2);',
      ['SOURCE:2:10: x is read-only']);

  makeTest('let',
      'const x = 1;\n' +
      '{\n' +
      '  let x;\n' +
      '  x = 2;\n' +
      '}', []);
  makeTest('let',
      'const x = 1;\n' +
      '{\n' +
      '  let y;\n' +
      '  x = 2;\n' +
      '}', ['SOURCE:4:3: x is read-only']);
  makeTest('let',
      'const x = 1;\n' +
      '{\n' +
      '  const x = 2;\n' +
      '}', []);
  makeTest('let',
      'let x;\n' +
      '{\n' +
      '  const x = 1;\n' +
      '}\n' +
      'x = 2;', []);

  makeTest('function expression and let',
      '(function f() { { let f = 1 } })', []);
  makeTest('function expression and let',
      '(function f() { { let f = 1 } f = 2; })',
      ['SOURCE:1:31: f is read-only']);

  makeTest('arrow', 'x => { x = 1 }', []);
  makeTest('arrow', '(x) => { x = 1 }', []);

  makeTest('class declaration',
      'const x = 1;\n' +
      '{\n'+
      '  class x {}\n' +
      '  x = 2;\n' +
      '}',
      []);
  makeTest('class declaration',
      'var m;\n' +
      'class C { m() { m = 2; } }',
      []);
  makeTest('class declaration',
      'class C {\n' +
      '  m() {\n' +
      '    C = 2;\n' +
      '  }\n' +
      '}',
      ['SOURCE:3:5: C is read-only']);

  makeTest('class expression',
      'const x = 1;\n' +
      '{\n'+
      '  (class x {})\n' +
      '  x = 2;\n' +
      '}',
      ['SOURCE:4:3: x is read-only']);
  makeTest('class expression',
      'var m;\n' +
      '(class C { m() { m = 2; } })',
      []);
  makeTest('class expression',
      '(class C {\n' +
      '  m() {\n' +
      '    C = 2;\n' +
      '  }\n' +
      '})',
      ['SOURCE:3:5: C is read-only']);

  makeTest('Duplicate declarations', 'let x; let x;',
      ['SOURCE:1:12: Duplicate declaration, x']);
  makeTest('Duplicate declarations', 'let x; const x = 1;',
      ['SOURCE:1:14: Duplicate declaration, x']);
  makeTest('Duplicate declarations', 'const x = 1; const x = 2;',
      ['SOURCE:1:20: Duplicate declaration, x']);
  makeTest('Duplicate declarations', 'const x = 1; let x;',
      ['SOURCE:1:18: Duplicate declaration, x']);

  makeTest('Duplicate declarations', 'var x; let x;',
      ['SOURCE:1:12: Duplicate declaration, x']);
  makeTest('Duplicate declarations', 'var x; var x;', []);
  makeTest('Duplicate declarations',
      'let x;\n' +
      '{\n' +
      '  var x;\n' +
      '}',
      ['SOURCE:3:7: Duplicate declaration, x']);

  makeTest('let bound function declaration',
      'const x = 1;\n' +
      '{\n' +
      '  function x() {}\n' +
      '}',
      []);

  makeTest('sloppy functions',
      'let x = 1;\n' +
      '{\n' +
      '  function x() {}\n' +
      '}',
      ['SOURCE:3:12: Duplicate declaration, x'],
      'script');
  makeTest('sloppy functions',
      '{\n' +
      '  let x = 1;\n' +
      '  function x() {}\n' +
      '}',
      ['SOURCE:3:12: Duplicate declaration, x'],
      'script');
  makeTest('sloppy functions',
      '{\n' +
      '  function x() {}\n' +
      '}\n' +
      'let x = 1;',
      ['SOURCE:4:5: Duplicate declaration, x'],
      'script');

  makeTest('catch var',
      'try {\n' +
      '} catch (ex) {\n' +
      '  let ex;\n' +
      '}',
      ['SOURCE:3:7: Duplicate declaration, ex']);
  makeTest('catch var',
      'try {\n' +
      '} catch (ex) {\n' +
      '}\n' +
      'let ex;',
      []);
  makeTest('catch var',
      'const ex = 1;\n' +
      'try {\n' +
      '} catch (ex) {\n' +
      '  ex = 2;\n' +
      '}',
      []);

  makeTest('for of loop',
      '{\n' +
      '  let x = 1;\n' +
      '  for (let x of iterable) {\n' +
      '    x;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for of loop',
      '{\n' +
      '  let x = 1;\n' +
      '  for (let x of iterable) {\n' +
      '    let x;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for of loop',
      '{\n' +
      '  const x = 1;\n' +
      '  for (const x of iterable) {\n' +
      '    const x = 2;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for of loop',
      '{\n' +
      '  for (const x of iterable) {\n' +
      '    x = 1;\n' +
      '  }\n' +
      '}',
      ['SOURCE:3:5: x is read-only']);

  makeTest('for in loop',
      '{\n' +
      '  let x = 1;\n' +
      '  for (let x in iterable) {\n' +
      '    x;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for in loop',
      '{\n' +
      '  let x = 1;\n' +
      '  for (let x in iterable) {\n' +
      '    let x;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for in loop',
      '{\n' +
      '  const x = 1;\n' +
      '  for (const x in iterable) {\n' +
      '    const x = 2;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for in loop',
      '{\n' +
      '  for (const x in iterable) {\n' +
      '    x = 1;\n' +
      '  }\n' +
      '}',
      ['SOURCE:3:5: x is read-only']);

  makeTest('for loop',
      '{\n' +
      '  let x = 1;\n' +
      '  for (let x = 2; ;) {\n' +
      '    x;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for loop',
      '{\n' +
      '  let x = 1;\n' +
      '  for (let x; ;) {\n' +
      '    let x;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for loop',
      '{\n' +
      '  const x = 1;\n' +
      '  for (const x = 2; ; ) {\n' +
      '    const x = 3;\n' +
      '  }\n' +
      '}',
      []);
  makeTest('for loop',
      '{\n' +
      '  for (const x = 1; ; ) {\n' +
      '    x = 2;\n' +
      '  }\n' +
      '}',
      ['SOURCE:3:5: x is read-only']);
  makeTest('for loop', 'for (;;) {}', []);

  makeTest('Array comprehension',
      'let x;\n' +
      '[for (x of []) x]',
      []);
  makeTest('Array comprehension',
      'let x;\n' +
      '[for (x of []) for (x of []) x]',
      []);
  makeTest('Array comprehension',
      'const x = 1;\n' +
      '[for (x of []) x]',
      []);
  makeTest('Array comprehension',
      'const x = 1;\n' +
      '[for (y of (x = [])) x]',
      ['SOURCE:2:13: x is read-only']);
  makeTest('Array comprehension',
      'const x = 1;\n' +
      '[for (y of []) x = 2]',
      ['SOURCE:2:16: x is read-only']);

  makeTest('Generator comprehension',
      'let x;\n' +
      '(for (x of []) x)',
      []);
  makeTest('Generator comprehension',
      'let x;\n' +
      '(for (x of []) for (x of []) x)',
      []);
  makeTest('Generator comprehension',
      'const x = 1;\n' +
      '(for (x of []) x)',
      []);
  makeTest('Generator comprehension',
      'const x = 1;\n' +
      '(for (y of (x = [])) x)',
      ['SOURCE:2:13: x is read-only']);
  makeTest('Generator comprehension',
      'const x = 1;\n' +
      '(for (y of []) x = 2)',
      ['SOURCE:2:16: x is read-only']);

  makeTest('with',
      'with ({}) {\n' +
      '  let x;\n' +
      '  let x;\n' +
      '}',
      ['SOURCE:3:7: Duplicate declaration, x'],
      'script');
    makeTest('with',
      'const x = 1;\n' +
      'with ({}) {\n' +
      '  x = 2;\n' +
      '}',
      [],
      'script');
});
