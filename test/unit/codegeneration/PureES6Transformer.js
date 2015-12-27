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
import {PureES6Transformer} from '../../../src/codegeneration/PureES6Transformer.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('PureES6Transformer.js', function() {

  function parse(content, reporter, options) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, reporter, options);
    return parser.parseModule();
  }

  test('Inline', function(done) {
    var options = new Options({
      modules: 'inline'
    });
    var metadata = {
      rootModule: null
    };
    var reporter = new ErrorReporter();

    var code = [
      `import './resources/test_0.js';`,
      `import {TestA} from ${"'./resources/test_a.js'"};`,
      `import {TestB} from ${"'./resources/test_b.js'"};`,
      'export class App {',
      '  constructor() {',
      '    this.name = "hello";',
      '  }',
      '}',
      'export const test = {TestA, TestB};'
    ].join('\n');

    var expected = [
      '"use strict";',
      'const {TestA} = $__resources_47_test_95_a_46_js__;',
      'const {TestB} = $__resources_47_test_95_b_46_js__;',
      'export class App {',
      '  constructor() {',
      '    this.name = "hello";',
      '  }',
      '}',
      'export const test = {',
      '  TestA,',
      '  TestB',
      '};'
    ].join('\n');

    var tree = parse(code, reporter, options);
    var expectedTree = parse(expected, reporter, options);
    var transformer = new PureES6Transformer(reporter, options, metadata);
    var transformed = transformer.transform(tree);
    assert.equal(write(transformed), write(expectedTree));
    done();
  });
});
