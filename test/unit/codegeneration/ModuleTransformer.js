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

import {suite, test, assert} from '../../unit/unitTestRunner.js';

import {ModuleTransformer} from '../../../src/codegeneration/ModuleTransformer.js';
import {Options} from '../../../src/Options.js';
import {Compiler} from '../../../src/Compiler.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('ModuleTransformer', function() {

  test('Remove extra use strict', () => {
    let compiler = new Compiler({});
    let content = `
        'use strict';
        export var x = 1;
    `;
    let tree = compiler.parse(content, 'ModuleTransformerTest.js');
    let tranformed = compiler.transform(tree);
    let output = write(tranformed);
    assert.equal(output.indexOf("'use strict'"), -1);
    assert.notEqual(output.indexOf('"use strict"'), -1);
  });

  function makeTest(name, content, included, testOptions) {
    test(name, function() {
      var options = new Options(testOptions);
      var compiler = new Compiler(options || {});
      var tree = compiler.parse(content, 'ModuleTransformerTest.js');
      var id = 0;
      var transformer = new ModuleTransformer({
        generateUniqueIdentifier: function() {
          return '$' + id++;
        }
      }, undefined, options);
      var transformed = transformer.transformAny(tree);
      var output = write(transformed);

      output = output.replace(/[\s]+/g, ' ');
      included = included.replace(/[\s]+/g, ' ');

      assert.include(output, included)
    });
  }

  makeTest('One', 'import {a} from "name"',
      'var a = $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null)).a;');
  makeTest('Two', 'import {a, b} from "name"',
      'var $0 = $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null)),\n' +
      '    a = $0.a,\n' +
      '    b = $0.b;');
  makeTest('Zero', 'import {} from "name"',
      '; $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));');
  makeTest('Zero', 'import "name"',
      '; $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));');

  makeTest('One, no destructuring', 'import {a} from "name"',
      'var a = $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null)).a;',
      {destructuring: false});
  makeTest('Two, no destructuring', 'import {a, b} from "name"',
      'var $0 = $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null)),\n' +
      '    a = $0.a,\n' +
      '    b = $0.b;',
          {destructuring: false});
  makeTest('Zero, no destructuring', 'import {} from "name"',
      '; $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));',
      {destructuring: false});
  makeTest('Zero, no destructuring', 'import "name"',
      '; $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));',
      {destructuring: false});

  makeTest('One, keep destructuring', 'import {a} from "name"',
      'var {a} = $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));',
      {destructuring: 'parse'});
  makeTest('Two, keep destructuring', 'import {a, b} from "name"',
      'var {a, b} = $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));',
      {destructuring: 'parse'});
  makeTest('Zero, keep destructuring', 'import {} from "name"',
      '; $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));',
      {destructuring: 'parse'});
  makeTest('Zero, keep destructuring', 'import "name"',
      '; $traceurRuntime.getModule($traceurRuntime.normalizeModuleName("name", null));',
      {destructuring: 'parse'});

});
