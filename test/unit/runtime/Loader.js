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
  setup,
  teardown
} from '../../unit/unitTestRunner.js';

import {InternalLoader} from '../../../src/loader/InternalLoader.js';

function createLoaderAgainstMocks(depsByName) {
  let calls = [];
  let mockLoader = {
    normalize: function(name) {
      calls.push('normalize ' + name);
      return name;
    },
    get: function(name) {
      calls.push('get ' + name);
      return undefined;
    },
    locate: function(codeUnit) {
      calls.push('locate ' + codeUnit.normalizedName);
      return codeUnit.normalizedName;  // The fetch will be faked.
    },
    fetch: function(codeUnit) {
      calls.push('fetch ' + codeUnit.normalizedName);
      return Promise.resolve('text');
    },
    nameTrace: function() {
      throw new Error('test should not call');
    },
    translate: function(codeUnit) {
      calls.push('translate ' + codeUnit.normalizedName);
      return codeUnit.source;
    },
    instantiate: function(codeUnit) {
      calls.push('instantiate ' + codeUnit.normalizedName);
    }
  };

  let mockLoaderCompiler = {
    getModuleSpecifiers: function(codeUnit) {
      calls.push('getModuleSpecifiers ' + codeUnit.normalizedName);
      let name = codeUnit.normalizedName;
      let deps = depsByName[name];
      if (!deps) {
        throw new Error('unexpected codeUnit ' + codeUnit);
      }
      return deps;
    },
    analyzeDependencies: function(units) {
      calls.push('analyzeDependencies ' + units.length);
    },
    transform: function(codeUnit) {
      calls.push('transform ' + codeUnit.normalizedName);
    },
    write: function(codeUnit) {
      calls.push('write ' + codeUnit.normalizedName);
      codeUnit.metadata.compiler = {};
    },
    evaluateCodeUnit: function(codeUnit) {
      calls.push('evaluateCodeUnit ' + codeUnit.normalizedName);
    }
  };
  let loader = new InternalLoader(mockLoader, mockLoaderCompiler);
  return {calls, loader};
}

function loadAndCheck(depsByName, expectedCalls, done) {
  let {calls, loader} = createLoaderAgainstMocks(depsByName);

  loader.load('foo').then((codeUnit) => {
    assert(codeUnit.normalizedName === 'foo');
    // This kind of log is very handy:
    // console.log('calls ', '[\n\'' + calls.join('\',\n\'') + '\'\n]');
    assert.deepEqual(calls, expectedCalls);
    done();
  }).catch(done);
}

suite('InternalLoader.js', function() {

  test('load no deps', function(done) {
    let depsByName = {
      foo: []
    };
    let expectedCalls = [
      'normalize foo',
      'get foo',
      'locate foo',
      'fetch foo',
      'translate foo',
      'getModuleSpecifiers foo',
      'analyzeDependencies 1',
      'transform foo',
      'write foo',
      'instantiate foo',
      'evaluateCodeUnit foo'
    ];

    loadAndCheck(depsByName, expectedCalls, done);
  });

  test('load with deps', function(done) {
    let depsByName  = {
      foo: ['bar'],
      bar: []
    };

    let expectedCalls = [
      'normalize foo',
      'get foo',
      'locate foo',
      'fetch foo',
      'translate foo',
      'getModuleSpecifiers foo',
      'normalize bar',
      'get bar',
      'locate bar',
      'fetch bar',
      'translate bar',
      'getModuleSpecifiers bar',
      'analyzeDependencies 2',
      'transform bar',
      'write bar',
      'instantiate bar',
      'transform foo',
      'write foo',
      'instantiate foo',
      'evaluateCodeUnit bar',
      'evaluateCodeUnit foo'
    ];

    loadAndCheck(depsByName, expectedCalls, done);
  });

test('load with unordered deps', function(done) {
    let depsByName  = {
      foo: ['bar', 'baz'],
      baz: ['bar'],
      bar: []
    };

    let expectedCalls = [
      'normalize foo',
      'get foo',
      'locate foo',
      'fetch foo',
      'translate foo',
      'getModuleSpecifiers foo',
      'normalize bar',
      'get bar',
      'normalize baz',
      'get baz',
      'locate bar',
      'fetch bar',
      'locate baz',
      'fetch baz',
      'translate bar',
      'translate baz',
      'getModuleSpecifiers bar',
      'getModuleSpecifiers baz',
      'normalize bar',
      'analyzeDependencies 3',
      'transform bar',
      'write bar',
      'instantiate bar',
      'transform baz',
      'write baz',
      'instantiate baz',
      'transform foo',
      'write foo',
      'instantiate foo',
      'evaluateCodeUnit bar',
      'evaluateCodeUnit baz',
      'evaluateCodeUnit foo'
    ];

    loadAndCheck(depsByName, expectedCalls, done);
  });
});
