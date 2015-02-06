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

import {suite, test, assert} from '../modular/testRunner.js';

suite('Compiler', function() {
  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var Compiler;
  var versionLockedOptions;
  setup(function() {
    Compiler = get('src/Compiler.js').Compiler;
    versionLockedOptions = get('src/Options.js').versionLockedOptions;
  });

  test('Compiler synchronous', function() {
    var compiler = new Compiler();
    var content = 'var x = 5;';
    var result = compiler.compile(content);
    assert.isTrue(result.length > 0);
  });

  test('Compiler synchronous, errors', function() {
    var compiler = new Compiler();
    var content = 'syntax error';
    assert.throws(function() { compiler.compile(content); });
  });

  test('Compiler synchronous, experimental option', function() {
    var compiler = new Compiler({experimental: true});
    var content = 'let x = 5;';
    var result = compiler.compile(content);
    assert.isTrue(result.length > 0);
  });

  test('Compiler options locked', function() {
    var Options = get('src/Options.js').Options;

    var options = new Options();
    var mismatches = options.diff(versionLockedOptions);
    if (mismatches.length)
      console.error('Options changed ', mismatches);
    assert.equal(mismatches.length, 0);

    var checkDiff =
        new Options({blockBinding: !versionLockedOptions.blockBinding});
    assert.equal(checkDiff.diff(versionLockedOptions).length, 1);
  });

});
