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

  var saveBaseURL = System.baseURL;

  test('System.normalize', function() {
    var m = System.get('@traceur/module');

    // Set the baseURL to verify it does not alter normalize results.
    System.baseURL = 'http://example.org/a/b.html';
    // no referer
    assert.equal(System.normalize('d/e/f'), './d/e/f');
    // below baseURL
    assert.equal('../e/f', System.normalize('../e/f'));

    var refererName = './dir/file';
    assert.equal(System.normalize('./d/e/f', refererName), './dir/d/e/f');
    assert.equal(System.normalize('../e/f', refererName), './e/f');
    // below referer
    assert.equal(System.normalize('../../e/f', refererName), '../e/f');

    var refererName = '../x/y';
    assert.equal(System.normalize('./d/e/f', refererName),'../x/d/e/f');
    // internal system module
    assert.equal(System.normalize('@abc/def'), '@abc/def');
    // backwards compat
    assert.equal(System.normalize('./a.js'), './a.js');
    // URL
    assert.equal(System.normalize('http://example.org/a/b.html'),
      'http://example.org/a/b.html');
    // Canonicalize URL
    assert.equal(System.normalize('http://example.org/a/../b.html'),
      'http://example.org/b.html');

    System.baseURL = saveBaseURL;
  });

  test('System.locate', function() {
    var load = {
      metadata: {
        baseURL: 'http://example.org/a/'
      }
    }
    load.name = '@abc/def';
    assert.equal(System.locate(load), '@abc/def');
    load.name = './abc/def';
    assert.equal(System.locate(load), 'http://example.org/a/abc/def.js');

    System.baseURL = saveBaseURL;
  });

});
