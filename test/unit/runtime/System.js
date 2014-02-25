// Copyright 2011 Traceur Authors.
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

suite('System.js', function() {

  var saveBaseURL;

  setup(function() {
    saveBaseURL = System.baseURL;
  });

  teardown(function() {
     System.baseURL = saveBaseURL;
  });

  test('System.normalize', function() {
    // Set the baseURL to verify it does not alter normalize results.
    System.baseURL = 'http://example.org/a/b.html';
    // no referer
    assert.equal(System.normalize('d/e/f'), 'd/e/f');
    // below baseURL
    assert.equal('../e/f', System.normalize('../e/f'));

    var refererName = 'dir/file';  // assume referer is normalized
    assert.equal(System.normalize('./d/e/f', refererName), 'dir/d/e/f');
    assert.equal(System.normalize('../e/f', refererName), 'e/f');
    assert.equal(System.normalize('../src/options.js',
        'traceur@/b/node'), 'traceur@/src/options.js');
    // not relative
    assert.equal(System.normalize('d/e/f', refererName), 'd/e/f');

    // Empty string should not throw.
    // TODO(jjb): what is the correct result?
    assert.equal(System.normalize(''), '.');

    try {
      assert.equal(System.normalize(undefined, refererName), 'should throw');
    } catch(e) {
      assert.equal(e.message, 'module name must be a string, not undefined');
    }
    try {
      assert.equal(System.normalize('a/b/../c'), 'should throw');
    } catch(e) {
      assert.equal(e.message, 'module name embeds /../: a/b/../c');
    }
    try {
      assert.equal(System.normalize('a/../b', refererName),'should throw');
    } catch(e) {
      assert.equal(e.message, 'module name embeds /../: a/../b');
    }
    try {
      assert.equal(System.normalize('a/b/../c', refererName),'should throw');
    } catch(e) {
      assert.equal(e.message, 'module name embeds /../: a/b/../c');
    }

    // below referer
    assert.equal(System.normalize('../../e/f', refererName), '../e/f');

    assert.equal(System.normalize('abc/def'), 'abc/def');
    // backwards compat
    assert.equal(System.normalize('./a.js'), 'a.js');
    // URL
    assert.equal(System.normalize('http://example.org/a/b.html'),
      'http://example.org/a/b.html');
    // Canonicalize URL
    assert.equal(System.normalize('http://example.org/a/../b.html'),
      'http://example.org/b.html');
  });

  test('System.set', function() {
    var store = $traceurRuntime.ModuleStore;
    var polyfills = store.getForTesting('src/runtime/polyfills/polyfills');
    System.set('traceur-testing-System@', polyfills);
    assert.equal(polyfills, System.get('traceur-testing-System@'));
  });

  test('ModuleStore.registerModule', function() {
    var store = $traceurRuntime.ModuleStore;
    try {
      store.registerModule('name', function(){});
      store.registerModule('name', function(){});
    } catch (ex) {
      return;
    }
    throw new Error('Expected throw before this statement');
  });

});
