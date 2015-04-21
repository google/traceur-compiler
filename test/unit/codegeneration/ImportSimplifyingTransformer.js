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

import {ImportSimplifyingTransformer} from '../../../src/codegeneration/ImportSimplifyingTransformer.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('ImportSimplifyingTransformer.js', function() {

  function parseModule(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file);
    return parser.parseModule();
  }

  function testNormalize(name, content, expected) {
    test(name, function() {
      var tree = parseModule(content);
      var transformer = new ImportSimplifyingTransformer(null);
      var transformed = transformer.transformAny(tree);
      var expectedTree = parseModule(expected);
      assert.equal(write(expectedTree), write(transformed));
    });
  }

  testNormalize('import default',
    'import a from "mod";',
    'import {default as a} from "mod";');
  testNormalize('import spec',
    'import {a as b} from "mod";',
    'import {a as b} from "mod";');
  testNormalize('import spec with shorthand',
    'import {a as b, c} from "mod";',
    'import {a as b, c} from "mod";');
  testNormalize('import namespace',
    'import * as m from "mod";',
    'import * as m from "mod";');
  testNormalize('import empty',
    'import "mod";',
    'import {} from "mod";');
  testNormalize('import pair',
    'import a, {b as c} from "mod";',
    'import {default as a, b as c} from "mod";');
  testNormalize('import pair',
    'import a, {} from "mod";',
    'import {default as a} from "mod";');
  testNormalize('import pair with name space',
    'import a, * as b from "mod";',
    'import {default as a} from "mod";' +
     'import * as b from "mod";');
});
