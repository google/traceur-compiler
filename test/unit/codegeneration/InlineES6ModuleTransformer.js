// Copyright 2015 Traceur Authors.
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

import {ErrorReporter} from '../../../src/util/ErrorReporter.js';
import {Options} from '../../../src/Options.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {UniqueIdentifierGenerator} from '../../../src//codegeneration/UniqueIdentifierGenerator.js';
import {InlineES6ModuleTransformer} from '../../../src/codegeneration/InlineES6ModuleTransformer.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('InlineES6ModuleTransformer.js', function() {

  function parse(content, reporter, options) {
    let file = new SourceFile('test', content);
    let parser = new Parser(file, reporter, options);
    return parser.parseModule();
  }

  test('Inline handles `export *` statements', function() {
    let options = new Options({
      modules: 'inline'
    });
    let metadata = {
      rootModule: null
    };
    let reporter = new ErrorReporter();
    let exportStarCode = `
      export * from ${"'./resources/test_a.js'"};
      export * from ${"'./resources/test_b.js'"};
    `;

    let code = `import {TestA, TestB} from ${"'./exportStarTest'"};`;
    let expected = [
      '"use strict";',
      'const {TestA,',
      '  TestB} = $__exportStarTest__;',
      'let $__0 = {};',
      'for (let $__1 in $__resources_47_test_95_a_46_js__)',
      '  if ($__resources_47_test_95_a_46_js__.hasOwnProperty($__1))',
      '    $__0[$__1] = $__resources_47_test_95_a_46_js__[$__1];',
      'for (let $__1 in $__resources_47_test_95_b_46_js__)',
      '  if ($__resources_47_test_95_b_46_js__.hasOwnProperty($__1))',
      '    $__0[$__1] = $__resources_47_test_95_b_46_js__[$__1];',
      ''
    ].join('\n');

    let exportStarTree = parse(exportStarCode, reporter, options);
    let tree = parse(code, reporter, options);

    let transformer = new InlineES6ModuleTransformer(
      new UniqueIdentifierGenerator(), reporter, options, metadata);
    transformer.exportVisitor.visitAny(exportStarTree);
    let transformed = transformer.transformAny(tree);
    assert.equal(write(transformed), expected);
  });
});
