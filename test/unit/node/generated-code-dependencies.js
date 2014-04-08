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
    return path.resolve(__dirname, '../../../' + name).replace(/\\/g, '/');
  }

  function executeFileWithRuntime(fileName) {
    var InterceptOutputLoaderHooks = traceur.runtime.InterceptOutputLoaderHooks;
    var TraceurLoader = traceur.runtime.TraceurLoader;

    var source = fs.readFileSync(fileName, 'utf-8');
    var reporter = new traceur.util.TestErrorReporter();
    var loaderHooks = new InterceptOutputLoaderHooks(reporter, fileName);
    var loader = new TraceurLoader(loaderHooks);
    loader.script(source);
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
          executeFileWithRuntime(tempFileName);
          assert.equal(global.result, 'x');
          done();
        });
  });

  test('compiled modules inline', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --out ' + tempFileName + ' --modules=inline -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          executeFileWithRuntime(tempFileName);
          assert.equal(global.result, 'x');
          done();
        });
  });

  test('compiled modules instantiate', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-another-x.js');

    exec(executable + ' --out ' + tempFileName + ' --modules=instantiate -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          executeFileWithRuntime(tempFileName);
          var module = System.get('test/unit/node/resources/import-another-x');
          assert.equal(global.result, 17);
          done();
        });
  });


  test('script option per file', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = './unit/node/resources/iAmScript.js';
    exec(executable + ' --out ' + tempFileName + ' --script ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          var source = fs.readFileSync(tempFileName, 'utf-8');
          var result = eval(source);
          assert.equal(result, true);
          done();
        });
  });

  test('script option loads .es file', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = './unit/node/resources/iAmScriptAlso.es';
    exec(executable + ' --out ' + tempFileName + ' --script ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          var source = fs.readFileSync(tempFileName, 'utf-8');
          var result = eval(source);
          assert.equal(result, true);
          done();
        });
  });

  test('compile module dir option AMD', function(done) {
    var executable = 'node ' + resolve('src/node/command.js');
    var inputDir = './unit/node/resources/compile-dir';
    var outDir = './unit/node/resources/compile-amd';
    exec(executable + ' --dir ' + inputDir + ' ' + outDir + ' --modules=amd', function(error, stdout, stderr) {
      assert.isNull(error);
      var fileContents = fs.readFileSync(path.resolve(outDir, 'file.js'));
      var depContents = fs.readFileSync(path.resolve(outDir, 'dep.js'));
      assert.equal(fileContents + '', "define(['./dep'], function($__0) {\n  \"use strict\";\n  var __moduleName = \"./unit/node/resources/compile-dir/file\";\n  if (!$__0 || !$__0.__esModule)\n    $__0 = {'default': $__0};\n  var q = $traceurRuntime.assertObject($__0).q;\n  var p = 'module';\n  return {\n    get p() {\n      return p;\n    },\n    __esModule: true\n  };\n});\n");
      assert.equal(depContents + '', "define([], function() {\n  \"use strict\";\n  var __moduleName = \"./unit/node/resources/compile-dir/dep\";\n  var q = 'q';\n  return {\n    get q() {\n      return q;\n    },\n    __esModule: true\n  };\n});\n");
      done();
    });
  });

  test('compile module dir option CommonJS', function(done) {
    var executable = 'node ' + resolve('src/node/command.js');
    var inputDir = './unit/node/resources/compile-dir';
    var outDir = './unit/node/resources/compile-cjs';
    exec(executable + ' --dir ' + inputDir + ' ' + outDir + ' --modules=commonjs', function(error, stdout, stderr) {
      assert.isNull(error);
      var fileContents = fs.readFileSync(path.resolve(outDir, 'file.js'));
      var depContents = fs.readFileSync(path.resolve(outDir, 'dep.js'));
      assert.equal(fileContents + '', "\"use strict\";\nObject.defineProperties(exports, {\n  p: {get: function() {\n      return p;\n    }},\n  __esModule: {value: true}\n});\nvar __moduleName = \"./unit/node/resources/compile-dir/file\";\nvar q = $traceurRuntime.assertObject(require('./dep')).q;\nvar p = 'module';\n");
      assert.equal(depContents + '', "\"use strict\";\nObject.defineProperties(exports, {\n  q: {get: function() {\n      return q;\n    }},\n  __esModule: {value: true}\n});\nvar __moduleName = \"./unit/node/resources/compile-dir/dep\";\nvar q = 'q';\n");
      done();
    });
  })
});
