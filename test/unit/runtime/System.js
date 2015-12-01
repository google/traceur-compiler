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

import {
  suite,
  test,
  assert,
  setup,
  teardown
} from '../../unit/unitTestRunner.js';

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
    assert.equal(System.normalize('../src/Options.js',
        'traceur@/b/node'), 'traceur@/src/Options.js');
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

  // This test won't pass for traceur-no-modules.js:
  // the modules are not stored in the inlined version.
  test('System.set', function() {
    var store = $traceurRuntime.ModuleStore;
    var polyfills = store.get('traceur@' + System.version + '/src/runtime/polyfills/polyfills.js');
    System.set('traceur-testing-System@', polyfills);
    assert.equal(polyfills, System.get('traceur-testing-System@'));
  });

  // This test won't pass for traceur-no-modules.js:
  // the modules are not stored in the inlined version.
  test('traceur@', function() {
    var optionsModule = System.get('traceur@' + System.version + '/src/Options.js');
    assert.equal(traceur.util.Options, optionsModule.Options);
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

  test('System.baseURL.setter', function() {
    var testing = 'testing';
    assert.notEqual(System.baseURL, testing);
    System.baseURL = testing;
    assert.equal(System.baseURL, testing);
    // reset in teardown.
  });

  test('System.version', function() {
    assert(System.version);
  });

  test('System.semverMap', function() {
    var semVerRegExp = System.semVerRegExp_();
    var m = semVerRegExp.exec('1.2.3-a.b.c.5.d.100');
    assert.equal(1, m[1]);
    assert.equal(2, m[2]);
    m = semVerRegExp.exec('1.2.X');
    assert(!m);
    m = semVerRegExp.exec('Any');
    assert(!m);
    var version = System.map['traceur'];
    assert(version);
    // This test must be updated if the major or minor version number changes.
    // If the change is intended, this is a reminder to update the documentation.
    assert.equal(version, System.map['traceur@0']);
    assert.equal(version, System.map['traceur@0.0']);
  });

  test('System.map', function() {
    System.map = System.semverMap('traceur@0.0.13/src/runtime/System.js');
    var version = System.map['traceur'];
    var remapped = System.normalize('traceur@0.0/src/runtime/System.js');
    var versionSegment = remapped.split('/')[0];
    assert.equal(version, versionSegment);
    var alsoByVersion = System.semverMap('traceur@0.0.13');
    assert.equal(alsoByVersion['traceur'], System.map['traceur']);
  });

  test('System.applyMap', function() {
    var originalMap = System.map;
    System.map['tests/contextual'] = {
      maptest: 'tests/contextual-map-dep'
    };
    var contexualRemap = System.normalize('maptest', 'tests/contextual');
    assert.equal('tests/contextual-map-dep', contexualRemap);
    // prefix must match up to segment delimiter '/'
    System.map = {
      jquery: 'jquery@2.0.0'
    };
    var remap = System.normalize('jquery-ui');
    assert.equal('jquery-ui', remap);
    System.map = originalMap;
  });

  test('System.hookAPI', function(done) {
    // API testing only, function testing in Loader tests.
    var load = {
      metadata: {},
      normalizedName:
          System.normalize('./test/unit/runtime/resources/test_module.js')
    };

    var url = load.address = System.locate(load);
    assert(/test\/unit\/runtime\/resources\/test_module.js$/.test(url),
      'the locate result (' + url + ') contains the correct path');
    System.fetch(load).then(function(text) {
      assert.typeOf(text, 'string');
      load.source = text;
      return load;
    }).then(System.translate.bind(System)).then(function(source) {
      assert.equal(source, load.source);
      return load;
    }).then(System.instantiate.bind(System)).then(function(nada) {
      assert.typeOf(nada, 'undefined');
      done();
    }).catch(done);
  });


  test('System.dirname', function(){
    assert.equal(System.dirname(''), '.');
    assert.equal(System.dirname('a.js'), '.');
    assert.equal(System.dirname('/a.js'), '/');
    assert.equal(System.dirname('a/b.js'), 'a');
    assert.equal(System.dirname('/a/b.js'), '/a');
  });
});
