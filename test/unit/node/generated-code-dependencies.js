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

import {suite, test, assert} from '../../unit/unitTestRunner.js';

suite('context test', function() {

  var vm = require('vm');
  var fs = require('fs');
  var path = require('path');
  var uuid = require('node-uuid');
  var exec = require('child_process').exec;
  var nodeLoader = require('../../../src/node/nodeLoader.js');
  var theDirName = System.dirname(__moduleName);

  var tempFileName;
  var tempMapName;

  teardown(function() {
    if (fs.existsSync(tempFileName))
      fs.unlinkSync(tempFileName);
    if (tempMapName && fs.existsSync(tempMapName))
      fs.unlinkSync(tempMapName);
    tempMapName = null;
  });

  function forwardSlash(s) {
    return s.replace(/\\/g, '/');
  }

  function resolve(name) {
    return forwardSlash(path.resolve(theDirName, '../../../' + name));
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
      // The context does not have the builtins. Add the ones the tests need.
      context.Float32Array = Float32Array;
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
    var fileName = path.resolve(theDirName, 'resources/class.js');
    executeFileWithRuntime(fileName).then(function(value) {
      assert.equal(value, 2);
      done();
    }).catch(done);
  });

  test('generator', function(done) {
    var fileName = path.resolve(theDirName, 'resources/generator.js');
    var options = {
      generatorComprehension: true
    };
    executeFileWithRuntime(fileName, options).then(function(value) {
      assert.deepEqual(value, [1, 2, 9, 16]);
      done();
    }).catch(done);
  });

  test('generator (symbols)', function(done) {
    var fileName = path.resolve(theDirName, 'resources/generator.js');
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
    var inputFilename = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --out ' + tempFileName + ' -- ' + inputFilename,
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
    var inputFilename = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --source-maps --out ' + tempFileName + ' -- ' + inputFilename,
        function(error, stdout, stderr) {
          assert.isNull(error);
          tempMapName = tempFileName + '.map';
          var map = fs.readFileSync(tempMapName, 'utf-8');
          assert(map, 'contains a source map');
          done();
        });
  });

  test('compiled modules with --source-maps and sourceroot', function(done) {
    tempFileName = resolve('./out/sourceroot-test.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = resolve('test/unit/node/resources/import-x.js');
    var commandLine = executable + ' --source-maps --source-root=true --out ' +
        tempFileName + ' -- ' + inputFilename;
    exec(commandLine, function(error, stdout, stderr) {
      assert.isNull(error);
      var transcoded = fs.readFileSync(tempFileName, 'utf-8');
      var m = /\/\/#\s*sourceMappingURL=(.*)/.exec(transcoded);
      assert(m, 'sourceMappingURL appears in the output');
      var sourceMappingURL = m[1];
      assert.equal(sourceMappingURL, 'sourceroot-test.js.map');
      tempMapName = tempFileName + '.map';
      var map = JSON.parse(fs.readFileSync(tempMapName, 'utf-8'));
      var actualSourceRoot = map.sourceRoot;
      // Trailing slash as in the example,
      // https://github.com/mozilla/source-map
      assert.equal(actualSourceRoot, resolve('./out') + '/',
          'has the correct sourceroot');
      var foundInput = map.sources.some(function(name) {
        var resolved = forwardSlash(path.resolve(actualSourceRoot, name));
        if (inputFilename === resolved) {
          // The 'sources' entry is relative
          assert.equal(name.indexOf('.'), 0);
          return true;
        }
      });
      assert(foundInput,
          'the inputFilename is one of the sourcemap sources');
      done();
    });
  });

  test('compiled modules with --source-maps and sourceroot=http://example.com', function(done) {
    tempFileName = resolve('./out/sourceroot-test.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = resolve('test/unit/node/resources/import-x.js');
    var commandLine = executable +
        ' --source-maps --source-root="http://example.com"' +
        ' --out ' + tempFileName + ' -- ' + inputFilename;
    exec(commandLine, function(error, stdout, stderr) {
      assert.isNull(error);
      var transcoded = fs.readFileSync(tempFileName, 'utf-8');
      var m = /\/\/#\s*sourceMappingURL=(.*)/.exec(transcoded);
      assert(m, 'sourceMappingURL appears in the output');
      var sourceMappingURL = m[1];
      var basepath = path.dirname(tempFileName);
      assert.equal(sourceMappingURL, 'sourceroot-test.js.map');
      tempMapName = tempFileName + '.map';
      var map = JSON.parse(fs.readFileSync(tempMapName, 'utf-8'));
      var actualSourceRoot = map.sourceRoot;
      // Trailing slash as in the example,
      // https://github.com/mozilla/source-map
      assert.equal(actualSourceRoot, 'http://example.com',
          'has the correct sourceroot');
      var foundInput = map.sources.some(function(name) {
        var resolved = forwardSlash(path.resolve(basepath, name));
        if (inputFilename === resolved) {
          // The 'sources' entry is relative
          assert.equal(name.indexOf('.'), 0);
          return true;
        }
      });
      assert(foundInput,
          'the inputFilename is one of the sourcemap sources');
      done();
    });
  });

  test('compiled modules with --source-maps and --source-root false', function(done) {
    tempFileName = resolve('./out/sourceroot-test.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = resolve('test/unit/node/resources/import-x.js');
    var commandLine = executable + ' --source-maps --source-root=false' +
     ' --out ' + tempFileName + ' -- ' + inputFilename;
    exec(commandLine, function(error, stdout, stderr) {
      assert.isNull(error);
      var transcoded = fs.readFileSync(tempFileName, 'utf-8');
      var m = /\/\/#\s*sourceMappingURL=(.*)/.exec(transcoded);
      assert(m, 'sourceMappingURL appears in the output');
      var sourceMappingURL = m[1];
      var basepath = path.dirname(tempFileName);
      assert.equal(sourceMappingURL, 'sourceroot-test.js.map');
      tempMapName = tempFileName + '.map';
      var map = JSON.parse(fs.readFileSync(tempMapName, 'utf-8'));
      var actualSourceRoot = map.sourceRoot;
      // Trailing slash as in the example,
      // https://github.com/mozilla/source-map
      assert.equal(undefined, actualSourceRoot, 'has undefined sourceroot');
      var foundInput = map.sources.some(function(name) {
        var resolved = forwardSlash(path.resolve(basepath, name));
        if (inputFilename === resolved) {
          // The 'sources' entry is relative
          assert.equal(name.indexOf('.'), 0);
          return true;
        }
      });
      assert(foundInput,
          'the inputFilename is one of the sourcemap sources');
      done();
    });
  });

  test('compiled modules with --source-maps=inline and sourceroot', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = resolve('test/unit/node/resources/import-x.js');
    var commandLine = executable + ' --source-maps=inline --source-root=true --out ' +
        tempFileName + ' -- ' + inputFilename;
    exec(commandLine, function(error, stdout, stderr) {
      assert.isNull(error);
      var transcoded = fs.readFileSync(tempFileName, 'utf-8');
      var m = /\/\/#\s*sourceMappingURL=data:application\/json;base64,(.*)/.
          exec(transcoded);
      var b64string = m[1];
      assert(b64string, 'expected data: URL');
      var mapText = new Buffer(b64string, 'base64');
      var map = JSON.parse(mapText);
      var actualSourceRoot = map.sourceRoot;
      // Trailing slash as in the example,
      // https://github.com/mozilla/source-map
      assert.equal(actualSourceRoot, resolve('./') + '/',
          'has the correct sourceroot');
      var foundInput = map.sources.some(function(name) {
        return inputFilename ===
            forwardSlash(path.resolve(actualSourceRoot, name));
      });
      assert(foundInput,
          'the inputFilename is one of the sourcemap sources');
      done();
    });
  });

  test('sourceMappingURL from --source-maps=true and deep directories', function(done){
    var deepDirectory = 'test/wiki/CompilingOffline/deepDirectory/';
    var pwd = process.cwd();
    process.chdir(deepDirectory);
    var executable = 'node ../../../../traceur';
    var inputFilename = './src/js/app.js';
    var cmd = executable + ' --source-maps ' +
        '--source-root=false --out ./dist/js/bundle.js ' + inputFilename;
    var child = exec(cmd, function(error, stdout, stderr) {
      assert.isNull(error);
      process.chdir(pwd);
      var tempFileName = resolve(deepDirectory + '/dist/js/bundle.js');
      var transcoded = fs.readFileSync(tempFileName, 'utf-8');
      var m = /\/\/#\s*sourceMappingURL=(.*)/.exec(transcoded);
      assert(m, 'sourceMappingURL appears in the output');
      var sourceMappingURL = m[1];
      var basepath = path.dirname(tempFileName);
      var expected = 'bundle.js.map';
      assert.equal(sourceMappingURL, expected);
      // The map file should be in the same dir as the output file, with
      // the name given in the URL
      tempMapName = path.resolve(path.dirname(tempFileName), sourceMappingURL);
      var map = JSON.parse(fs.readFileSync(tempMapName, 'utf-8'));
      var actualSourceRoot = map.sourceRoot;
      // Trailing slash as in the example,
      // https://github.com/mozilla/source-map
      assert.equal(undefined, actualSourceRoot, 'has undefined sourceroot');
      var absoluteInputFilename = path.resolve(deepDirectory, inputFilename);
      var inputRelativeToOutput =
          path.relative(path.dirname(tempFileName), absoluteInputFilename).replace(/\\/g, '/');
      var foundInput = map.sources.some(function(name) {
        if (inputRelativeToOutput === name) {
          // The 'sources' entry is relative
          assert.equal(name.indexOf('.'), 0);
          return true;
        }
      });
      assert(foundInput, 'the inputFilename '+ inputRelativeToOutput +
          ' is one of the sourcemap sources ' + map.sources.join(','));
      done();
    });
  });

  test('compiled modules sourcemaps=memory', function(done) {
    this.timeout(4000);  // On travis this test takes more than 2s
    var inputFilename = resolve('test/unit/runtime/resources/CallsThrowsError.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var cmd = executable + ' --source-maps=memory ' + inputFilename;
    exec(cmd, function(error, stdout, stderr) {
      var message = error.message.replace(/\\/g, '/');
      var fileLinePos = message.indexOf(
          'test/unit/runtime/resources/throwsErrorES6.js:3');
      assert.notEqual(fileLinePos, -1);
      done();
    });
  });

  test('compiled modules inline', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = resolve('test/unit/node/resources/import-x.js');

    exec(executable + ' --out ' + tempFileName + ' --modules=inline -- ' + inputFilename,
        function(error, stdout, stderr) {
          assert.isNull(error);
          executeFileWithRuntime(tempFileName).then(function() {
            assert.equal(global.result, 'x');
            done();
          }).catch(done);
        });
  });

  test('compiled modules inline with outputLanguage=es6', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = resolve('test/unit/node/resources/import-x.js');
    exec(executable + ' --out ' + tempFileName + ' --modules=inline --outputLanguage=es6 -- ' + inputFilename,
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
    var inputFilename = resolve('test/unit/node/resources/import-x.js');
    var rootSources = [{
      type: 'module',
      name: inputFilename
    }];
    var cwd = process.cwd();
    recursiveCompile(tempFileName, rootSources, new traceur.util.Options())
      .then(function () {
        assert.equal(process.cwd(), cwd);
        done();
      }).catch(done);
  });

  test('script option per file', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = './test/unit/node/resources/iAmScript.js';
    exec(executable + ' --out ' + tempFileName + ' --script ' + inputFilename,
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
    var inputFilename = './test/unit/node/resources/scriptUsesModuleGlobal.js';
    var inputModuleName = './test/unit/node/resources/moduleSetsGlobal.js';
    exec(executable + ' --out ' + tempFileName + ' --module ' + inputModuleName +
        ' --script ' + inputFilename,
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
    var scriptFileName = './test/unit/node/resources/scriptUsesModuleGlobal.js';
    var inlineFileName = './test/unit/node/resources/moduleSetsGlobal.js';
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
    var inputFilename = './test/unit/node/resources/iAmScriptAlso.es';
    exec(executable + ' --out ' + tempFileName + ' --script ' + inputFilename,
        function(error, stdout, stderr) {
          assert.isNull(error);
          var source = fs.readFileSync(tempFileName, 'utf-8');
          var value = eval(source);
          assert.equal(value, true);
          done();
        });
  });

  test('./traceur can mix require() and import', function(done) {
    var cmd = 'node ./traceur --require -- ./test/unit/node/resources/testForRequireAndImport.js';
    exec(cmd, function(error, stdout, stderr) {
      assert.isNull(error);
      assert.equal('we have path and x=x and aNodeExport=intoTraceur\n', stdout);
      done();
    });
  });

  test('./traceur warns if the runtime is missing', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var cmd = 'node ./traceur --modules=commonjs --out ' + tempFileName +
        ' ./src/runtime/generators.js';
    exec(cmd, function(error, stdout, stderr) {
      assert.isNull(error);
      cmd = 'node ' + tempFileName;
      exec(cmd, function(error, stdout, stderr) {
        // FIXME: This test fails if traceur is compiled with proper tail calls
        // as the code that shall display this message depends on the proper
        // tail calls part of the runtime.
        assert.notEqual(error.toString().indexOf('traceur runtime not found'),
            -1, 'The runtime error message should be found');
        done();
      });
    });
  });

  test('./traceur --source-maps can report errors on the correct lines', function(done) {
    this.timeout(4000);  // On travis this test takes more than 2s
    var cmd = 'node ./traceur --source-maps=memory ./test/unit/node/resources/testErrorForSourceMaps.js';
    exec(cmd, function(error, stdout, stderr) {
      var m = /Test error on line ([0-9]*)/.exec(error);
      assert(m && m[1], 'The evaluation should fail with the thrown error');
      assert.notEqual(error.toString().indexOf(':' + m[1] + ':'), -1,
        'The corrent line number should be in the error message');
      done();
    });
  });

  function checkFile(outDir, goldenDir, filename) {
    var actualContents = fs.readFileSync(path.resolve(outDir, filename));
    var actual = actualContents.toString().split('\n');
    var expectedContents = fs.readFileSync(path.resolve(goldenDir, filename));
    var expected = expectedContents.toString().split('\n');
    expected.forEach(function(line, index) {
      assert.equal(line, actual[index]);
    });
  }

  test('compile module dir option AMD', function(done) {
    var executable = 'node ' + resolve('src/node/command.js');
    var inputDir = './test/unit/node/resources/compile-dir';
    var goldenDir = './test/unit/node/resources/golden-amd';
    var outDir = './test/unit/node/out/compile-amd';
    var cmd = executable + ' --dir ' + inputDir + ' ' + outDir + ' --modules=amd';
    exec(cmd, function(error, stdout, stderr) {
      if (error) return done(error);
      checkFile(outDir, goldenDir, 'file.js');
      checkFile(outDir, goldenDir, 'dep.js');
      done();
    });
  });

  test('compile module dir option CommonJS', function(done) {
    var executable = 'node ' + resolve('src/node/command.js');
    var inputDir = './test/unit/node/resources/compile-dir';
    var goldenDir = './test/unit/node/resources/golden-cjs';
    var outDir = './test/unit/node/out/compile-cjs';
    exec(executable + ' --dir ' + inputDir + ' ' + outDir + ' --modules=commonjs', function(error, stdout, stderr) {
      if (error) return done(error);
      checkFile(outDir, goldenDir, 'file.js');
      checkFile(outDir, goldenDir, 'dep.js');
      done();
    });
  });

  test('use a pattern that does not match any source', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = './test/unit/node/resources/*someNonExistentPattern';

    exec(executable + ' --out ' + tempFileName + ' ' + inputFilename,
      function(error, stdout, stderr) {
        done(error);
      });
  });

  test('use a pattern to match sources for compilation', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = './test/unit/node/resources/glob-pattern-?.js';

    exec(executable + ' --out ' + tempFileName + ' ' + inputFilename,
      function(error, stdout, stderr) {
        if (error) return done(error);
        executeFileWithRuntime(tempFileName).then(function() {
          assert.equal(global.someResult, 42);
          assert.equal(global.anotherResult, 17);
          done();
        }).catch(done);
      });
  });

  test('use a pattern and a normal file name to match sources', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var executable = 'node ' + resolve('src/node/command.js');
    var inputFilename = './test/unit/node/resources/glob-pattern-?.js';
    var inputAnotherFile = './test/unit/node/resources/glob-normal.js';

    exec(executable + ' --out ' + tempFileName + ' --modules=inline ' + inputFilename + ' --script ' + inputAnotherFile,
      function(error, stdout, stderr) {
        assert.isNull(error);
        executeFileWithRuntime(tempFileName).then(function() {
          assert.equal(global.someResult, 42);
          assert.equal(global.anotherResult, 17);
          assert.equal(global.normalResult, true);
          done();
        }).catch(done);
      });
  });

  test('compile module dir option CommonJS with source-maps', function(done) {
    var executable = 'node ' + resolve('src/node/command.js');
    var inputDir = './test/unit/node/resources/compile-dir';
    var outDir = './test/unit/node/out/compile-cjs-maps';
    var cmd = executable + ' --source-maps=file --dir ' + inputDir + ' ' + outDir + ' --modules=commonjs';
    exec(cmd, function(error, stdout, stderr) {
      if (error) return done(error);
      var fileMapContents = fs.readFileSync(path.resolve(outDir, 'file.js.map'));
      var depMapContents = fs.readFileSync(path.resolve(outDir, 'dep.js.map'));
      assert(fileMapContents + '');
      assert(depMapContents + '')
      done();
    });
  });

  test('Instantiate output has "use strict" within System.register', function(done) {
    tempFileName = resolve(uuid.v4() + '.js');
    var inputFilename = './test/unit/node/resources/class.js';
    var executable = 'node ' + resolve('src/node/command.js');

    exec(executable + ' --out ' + tempFileName + ' --modules=instantiate ' + inputFilename,
      function (error, stdout, stderr) {
        if (error) return done(error);
        var fileContents = fs.readFileSync(tempFileName).toString();
        assert.isNull(fileContents.match(/^\s*"use strict"/));
        assert.notEqual(fileContents.indexOf('"use strict"'), -1);
        done();
      });
  });

  test('tval uses argv', function(done) {
    var cmd = 'node tval test/unit/node/resources/test_tval.js --arg1 --arg2 arg3';
    exec(cmd, function(error, stdout, stderr) {
      assert.isNull(error);
      assert.equal(stdout, 'args--arg1--arg2arg3\n');
      done();
    });
  });

});
