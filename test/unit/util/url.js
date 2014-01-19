// Copyright 2013 Traceur Authors.
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

suite('url.js', function() {
  test('removeDotSegments', function() {

    var removeDotSegments =
            $traceurRuntime.ModuleStore.getForTesting('src/util/url').removeDotSegments;

    assert.equal('/', removeDotSegments('/'));
    assert.equal('.', removeDotSegments('.'));
    assert.equal('./', removeDotSegments('./'));
    assert.equal('/', removeDotSegments('/.'));
    assert.equal('/', removeDotSegments('/..'));
    assert.equal('../', removeDotSegments('../'));
    assert.equal('..', removeDotSegments('..'));
    assert.equal('../..', removeDotSegments('../..'));
    assert.equal('../../', removeDotSegments('../../'));
    assert.equal('../a', removeDotSegments('../a'));
    assert.equal('../a/', removeDotSegments('../a/'));

    assert.equal('.', removeDotSegments('a/..'));
    assert.equal('./', removeDotSegments('a/../'));
    assert.equal('a', removeDotSegments('a/b/..'));
    assert.equal('a/', removeDotSegments('a/b/../'));

    assert.equal('b', removeDotSegments('a/../b'));
    assert.equal('b/', removeDotSegments('a/../b/'));

    assert.equal('../b', removeDotSegments('a/../../b'));
    assert.equal('../b/', removeDotSegments('a/../../b/'));

    assert.equal('..', removeDotSegments('a/../../b/..'));
    assert.equal('../', removeDotSegments('a/../../b/../'));

    assert.equal('a/b', removeDotSegments('a/./b'));
    assert.equal('a/b/', removeDotSegments('a/./b/'));
    assert.equal('a/b', removeDotSegments('a/././b'));
    assert.equal('a/b/', removeDotSegments('a/././b/'));
    assert.equal('a/b', removeDotSegments('a/././b/.'));
    assert.equal('a/b/', removeDotSegments('a/././b/./'));

    assert.equal('b', removeDotSegments('a/./../b'));
    assert.equal('b/', removeDotSegments('a/./../b/'));
  });
});
