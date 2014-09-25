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

suite('context test', function() {

  var vm = require('vm');
  var fs = require('fs');
  var path = require('path');
  var uuid = require('node-uuid');
  var exec = require('child_process').exec;
  var nodeLoader = require('../../../src/node/nodeLoader.js');

  var tempFileName;
  var tempMapName;

  teardown(function() {
    if (fs.existsSync(tempFileName))
      fs.unlinkSync(tempFileName);
    if (tempMapName && fs.existsSync(tempMapName))
      fs.unlinkSync(tempMapName);
    tempMapName = null;
    traceur.options.reset();
  });

  function resolve(name) {
    return path.resolve(__dirname, '../../../' + name).replace(/\\/g, '/');
  }

  function executeFileWithRuntime(fileName, options, debug) {
    var TraceurLoader = traceur.runtime.TraceurLoader;
    var loader = new TraceurLoader(nodeLoader);
    var source = fs.readFileSync(fileName, 'utf-8');
    var metadata = {traceurOptions: options};
    return loader.script(source, {metadata: metadata}).then(function() {
      var output = metadata.transcoded;

      var runtimePath = resolve('bin/traceur-runtime.js');
      var runtime = fs.readFileSync(runtimePath, 'utf-8');
      var context = vm.createContext();

      context.console = console;
      if (debug)
        context.debugGenerated = true;

      vm.runInNewContext(runtime + output, context, fileName);

      return context.result;
    });
  }

  // If the test fails, echo debug info.
  function logOnError(command, error, stdout, stderr) {
    if (error) {
      console.log('command fails: \'' + command + '\'');
      console.error(error);
      console.log('stdout', stdout);
      console.log('stderr', stderr);
    }
  }

  test('class', function(done) {
    var fileName = path.resolve(__dirname, 'resources/class.js');
    executeFileWithRuntime(fileName).then(function(value) {
      assert.equal(value, 2);
      done();
    }).catch(done);
  });

  test('generator', function(done) {
    var fileName = path.resolve(__dirname, 'resources/generator.js');
    var options = {
      generatorComprehension: true
    };
    executeFileWithRuntime(fileName, options).then(function(value) {
      assert.deepEqual(value, [1, 2, 9, 16]);
      done();
    }).catch(done);
  });

  test('generator (symbols)', function(done) {
    var fileName = path.resolve(__dirname, 'resources/generator.js');
    var options = {
      generatorComprehension: true,
      symbols: true
    };
    executeFileWithRuntime(fileName, options).then(function(value) {
      assert.deepEqual(value, [1, 2, 9, 16]);
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

  test('compiled modules with --source-maps', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --source-maps --out ' + tempFileName + ' -- ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          tempMapName = tempFileName.replace('.js','') + '.map';
          var map = fs.readFileSync(tempMapName, 'utf-8');
          assert(map, 'contains a source map');
          done();
        });
  });

  test('compiled modules with --source-maps and sourceroot', function(done) {
    tempFileName = resolve('./out/sourceroot-test.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');
    var commandLine = executable + ' --source-maps --out ' +
        tempFileName + ' -- ' + inputFileName;
    exec(commandLine, function(error, stdout, stderr) {
      assert.isNull(error);
      var transcoded = fs.readFileSync(tempFileName, 'utf-8');
      var m = /\/\/#\s*sourceMappingURL=(.*)/.exec(transcoded);
      var sourceMappingURL = m[1];
      assert(sourceMappingURL === 'sourceroot-test.map',
          'has the correct sourceMappingURL');
      tempMapName = tempFileName.replace('.js','') + '.map';
      var map = JSON.parse(fs.readFileSync(tempMapName, 'utf-8'));
      var actualSourceRoot = map.sourceRoot;
      // Trailing slash as in the example,
      // https://github.com/mozilla/source-map
      assert.equal(actualSourceRoot, resolve('./out') + '/',
          'has the correct sourceroot');
      var foundInput = map.sources.some(function(name) {
        return inputFileName === path.resolve(actualSourceRoot, name);
      });
      assert(foundInput,
          'the inputFileName is one of the sourcemap sources');
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
          executeFileWithRuntime(tempFileName).then(function() {
            assert.equal(global.result, 'x');
            done();
          }).catch(done);
        });
  });

  test('working dir doesn\'t change when recursive compiling', function (done) {
    var recursiveCompile = require('../../../src/node/recursiveModuleCompile')
      .recursiveModuleCompileToSingleFile;
    tempFileName = resolve(uuid.v4() + '.js');
    var inputFileName = resolve('test/unit/node/resources/import-x.js');
    var rootSources = [{
      type: 'module',
      name: inputFileName
    }];
    var cwd = process.cwd();
    traceur.System.baseURL = cwd;
    recursiveCompile(tempFileName, rootSources, traceur.options)
      .then(function () {
        assert.equal(process.cwd(), cwd);
        done();
      }).catch(done);
  });

  test('script option per file', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFileName = './unit/node/resources/iAmScript.js';
    exec(executable + ' --out ' + tempFileName + ' --script ' + inputFileName,
        function(error, stdout, stderr) {
          assert.isNull(error);
          var source = fs.readFileSync(tempFileName, 'utf-8');
          var value = eval(source);
          assert.equal(value, true);
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

  test('compiled modules mix inline & script', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var scriptFileName = './unit/node/resources/scriptUsesModuleGlobal.js';
    var inlineFileName = './unit/node/resources/moduleSetsGlobal.js';
    var command = executable + ' --out ' + tempFileName +
      ' --modules=inline ' + inlineFileName + ' --script ' + scriptFileName;
    exec(command,
        function(error, stdout, stderr) {
          logOnError(command, error, stdout, stderr);
          assert.isNull(error);
          var source = fs.readFileSync(tempFileName, 'utf-8');
          executeFileWithRuntime(tempFileName).then(function() {
            assert.equal(global.aGlobal, 'iAmGlobal');
            ('global', eval)(source);
            assert.equal(global.sandwich, 'iAmGlobal pastrami');
            done();
          }, true).catch(done);
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
          var value = eval(source);
          assert.equal(value, true);
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
      assert.equal(fileContents + '', "define(['./dep'], function($__0) {\n  \"use strict\";\n  if (!$__0 || !$__0.__esModule)\n    $__0 = {default: $__0};\n  var q = $__0.q;\n  var p = 'module';\n  return {\n    get p() {\n      return p;\n    },\n    __esModule: true\n  };\n});\n");
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
      assert.equal(fileContents + '', "\"use strict\";\nObject.defineProperties(exports, {\n  p: {get: function() {\n      return p;\n    }},\n  __esModule: {value: true}\n});\nvar $__dep__;\nvar q = ($__dep__ = require(\"./dep\"), $__dep__ && $__dep__.__esModule && $__dep__ || {default: $__dep__}).q;\nvar p = 'module';\n");
      assert.equal(depContents + '', "\"use strict\";\nObject.defineProperties(exports, {\n  q: {get: function() {\n      return q;\n    }},\n  __esModule: {value: true}\n});\nvar q = 'q';\n");
      done();
    });
  })
});
