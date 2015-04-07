// Copyright 2012 Traceur Authors.
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

(function(exports, global) {

  'use strict';

  function forEachPrologLine(s, f) {
    var inProlog = true;
    for (var i = 0; inProlog && i < s.length; ) {
      var j = s.indexOf('\n', i);
      if (j == -1)
        break;
      if (s[i] === '/' && s[i + 1] === '/') {
        var line = s.slice(i, j);
        f(line);
        i = j + 1;
      } else {
        inProlog = false;
      }
    }
  }

  function parseProlog(source) {
    var returnValue = {
      onlyInBrowser: false,
      skip: false,
      get shouldHaveErrors() {
        return this.expectedErrors.length !== 0;
      },
      expectedErrors: [],
      async: false
    };
    forEachPrologLine(source, function(line) {
      var m;
      if (line.indexOf('// Only in browser.') === 0) {
        returnValue.onlyInBrowser = true;
      } else if (line.indexOf('// Skip.') === 0) {
        returnValue.skip = true;
      } else if (line.indexOf('// Async.') === 0) {
        returnValue.async = true;
      } else if ((m = /\/\ Options:\s*(.+)/.exec(line))) {
        returnValue.traceurOptions = traceur.util.CommandOptions.fromString(m[1]);
      } else if ((m = /\/\/ Error:\s*(.+)/.exec(line))) {
        returnValue.expectedErrors.push(m[1]);
      }
    });
    return returnValue;
  }

  var assert = chai.assert;

  assert.type = function (actual, type) {
    assert.typeOf(actual, type.name);
    return actual;
  };

  function assertNoOwnProperties(o) {
    var m = Object.getOwnPropertyNames(o);
    if (m.length) {
      fail('Unexpected members found:' + m.join(', '));
    }
  }

  function assertHasOwnProperty(o) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i ++) {
      var m = args[i];
      if (!o.hasOwnProperty(m)) {
        fail('Expected member ' + m + ' not found.');
      }
    }
  }

  function assertLacksOwnProperty(o) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i ++) {
      var m = args[i];
      if (o.hasOwnProperty(m)) {
        fail('Unxpected member ' + m + ' found.');
      }
    }
  }

  // Replace the Closure-provided array comparer with our own that doesn't barf
  // because Array.prototype has a __iterator__ method.
  // TODO(jjb): get this from import on unitTests
  function assertArrayEquals(expected, actual) {
    assert.equal(JSON.stringify(actual, null, 2),
                 JSON.stringify(expected, null, 2));
  }

  function fail(message) {
    throw new chai.AssertionError(message);
  }

  function hasMatchingError(expected, actualErrors) {
    // We normally report errors using relative UNIX paths but we have a test
    // that reports a file not found with the following string on Windows.
    //
    // File not found 'c:\src\traceur\test\feature\Modules\resources\no_such_file.js'
    //
    // We therefore replace strings matching '<Windows Path>' with a relative
    // UNIX path instead.
    var pathRe = /'[^']*(?:\\|\/)?(test(?:\\|\/)feature(?:\\|\/)[^']*)'/g;
    return actualErrors.some(function(error) {
      var adjustedError = error.replace(pathRe, function(_, p2) {
        return "'" + p2.replace(/\\/g, '/') + "'";
      });

      return adjustedError.indexOf(expected) !== -1;
    });
  }

  // TODO(arv): Fix this to not depend on traceur.get.
  var Options = traceur.get('./Options.js').Options;
  $traceurRuntime.options = new Options();

  function setOptions(load, prologOptions) {
    var traceurOptions = new Options(prologOptions.traceurOptions);
    traceurOptions.debug = true;
    traceurOptions.validate = true;
    load.metadata.traceurOptions = traceurOptions;
  }

  function featureTest(name, url, fileLoader) {

    test(name, function(done) {
      var baseURL = './';

      var prologOptions;
      function translateSynchronous(load) {
        var source = load.source;
        // Only top level file can set prologOptions.
        if (!prologOptions)
          prologOptions = parseProlog(source);

        if (prologOptions.skip)
          return '';

        if (prologOptions.async) {
          global.done = function(ex) {
            handleExpectedErrors(ex);
            done(ex);
          };
        }
        setOptions(load, prologOptions);
        return source;
      }

      var moduleLoader = new traceur.runtime.TraceurLoader(fileLoader, baseURL);

      moduleLoader.translate = function(load) {
        return new Promise(function(resolve, reject){
          resolve(translateSynchronous(load));
        });
      }

      function handleExpectedErrors(error) {
        if (prologOptions.shouldHaveErrors) {
          assert.isTrue(error !== undefined,
              'Expected error compiling ' + name + ', but got none.');
          var actualErrors = error.errors || [error];
          actualErrors = actualErrors.map(function(error) {
            return error + '';
          });
          prologOptions.expectedErrors.forEach(function(expected, index) {
            assert.isTrue(
                hasMatchingError(expected, actualErrors),
                'Missing expected error: ' + expected +
                '\nActual errors:\n' + actualErrors);
          });
        }
      }

      function handleSuccess(result) {
        if (prologOptions.skip) {
          done();
          return;
        }

        if (prologOptions.async)
          return;

        handleExpectedErrors();
        done();
      }

      function handleFailure(error) {
        handleExpectedErrors(error);
        if (!prologOptions.shouldHaveErrors) {
          done(error)
        } else {
          done();
        }
      }

      if (/\.module\.js$/.test(url)) {
        moduleLoader.import(url, {}).then(handleSuccess,
            handleFailure).catch(done);
      } else {
        moduleLoader.loadAsScript(url, {}).then(handleSuccess,
          handleFailure).catch(done);
      }
    });
  }

  function cloneTest(name, url, loader) {

    function doTest(source) {
      var prologOptions = parseProlog(source);
      if (prologOptions.skip || prologOptions.shouldHaveErrors) {
        return;
      }

      var options = new Options(prologOptions.traceurOptions);

      var reporter = new traceur.util.CollectingErrorReporter();

      function parse(source) {
        var file = new traceur.syntax.SourceFile(name, source);
        var parser = new traceur.syntax.Parser(file, reporter, options);
        var isModule = /\.module\.js$/.test(url);
        if (isModule)
          return parser.parseModule();
        else
          return parser.parseScript();
      }

      var tree = parse(source);

      if (reporter.hadError()) {
        fail('cloneTest Error compiling ' + name + '.\n' +
             reporter.errorsAsString());
        return;
      }

      var CloneTreeTransformer = traceur.codegeneration.CloneTreeTransformer;
      var clone = CloneTreeTransformer.cloneTree(tree);
      var code = traceur.outputgeneration.TreeWriter.write(tree);
      var cloneCode = traceur.outputgeneration.TreeWriter.write(clone);
      assert.equal(code, cloneCode);

      // Parse again to ensure that writer generates valid code.
      clone = parse(cloneCode);
      if (reporter.hadError()) {
        fail('Error compiling generated code for ' + name + '.\n' +
             reporter.errors.join('\n'));
        return;
      }

      cloneCode = traceur.outputgeneration.TreeWriter.write(clone);
      assert.equal(code, cloneCode);
    }

    test(name, function(done) {
      loader.load(url, function(data) {
        doTest(data);
        done();
      }, function(ex) {
        fail('Load error for ' + url, ex.stack || ex);
        done();
      });
    });
  }

  function featureSuite(testList, loader) {
    // Bucket tests.
    var tree = {};
    testList.forEach(function(path) {
      var parts = path.split('/');
      var suiteName = parts.slice(0, -1).join(' ');
      var testName = parts[parts.length - 1];
      if (!tree[suiteName])
        tree[suiteName] = [];
      tree[suiteName].push({name: testName, path: path});
    });

    suite('Feature Tests', function() {
      for (var suiteName in tree) {
        suite(suiteName, function() {
          tree[suiteName].forEach(function(tuple) {
            featureTest(tuple.name, 'test/feature/' + tuple.path, loader);
          });
        });
      }
    });

    suite('Clone Tree Tests', function() {
      for (var suiteName in tree) {
        suite(suiteName, function() {
          tree[suiteName].forEach(function(tuple) {
            cloneTest(tuple.name, 'test/feature/' + tuple.path, loader);
          });
        });
      }
    });
  }

  global.assert = assert;
  global.assertArrayEquals = assertArrayEquals;
  global.assertHasOwnProperty = assertHasOwnProperty;
  global.assertLacksOwnProperty = assertLacksOwnProperty;
  global.assertNoOwnProperties = assertNoOwnProperties;
  global.fail = fail;

  exports.parseProlog = parseProlog;
  exports.featureSuite = featureSuite;

})(typeof exports !== 'undefined' ? exports : this,
   typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
