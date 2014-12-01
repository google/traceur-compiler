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
'use strict';
var fs = require('fs');
var traceurAPI = require('../src/node/api.js');

// This compares golden files in test/closure with the output after compilation
// in the respective -expected.txt files.

suite('closure', function() {
  function collectFiles(path, result) {
    if (!fs.statSync(path).isDirectory()) {
      result.push(path);
    } else {
      fs.readdirSync(path).forEach(function(p) {
        collectFiles(path + '/' + p, result);
      });
    }
  }

  var files = [];
  collectFiles('test/closure', files);
  var goldenFiles = files.filter(function(p) {
    return p.endsWith('-expected.txt');
  });

  goldenFiles.forEach(function(goldenFile) {
    var goldenText = fs.readFileSync(goldenFile, 'utf8');
    var inputFile = goldenFile.replace(/\-expected\.txt$/, '.js');
    var inputText = fs.readFileSync(inputFile, 'utf8');
    var actualText =
        traceurAPI.compile(inputText, traceurAPI.closureOptions(), inputFile);

    test(goldenFile, function() {
      assert.equal(actualText, goldenText);
    });
  });

  test('fails for export *', function() {
    assert.throws(
        function() {
          traceurAPI.compile('export * from "./foo.js";',
                             traceurAPI.closureOptions());
        },
        /Closure modules.*do not support "export \*/);
  });
});
