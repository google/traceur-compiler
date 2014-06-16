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

suite('Compiler', function() {
  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var Compiler;
  var optionsV01;
  setup(function() {
    Compiler = get('src/Compiler').Compiler;
    optionsV01 = get('src/options').optionsV01;
    traceur.options.reset();
  });

  test('Compiler synchronous', function() {
    var compiler = new Compiler();
    var content = '';
    var result = compiler.compile(content);
    assert.isTrue(result.js.length > 0);
    assert.equal(result.errors.length, 0);
  });

  test('Compiler synchronous, errors', function() {
    var compiler = new Compiler();
    var content = 'syntax error';
    var result = compiler.compile(content);
    assert.isUndefined(result.js);
    assert.equal(result.errors.length, 1);
  });

  test('Compiler asynchronous', function(done) {
    var compiler = new Compiler();
    var content = '';
    var result = compiler.parse({content: content, options: {}}).then(function(result) {
      return compiler.transform(result);
    }).then(function(result) {
      return compiler.write(result);
    }).then(function(result) {
      assert.isTrue(result.js.length > 0);
      assert.equal(result.errors.length, 0);
      done();
    }).catch(done);
  });

  test('Compiler asynchronous, error', function(done) {
    var compiler = new Compiler();
    var content = 'syntax error';
    var result = compiler.parse({content: content, options: {}}).then(function(result) {
      return compiler.transform(result);
    }).then(function(result) {
      return compiler.write(result);
    }).then(function(result) {
      done(new Error('Expected error, got none'));
    }).catch(function(ex) {
      done();
    });
  });

  test('Compiler options locked', function() {
    Object.keys(traceur.options).forEach(function(key) {
      var mismatches = [];
      if (traceur.options[key] !== optionsV01[key]) {
        mismatches.push({key: key,
            now: traceur.options[key], v01: optionsV01[key]});
      }
      if (mismatches.length)
        console.log("Options changed ", mismatches);
      assert.equal(mismatches.length, 0);
    });
  });
});
