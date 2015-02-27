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

import {suite, test, assert} from '../../modular/testRunner.js';

import {ErrorReporter} from '../../../src/util/ErrorReporter.js';
import {Options} from '../../../src/Options.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {PureES6Transformer} from '../../../src/codegeneration/PureES6Transformer.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('PureES6Transformer.js', function() {

  function parseStatement(content, reporter, options) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, reporter, options);
    return parser.parseStatement();
  }

  // https://github.com/google/traceur-compiler/issues/1774
  test('Basic', function() {
    var code = 'var x : number = 42;';
    var expected = 'var x = 42;';

    var options = new Options({types: true});
    var reporter = new ErrorReporter();
    var tree = parseStatement(code, reporter, options);
    var expectedTree = parseStatement(expected, reporter, options);
    var transformer = new PureES6Transformer(reporter, options);
    var transformed = transformer.transform(tree);
    assert.equal(write(transformed), write(expectedTree));
  });
});
