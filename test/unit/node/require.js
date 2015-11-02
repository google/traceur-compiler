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

suite('require.js', function() {

  var path = require('path');
  var traceurRequire = require('../../../src/node/require');

  test('traceurRequire', function() {
    // TODO(arv): The path below is sucky...
    var x = traceurRequire(path.join(System.dirname(__moduleName), './resources/x.js')).x;
    assert.equal(x, 'x');
  });

  test('traceurRequire errors', function() {
    try {
      var filename = 'resources/syntax-error.js';
      traceurRequire(path.join(System.dirname(__moduleName), './' + filename));
      assert.notOk(true);
    } catch (ex) {
      assert.equal('MultipleErrors', ex.name);
      assert.equal(ex.errors.length, 1, 'One error is reported');
      assert.include(ex.errors[0].replace(/\\/g, '/'), filename,
          'The error message should contain the filename');
    }
  });

  test('traceurRequire.makeDefault options', function() {
    // TODO(arv): The path below is sucky...
    var fixturePath = path.join(System.dirname(__moduleName), './resources/async-function.js');
    var experimentalOption = {asyncFunctions: true};
    // traceur.require must throw without the experimentalOption
    try {
      traceurRequire(fixturePath);
      assert.notOk(true);
    } catch(e) {
      assert.ok(true);
    }

    // Intercept node compiles and apply options.
    traceurRequire.makeDefault(undefined, experimentalOption);

    // Trigger the node compile, working around the local require()
    // set by traceur for es6 compiles.
    var foo = traceurRequire.nodeRequire(fixturePath).foo;
    assert.equal(typeof foo, 'function');

    // reset traceur.makeDefault options
    traceurRequire.makeDefault();
    try {
      require(fixturePath);
      assert.notOk(true);
    } catch(e) {
      assert.ok(true);
    }
  });

  test('traceurRequire.makeDefault with nested dependencies', function() {
    traceurRequire.makeDefault(function(filename) {
      return /\/test\/unit\/node\/resources\//.test(
          filename.replace(/\\/g, '/'));
    });

    // As above, use node's original require, not the local Tracuer
    // supplied one.
    var Q = traceurRequire.nodeRequire(
      path.join(System.dirname(__moduleName), './resources/import-export.js')).Q;
    var q = new Q();
    assert.equal(q.name, 'Q');
  });
});
