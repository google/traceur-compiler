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

  function executeFileWithRuntime(fileName, debug) {
    var InterceptOutputLoaderHooks = traceur.runtime.InterceptOutputLoaderHooks;
    var TraceurLoader = traceur.runtime.TraceurLoader;

    var source = fs.readFileSync(fileName, 'utf-8');
    var loaderHooks = new InterceptOutputLoaderHooks(null, fileName);
    var loader = new TraceurLoader(loaderHooks);
    return loader.script(source).then(function() {
      var output = loaderHooks.transcoded;

      var runtimePath = resolve('bin/traceur-runtime.js');
      var runtime = fs.readFileSync(runtimePath, 'utf-8');
      var context = vm.createContext();

      if (debug) {
        context.console = console;
        context.debugGenerated = true;
        console.log(output);
      }

      vm.runInNewContext(runtime + output, context, fileName);

      return context.result;
    });
  }

  test('class', function(done) {
    var fileName = path.resolve(__dirname, 'resources/class.js');
    executeFileWithRuntime(fileName).then(function() {
      assert.equal(result, 2);
      done();
    }).catch(done);
  });

  test('generator', function(done) {
    var fileName = path.resolve(__dirname, 'resources/generator.js');
    executeFileWithRuntime(fileName).then(function() {
      assert.deepEqual(result, [1, 2, 9, 16]);
      done();
    }).catch(done);
  });

  test('generator (symbols)', function(done) {
    var fileName = path.resolve(__dirname, 'resources/generator.js');
    traceur.options.symbols = true;
    executeFileWithRuntime(fileName).then(function() {
      assert.deepEqual(result, [1, 2, 9, 16]);
      done();
    }).catch(done);
  });

  test('compiled modules', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --out ' + tempFileName + ' -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          executeFileWithRuntime(tempFileName).then(function() {
            assert.equal(global.result, 'x');
            done();
          }).catch(done);
        });
  });

  test('compiled modules inline', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --out ' + tempFileName + ' --modules=inline -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          executeFileWithRuntime(tempFileName).then(function() {
            assert.equal(global.result, 'x');
            done();
          }).catch(done);
        });
  });

  test('compiled modules instantiate', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-another-x.js');

    exec(executable + ' --out ' + tempFileName + ' --modules=instantiate -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          executeFileWithRuntime(tempFileName).then(function() {
            System.import('test/unit/node/resources/import-another-x').then(function(module) {
              assert.equal(module.iAmNotScript, true);
              assert.equal(anotherResult, 17);
              done();
            });
          }).catch(done);
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

  test('script depends on module global', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = './unit/node/resources/scriptUsesModuleGlobal.js';
    var inputModuleName = './unit/node/resources/moduleSetsGlobal.js';
    exec(executable + ' --out ' + tempFileName + ' --module ' + inputModuleName +
        ' --script ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          var source = fs.readFileSync(tempFileName, 'utf-8');
          try {
            ('global', eval)(source);
            assert.equal(global.sandwich, 'iAmGlobal pastrami');
            done();
          } catch(ex) {
            done(ex);
          }
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
      assert.equal(fileContents + '', "define(['./dep'], function($__0) {\n  \"use strict\";\n  if (!$__0 || !$__0.__esModule)\n    $__0 = {'default': $__0};\n  var q = $traceurRuntime.assertObject($__0).q;\n  var p = 'module';\n  return {\n    get p() {\n      return p;\n    },\n    __esModule: true\n  };\n});\n");
      assert.equal(depContents + '', "define([], function() {\n  \"use strict\";\n  var q = 'q';\n  return {\n    get q() {\n      return q;\n    },\n    __esModule: true\n  };\n});\n");
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
      assert.equal(fileContents + '', "\"use strict\";\nObject.defineProperties(exports, {\n  p: {get: function() {\n      return p;\n    }},\n  __esModule: {value: true}\n});\nvar q = $traceurRuntime.assertObject(require('./dep')).q;\nvar p = 'module';\n");
      assert.equal(depContents + '', "\"use strict\";\nObject.defineProperties(exports, {\n  q: {get: function() {\n      return q;\n    }},\n  __esModule: {value: true}\n});\nvar q = 'q';\n");
      done();
    });
  })
});
