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

import {
  suite,
  test,
  assert,
  setup,
  teardown
} from '../../unit/unitTestRunner.js';

import HoistVariablesTransformer from '../../../src/codegeneration/HoistVariablesTransformer.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {Options} from '../../../src/Options.js';

suite('HoistVariablesTransformer.js', function() {

  var options = new Options();
  setup(function() {
    options.arrayComprehension = true;
    options.blockBinding = true;
    options.generatorComprehension = true;
  });

  teardown(function() {
    options.reset();
  });

  function parseExpression(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, undefined, options);
    return parser.parseExpression();
  }

  function parseFunctionBody(content) {
    return parseExpression('function() {' + content + '}').body;
  }

  function normalize(content) {
    var tree = parseExpression('function() {' + content + '}').body;
    return write(tree);
  }

  function testHoist(name, code, expected) {
    test(name, function() {
      var tree = parseFunctionBody(code);
      var transformer = new HoistVariablesTransformer(null);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(normalize(expected), write(transformed));
    });
  }

  testHoist('Variable statement', '1; var x = 2;', 'var x; 1; x = 2;');
  testHoist('Variable statement', '1; var x = 2, y = 3;',
      'var x, y; 1; x = 2, y = 3;');
  testHoist('Variable statement', '1; var x = 2, y;', 'var x, y; 1; x = 2;');
  testHoist('Variable statement', '1; var x, y = 3;', 'var x, y; 1; y = 3;');

  testHoist('Let/const declaration', '1; let x = 2; const y = 3;',
      'var x, y; 1; x = 2; y = 3;');
  testHoist('Let/const declaration', '1; {let x = 2; const y = 3;}',
      '1; {let x = 2; const y = 3;}');

  testHoist('For loop', '1; for (var x = 2; x; x--) {}',
      'var x; 1; for (x = 2; x; x--) {}');
  testHoist('For loop', '1; for (var x = 2, y = 3; x; x--) {}',
      'var x, y; 1; for (x = 2, y = 3; x; x--) {}');
  testHoist('For loop', '1; for (var x = 2, y; x; x--) {}',
      'var x, y; 1; for (x = 2; x; x--) {}');
  testHoist('For loop', '1; for (var x, y = 3; x; x--) {}',
      'var x, y; 1; for (y = 3; x; x--) {}');
  testHoist('For loop', '1; for (let x = 2; x; x--) {}',
      '1; for (let x = 2; x; x--) {}');

  testHoist('For in loop', '1; for (var x in {}) {}',
      'var x; 1; for (x in {}) {}');
  testHoist('For in loop', '1; for (let x in {}) {}',
      '1; for (let x in {}) {}');

  testHoist('For of loop', '1; for (var x of []) {}',
      'var x; 1; for (x of []) {}');
  testHoist('For of loop', '1; for (let x of []) {}',
      '1; for (let x of []) {}');

  testHoist('Object pattern', '1; var {x} = {x: 2};',
      'var x; 1; ({x} = {x: 2});');
  testHoist('Object pattern', '1; var {x, y} = {x: 2, y: 3};',
      'var x, y; 1; ({x, y} = {x: 2, y: 3});');
  testHoist('Object pattern', '1; var {} = {}; 2;',
      '1; ({} = {}); 2;');
  testHoist('Object pattern nested', '1; var {x, y: {z}} = {x: 2, y: {z: 3}};',
      'var x, z; 1; ({x, y: {z}} = {x: 2, y: {z: 3}});');
  testHoist('Object pattern with initializer', '1; var {x = 2} = {x: 3};',
      'var x; 1; ({x = 2} = {x: 3});');

  testHoist('Object pattern for of loop', '1; for (var {x, y} in {}) {}',
      'var x, y; 1; for ({x, y} in {}) {}');

  testHoist('Array pattern', '1; var [x] = [2];', 'var x; 1; [x] = [2];');
  testHoist('Array pattern', '1; var [x, y] = [2, 3];',
      'var x, y; 1; [x, y] = [2, 3];');
  testHoist('Array pattern', '1; var [] = [];', '1; [] = [];');
  testHoist('Array pattern', '1; var [x, ...y] = [2, 3];',
      'var x, y; 1; [x, ...y] = [2, 3];');

  testHoist('Mixed pattern', '1; var [x, {y}] = [2, {y: 3}];',
      'var x, y; 1; [x, {y}] = [2, {y: 3}];');

  testHoist('Try catch', '1; try {} catch (e) {}', '1; try {} catch (e) {}');

  testHoist('Function', '1; function f() {}', '1; function f() {}');

  testHoist('Assignment pattern', '1; ({x} = {});', '1; ({x} = {});');

  testHoist('ClassDeclaration', '1; class C {}', '1; class C {}');

  testHoist('ClassExpression', '1; var x = class C {}',
      'var x; 1; x = class C {}');

  testHoist('Method', '1; var o = {m() {var x = 2;}};',
      'var o; 1; o = {m() {var x = 2;}};');

  testHoist('Arrow function', '1; var f = () => {var x = 2;};',
      'var f; 1; f = () => {var x = 2;};');

  testHoist('Array comprehension', '1; var a = [for (x of []) x];',
      'var a; 1; a = [for (x of []) x];');

  testHoist('Generator comprehension', '1; var g = (for (x of []) x);',
      'var g; 1; g = (for (x of []) x);');
});
