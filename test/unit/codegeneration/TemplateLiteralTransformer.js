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

suite('TemplateLiteralTransformer', function() {

  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }
  var Compiler = get('src/Compiler.js').Compiler;

  function testResult(name, content, expectedResult) {
    test(name, function() {
      var result = Compiler.script(content);
      var value = (0, eval)(result);
      assert.equal(value, expectedResult);
    });
  }

  testResult('\\r cooked', '`a\rb`', 'a\nb');
  testResult('\\n cooked', '`a\nb`', 'a\nb');
  testResult('\\r\\n cooked', '`a\r\nb`', 'a\nb');

  testResult('\\r raw', '((x) => x.raw[0]) `a\rb`', 'a\nb');
  testResult('\\n raw', '((x) => x.raw[0]) `a\nb`', 'a\nb');
  testResult('\\r\\n raw', '((x) => x.raw[0]) `a\r\nb`', 'a\nb');

  testResult('\\\\r cooked', '`a\\rb`', 'a\rb');
  testResult('\\\\r raw', '((x) => x.raw[0]) `a\\rb`', 'a\\rb');
});
