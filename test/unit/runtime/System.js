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

    System.baseURL = 'http://example.org/a/b.html';
    assert.equal('http://example.org/a/d/e/f', System.normalize('d/e/f'));
    assert.equal('http://example.org/e/f', System.normalize('../e/f'));

    System.baseURL = '/dir/file.js';
    assert.equal('/dir/d/e/f', System.normalize('d/e/f'));
    assert.equal('/e/f', System.normalize('../e/f'));

    var base = 'http://ecmascipt.org/x/y';
    assert.equal('http://ecmascipt.org/x/d/e/f',
                 System.normalize('d/e/f', {referer: {name: base}}));
    System.baseURL = saveBaseURL;
  });

  test('System.resolve', function() {
    System.baseURL = 'http://example.org/a/b.html';
    assert.equal(System.resolve('@abc/def'), '@abc/def');
    assert.equal(System.resolve('abc/def'), 'http://example.org/a/abc/def.js');

    // Backwards compat
    assert.equal(System.resolve('abc/def.js'),
                 'http://example.org/a/abc/def.js');

    var importer = './src/syntax/Parser.js';
    var options = {referer: {name: importer}};
    var normalized = System.normalize('./IdentifierToken', options);
    assert.equal(normalized, 'src/syntax/IdentifierToken');
    var resolved = System.resolve(normalized);
    assert.equal(resolved,
                 'http://example.org/a/src/syntax/IdentifierToken.js');
    System.baseURL = saveBaseURL;
  });

});
