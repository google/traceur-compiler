// Copyright 2016 Traceur Authors.
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
} from '../../unit/unitTestRunner.js';

import {CollectingErrorReporter as ErrorReporter} from '../../../src/util/CollectingErrorReporter.js';
import {DestructuringTransformer} from '../../../src/codegeneration/DestructuringTransformer.js';
import {Options} from '../../../src/Options.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {UniqueIdentifierGenerator} from '../../../src/codegeneration/UniqueIdentifierGenerator.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('DestructuringTransformer.js', function() {
  var options = new Options();

  function parseModule(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, undefined, options);
    return parser.parseModule();
  }

  function normalize(content) {
    var tree = parseModule(content);
    return write(tree);
  }

  function makeTest(code, expected) {
    test(code, () => {
      var tree = parseModule(code);
      var reporter = new ErrorReporter();
      var transformer = new DestructuringTransformer(
          new UniqueIdentifierGenerator(), reporter, options);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(write(transformed), normalize(expected));
      assert.lengthOf(reporter.errors, 0);
    });
  }

  makeTest('let x;', 'let x;');
  makeTest('let {x} = {x: 1};', 'let x = {x: 1}.x;');
  makeTest('let {x} = f();', 'let x = f().x;');
  makeTest('const {x, y} = {x: 1, y: 2};',
           'const $__0 = {x: 1, y: 2}, x = $__0.x, y = $__0.y;');
  makeTest('const {x, y} = a;',
           'const $__0 = a, x = $__0.x, y = $__0.y;');
  makeTest('const {x, y: z} = f();',
           'const $__0 = f(), x = $__0.x, z = $__0.y;');

  makeTest('export let {x} = {x: 1};', 'export let x = {x: 1}.x;');
  makeTest('export var {x, y} = f();',
           `var $__0 = f();
            export var x = $__0.x;
            export var y = $__0.y;`);

  makeTest('let [x] = [1];',
           `var $__1, $__2, $__3, $__4;
            let x = ($__3 = [1][Symbol.iterator](),
                ($__4 = $__3.next()).done ? void 0 : $__4.value);`);
  makeTest('let [x, y] = [1, 2];',
           `var $__1, $__2;
            let $__0 = [1, 2],
                x = ($__1 = $__0[Symbol.iterator](),
                     ($__2 = $__1.next()).done ? void 0 : $__2.value),
                y = ($__2 = $__1.next()).done ? void 0 : $__2.value;`);
  makeTest('let [...xs] = [1, 2];',
           `var $__1, $__2, $__3, $__4;
            let xs = ($__3 = [1, 2][Symbol.iterator](),
                      $traceurRuntime.iteratorToArray($__3));`);

  makeTest('export let [x] = [1];',
           `var $__1, $__2, $__3, $__4;
            export let x = ($__3 = [1][Symbol.iterator](),
                ($__4 = $__3.next()).done ? void 0 : $__4.value);`);
  makeTest('export let [x, y] = [1, 2];',
           `var $__1, $__2;
            let $__0 = [1, 2];
            export let x = ($__1 = $__0[Symbol.iterator](),
                            ($__2 = $__1.next()).done ? void 0 : $__2.value);
            export let y = ($__2 = $__1.next()).done ? void 0 : $__2.value;`);
  makeTest('export const [...xs] = [1, 2];',
           `var $__1, $__2, $__3, $__4;
            export const xs = ($__3 = [1, 2][Symbol.iterator](),
                      $traceurRuntime.iteratorToArray($__3));`);
});
