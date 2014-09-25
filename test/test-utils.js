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

  var reDirectoryResources = /([^\s]*?[\/\\]Modules[\/\\][^:]*)\:/;

  function parseProlog(source) {
    var returnValue = {
      onlyInBrowser: false,
      skip: false,
      shouldCompile: true,
      expectedErrors: [],
      async: false
    };
    forEachPrologLine(source, function(line) {
      var m;
      if (line.indexOf('// Only in browser.') === 0) {
        returnValue.onlyInBrowser = true;
      } else if (line.indexOf('// Should not compile.') === 0) {
        returnValue.shouldCompile = false;
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
  function assertArrayEquals(expected, actual) {
    assert.equal(JSON.stringify(actual, null, 2),
                 JSON.stringify(expected, null, 2));
  }

  function fail(message) {
    throw new chai.AssertionError(message);
  }

  function hasMatchingError(expected, actualErrors, pathRe) {
    var m;
    if (!pathRe || !(m = pathRe.exec(expected)))
      return actualErrors.some(function(error) {
        return error.indexOf(expected) !== -1;
      });

    var expectedPath = m[1];
    var expectedNonPath =
        expected.replace(new RegExp(expectedPath, 'g'), '<PATH>');

    return actualErrors.some(function (error) {
      var m = pathRe.exec(error);
      if (!m)
        return false;

      var actualPath = m[1];
      var actualNonPath = error.replace(new RegExp(actualPath, 'g'), '<PATH>');
      return actualNonPath.indexOf(expectedNonPath) !== -1;
    });
  }

  var Options = traceur.get('./Options').Options;

  function setOptions(load, options) {
    var traceurOptions = new Options(options.traceurOptions);
    traceurOptions.debug = true;
    traceurOptions.validate = true;
    load.metadata.traceurOptions = traceurOptions;
  }

  function featureTest(name, url, fileLoader) {

    teardown(function() {
      traceur.options.reset();
    });

    test(name, function(done) {
      var baseURL = './';
      var options;
      function translateSynchronous(load) {
        var source = load.source;
        // Only top level file can set options.
        if (!options)
          options = parseProlog(source);

        if (options.skip)
          return '';

        if (options.async) {
          global.done = function(ex) {
            handleShouldCompile(ex);
            done(ex);
          };
        }

        setOptions(load, options);
        return source;
      }

      var moduleLoader = new traceur.runtime.TraceurLoader(fileLoader, baseURL);

      moduleLoader.translate = function(load) {
        return new Promise(function(resolve, reject){
          resolve(translateSynchronous(load));
        });
      }

      function handleShouldCompile(error) {
        if (!options.shouldCompile) {
          assert.isTrue(error !== undefined,
              'Expected error compiling ' + name + ', but got none.');
          var actualErrors = error.errors || [error];
          actualErrors = actualErrors.map(function(error) {
            return error + '';
          });
          options.expectedErrors.forEach(function(expected, index) {
            assert.isTrue(
                hasMatchingError(expected, actualErrors, reDirectoryResources),
                'Missing expected error: ' + expected +
                '\nActual errors:\n' + actualErrors);
          });
        }
      }

      function handleSuccess(result) {
        if (options.skip) {
          done();
          return;
        }

        if (options.async)
          return;

        handleShouldCompile();
        done();
      }

      function handleFailure(error) {
        handleShouldCompile(error);
        if (options.shouldCompile) {
          done(error)
        } else {
          done();
        }
      }

      if (/\.module\.js$/.test(url)) {
        moduleLoader.import(url.replace(/\.js$/,''), {}).then(handleSuccess,
            handleFailure).catch(done);
      } else {
        moduleLoader.loadAsScript(url, {}).then(handleSuccess,
          handleFailure).catch(done);
      }
    });
  }

  function cloneTest(name, url, loader) {
    teardown(function() {
      traceur.options.reset();
    });

    function doTest(source) {
      var options = parseProlog(source);
      if (options.skip || !options.shouldCompile) {
        return;
      }

      traceur.options.reset();
      if (options.traceurOptions)
        traceur.options.setFromObject(options.traceurOptions);

      var reporter = new traceur.util.CollectingErrorReporter();

      function parse(source) {
        var file = new traceur.syntax.SourceFile(name, source);
        var parser = new traceur.syntax.Parser(file, reporter);
        var isModule = /\.module\.js$/.test(url);
        if (isModule)
          return parser.parseModule();
        else
          return parser.parseScript();
      }

      var tree = parse(source);

      if (reporter.hadError()) {
        fail('Error compiling ' + name + '.\n' +
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
      }, function() {
        fail('Load error');
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
            featureTest(tuple.name, 'feature/' + tuple.path, loader);
          });
        });
      }
    });

    suite('Clone Tree Tests', function() {
      for (var suiteName in tree) {
        suite(suiteName, function() {
          tree[suiteName].forEach(function(tuple) {
            cloneTest(tuple.name, 'feature/' + tuple.path, loader);
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
   typeof global !== 'undefined' ? global : this);
