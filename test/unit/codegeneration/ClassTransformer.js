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
import {ClassTransformer} from '../../../src/codegeneration/ClassTransformer.js';
import {Options} from '../../../src/Options.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {UniqueIdentifierGenerator} from '../../../src/codegeneration/UniqueIdentifierGenerator.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('ClassTransformer.js', function() {
  var options = new Options();
  options.blockBinding = 'parse';

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
      var transformer = new ClassTransformer(
          new UniqueIdentifierGenerator(), reporter, options);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(write(transformed), normalize(expected));
      assert.lengthOf(reporter.errors, 0);
    });
  }

  makeTest('class C {}',
           `let C = function() {
              const C = function C() {}
              return ($traceurRuntime.createClass)(C, {}, {});
            }();`);
  makeTest('export class C {}',
           `export let C = function() {
              const C = function C() {};
              return ($traceurRuntime.createClass)(C, {}, {});
            }();`);
  makeTest('export default class C {}',
           `let C = function() {
              const C = function C() {};
              return ($traceurRuntime.createClass)(C, {}, {});
            }();
            export {C as default};`);
  makeTest('export default class {}',
           `export default ($traceurRuntime.createClass)(
                function() {}, {}, {})`);
});
