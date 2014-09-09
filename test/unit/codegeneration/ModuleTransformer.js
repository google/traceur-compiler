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

suite('ModuleTransformer', function() {

  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var ModuleTransformer = get('src/codegeneration/ModuleTransformer').ModuleTransformer;
  var options = get('src/Options').options;
  var parseOptions = get('src/Options').parseOptions;
  var transformOptions = get('src/Options').transformOptions;
  var Compiler = get('src/Compiler').Compiler;
  var write = get('src/outputgeneration/TreeWriter').write;

  teardown(function() {
    options.reset();
  });

  function makeTest(name, content, included, options) {
    test(name, function() {
      var compiler = new Compiler(options || {});
      var tree = compiler.parse(content, 'ModuleTransformerTest.js');
      var id = 0;
      var transformer = new ModuleTransformer({
        generateUniqueIdentifier: function() {
          return '$' + id++;
        }
      });
      var transformed = transformer.transformAny(tree);
      var output = write(transformed);

      output = output.replace(/[\s]+/g, ' ');
      included = included.replace(/[\s]+/g, ' ');

      assert.include(output, included)
    });
  }

  makeTest('One', 'import {a} from "name"', 'var a = System.get("name").a;');
  makeTest('Two', 'import {a, b} from "name"',
      'var $0 = System.get("name"),\n' +
      '    a = $0.a,\n' +
      '    b = $0.b;');
  makeTest('Zero', 'import {} from "name"', '; System.get("name");');
  makeTest('Zero', 'import "name"', '; System.get("name");');

  makeTest('One, no destructuring', 'import {a} from "name"',
      'var a = System.get("name").a;',
      {destructuring: false});
  makeTest('Two, no destructuring', 'import {a, b} from "name"',
      'var $0 = System.get("name"),\n' +
      '    a = $0.a,\n' +
      '    b = $0.b;',
          {destructuring: false});
  makeTest('Zero, no destructuring', 'import {} from "name"',
      '; System.get("name");',
      {destructuring: false});
  makeTest('Zero, no destructuring', 'import "name"', '; System.get("name");',
      {destructuring: false});

  makeTest('One, keep destructuring', 'import {a} from "name"',
      'var {a} = System.get("name");',
      {destructuring: 'parse'});
  makeTest('Two, keep destructuring', 'import {a, b} from "name"',
      'var {a, b} = System.get("name");',
      {destructuring: 'parse'});
  makeTest('Zero, keep destructuring', 'import {} from "name"',
      '; System.get("name");',
      {destructuring: 'parse'});
  makeTest('Zero, keep destructuring', 'import "name"',
      '; System.get("name");',
      {destructuring: 'parse'});

});
