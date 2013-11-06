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

suite('context test', function() {

  var vm = require('vm');
  var fs = require('fs');
  var path = require('path');

  test('class', function() {
    var reporter = new traceur.util.TestErrorReporter();
    var fileName = path.resolve(__dirname, 'resources/class.js');
    var source = fs.readFileSync(fileName, 'utf-8');
    var file = new traceur.syntax.SourceFile(fileName, source);

    var tree = traceur.codegeneration.Compiler.compileFile(reporter, file);
    assert.ok(!reporter.hadError(), reporter.errors.join('\n'));

    var output = traceur.outputgeneration.TreeWriter.write(tree);

    var context = vm.createContext();
    vm.runInNewContext(output, context, fileName);

    assert.equal(context.result, 2);

  });

});