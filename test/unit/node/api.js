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

suite('api.js', function() {

  setup(function() {
    traceur.options.reset();
  });

  teardown(function() {
    traceur.options.reset();
  });

  test('api compile script function declaration', function() {
    var api = require('../../../src/node/api');
    var result = api.compile('function foo() {};',
        {modules: false});
    assert(result.errors.length === 0);
  });

  test('api compile script function expression', function() {
    var api = require('../../../src/node/api');
    var result = api.compile('var foo = function() {};',
        {modules: false});
    assert(result.errors.length === 0);
  });

  test('api compile experimental', function() {
    var api = require('../../../src/node/api');
    var result = api.compile('let a = 1;', {blockBinding: true});
    assert(result.errors.length === 0, 'expect no errors');
  });

});
