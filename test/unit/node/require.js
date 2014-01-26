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

suite('require.js', function() {

  var path = require('path');

  test('traceurRequire', function() {
    var traceurRequire = require('../../../src/node/require');
    // TODO(arv): The path below is sucky...
    var x = traceurRequire(path.join(__dirname, './resources/x.js')).x;
    assert.equal(x, 'x');
  });


  test('traceurRequire.makeDefault with nested dependencies', function() {
    require('../../../src/node/require').makeDefault(function(filename) {
      return /\/test\/unit\/node\/resources\//.test(
          filename.replace(/\\/g, '/'));
    });

    // // TODO(arv): The path below is sucky...
    var Q = require(path.join(__dirname, './resources/import-export.js')).Q;
    var q = new Q();
    assert.equal(q.name, 'Q');
  });
});
