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
import {validate as validateFreeVars} from '../../../src/semantics/FreeVariableChecker.js';
import {Options} from '../../../src/Options.js';

suite('FreeVariableChecker.js', function() {

  function makeTest(name, code, expectedErrors, global, mode) {
    test(name, function() {
      var options = new Options();
      options.arrayComprehension = true;
      options.blockBinding = true;
      options.generatorComprehension = true;
      var reporter = new ErrorReporter();
      var parser = new Parser(new SourceFile('CODE', code), reporter, options);
      var tree = mode === 'module' ?
          parser.parseModule() : parser.parseScript();
      assert.deepEqual(reporter.errors, []);
      // Make sure we use a global that has not been polluted.
      validateFreeVars(tree, reporter, global || Object.create(null));
      assert.deepEqual(reporter.errors, expectedErrors);
    });
  }

  makeTest('basic', 'x', ['CODE:1:1: x is not defined']);
  makeTest('basic binop', 'x + 1', ['CODE:1:1: x is not defined']);
  makeTest('basic assign', 'x = 1', ['CODE:1:1: x is not defined']);
  makeTest('basic member', 'x.y', ['CODE:1:1: x is not defined']);
  makeTest('basic lookup', 'x[0]', ['CODE:1:1: x is not defined']);
  makeTest('basic unary', '++x', ['CODE:1:3: x is not defined']);
  makeTest('basic postfix', 'x++', ['CODE:1:1: x is not defined']);
  makeTest('basic call', 'x(1, 2)', ['CODE:1:1: x is not defined']);
  makeTest('basic new ', 'new x(1, 2)', ['CODE:1:5: x is not defined']);

  makeTest('var', 'var y = x', ['CODE:1:9: x is not defined']);
  makeTest('let', 'let y = x', ['CODE:1:9: x is not defined']);
  makeTest('const', 'const y = x', ['CODE:1:11: x is not defined']);

  makeTest('globals', 'x', [], {x: 1});

  makeTest('call args', 'f(x, 2);', ['CODE:1:3: x is not defined'], {f: 1});
  makeTest('new args', 'new f(x, 2);', ['CODE:1:7: x is not defined'], {f: 1});

  makeTest('nested function', 'function f() { x }',
      ['CODE:1:16: x is not defined']);
  makeTest('nested function', 'function f() { f }', []);
  makeTest('nested function expression', '(function f() { x })',
      ['CODE:1:17: x is not defined']);
  makeTest('nested function expression', '(function f() { f })', []);

  makeTest('nested class', 'class f { m() { x } }',
      ['CODE:1:17: x is not defined']);
  makeTest('nested class', 'class f { m() { f } }', []);
  makeTest('nested class', 'class f { m() { m } }',
      ['CODE:1:17: m is not defined']);
  makeTest('nested class expression', '(class f { m() { x } })',
      ['CODE:1:18: x is not defined']);
  makeTest('nested class expression', '(class f { m() { f } })', []);
  makeTest('nested class expression', '(class f { m() { m } })',
      ['CODE:1:18: m is not defined']);

  makeTest('arrow function', '() => x', ['CODE:1:7: x is not defined']);
  makeTest('arrow function', 'x => x', []);
  makeTest('arrow function', 'function f() { f }', []);
  makeTest('arrow function', '() => arguments',
      ['CODE:1:7: arguments is not defined']);
  makeTest('arrow function', '() => { arguments }',
      ['CODE:1:9: arguments is not defined']);
  makeTest('arrow function', '() => 1; function f() { arguments }', []);
  makeTest('arrow function', '(x = function() { arguments }) => 42', []);

  makeTest('if', 'if (true) { x; }', ['CODE:1:13: x is not defined']);
  makeTest('if', 'if (true) {} else { x; }', ['CODE:1:21: x is not defined']);

  makeTest('block let', '{ let x = 5; } x', ['CODE:1:16: x is not defined']);
  makeTest('block const', '{ const x = 5; } x',
      ['CODE:1:18: x is not defined']);
  makeTest('block let', '{ var x = 5; } x', []);
  makeTest('block function', '{ function f() {} } f', []);
  makeTest('block function', '"use strict"; { function f() {} } f',
      ['CODE:1:35: f is not defined']);

  makeTest('module', 'import {x} from "x"; x', [], undefined, 'module');
  makeTest('module', 'import x from "x"; x', [], undefined, 'module');
  makeTest('module', 'import * as x from "x"; x', [], undefined, 'module');
  makeTest('module', 'import {y as x} from "x"; x', [], undefined, 'module');
  makeTest('module', 'import {x as y} from "x"; x',
      ['CODE:1:27: x is not defined'], undefined, 'module');

  makeTest('module magic name', '__moduleName', [], undefined, 'module');

  makeTest('array comprehension', '[for (x of []) x]', []);
  makeTest('array comprehension', '[for (y of []) x]',
      ['CODE:1:16: x is not defined']);

  makeTest('generator comprehension', '(for (x of []) x)', []);
  makeTest('generator comprehension', '(for (y of []) x)',
      ['CODE:1:16: x is not defined']);

  makeTest('spread', 'var x = [1, 2]; var y = [0, ...x, 3]', []);

  makeTest('getter',
      '({\n' +
      '  get p() { return x; }\n' +
      '})',
      ['CODE:2:20: x is not defined']);
  makeTest('getter',
      '({\n' +
      '  get x() { return x; }\n' +
      '})',
      ['CODE:2:20: x is not defined']);

  makeTest('setter',
      '({\n' +
      '  set p(_) { x; }\n' +
      '})',
      ['CODE:2:14: x is not defined']);
  makeTest('setter',
      '({\n' +
      '  set x(_) { x; }\n' +
      '})',
      ['CODE:2:14: x is not defined']);
});
