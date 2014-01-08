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
  var uuid = require('node-uuid');
  var exec = require('child_process').exec;

  var tempFileName;

  teardown(function() {
    if (fs.existsSync(tempFileName))
      fs.unlinkSync(tempFileName);
    traceur.options.reset();
  });

  function resolve(name) {
    return path.resolve(__dirname, '../../../' + name);
  }

  function executeFileWithRuntime(fileName) {
    var InterceptOutputLoaderHooks = traceur.runtime.InterceptOutputLoaderHooks;
    var Loader = traceur.modules.Loader;

    var source = fs.readFileSync(fileName, 'utf-8');
    var reporter = new traceur.util.TestErrorReporter();
    var loaderHooks = new InterceptOutputLoaderHooks(reporter, fileName);
    var loader = new Loader(loaderHooks);
    loader.script(source, fileName);
    assert.ok(!reporter.hadError(), reporter.errors.join('\n'));
    var output = loaderHooks.transcoded;

    var runtimePath = resolve('bin/traceur-runtime.js');
    var runtime = fs.readFileSync(runtimePath, 'utf-8');
    var context = vm.createContext();
    vm.runInNewContext(runtime + output, context, fileName);

    return context.result;
  }

  test('class', function() {
    var fileName = path.resolve(__dirname, 'resources/class.js');
    var result = executeFileWithRuntime(fileName);
    assert.equal(result, 2);
  });

  test('generator', function() {
    var fileName = path.resolve(__dirname, 'resources/generator.js');
    var result = executeFileWithRuntime(fileName);
    assert.deepEqual(result, [1, 2, 9, 16]);
  });

  test('generator (symbols)', function() {
    var fileName = path.resolve(__dirname, 'resources/generator.js');
    traceur.options.symbols = true;
    var result = executeFileWithRuntime(fileName);
    assert.deepEqual(result, [1, 2, 9, 16]);
  });

  test('compiled modules', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --out ' + tempFileName + ' -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          var result = executeFileWithRuntime(tempFileName);
          assert.equal(result, 'x');
          done();
        });
  });
});
