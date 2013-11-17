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

suite('tree writer', function() {

  var fs = require('fs');
  var path = require('path');

  function parseFileAsModule(file) {
    var reporter = new traceur.util.TestErrorReporter();
    var parser = new traceur.syntax.Parser(reporter, file);
    var tree = parser.parseModule();
    return traceur.outputgeneration.TreeWriter.write(tree);
  }

  function testWriteModule(resouceName) {
    test(resouceName, function() {
      var fileName = path.resolve(__dirname, resouceName);
      var source = fs.readFileSync(fileName, 'utf-8');
      var file = new traceur.syntax.SourceFile(fileName, source);
      var result = parseFileAsModule(file);
      assert.equal(result, source);
    });
  }

  testWriteModule('resources/export-default.js');
  testWriteModule('resources/export-default-class.js');

});
