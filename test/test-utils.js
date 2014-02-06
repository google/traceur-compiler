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

  var reDirectoryResources = /'([^\s]*?\/resources\/[^']*)'/;

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
        traceur.options.fromString(m[1]);
      } else if ((m = /\/\/ Error:\s*(.+)/.exec(line))) {
        var errLine = m[1];
        var resolvedError = errLine.replace(reDirectoryResources, function(match, p1) {
          return '\'' + System.normalize(p1) + '\'';
        });
        returnValue.expectedErrors.push(resolvedError);
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

  function runCode(code, name) {
    try {
      ('global', eval)(code);
    } catch (e) {
      fail('Error running compiled output for : ' + name + '\n' + e + '\n' +
           code);
    }
  }

  function featureTest(name, url, loader) {

    teardown(function() {
      traceur.options.reset();
    });

    test(name, function(done) {
      traceur.options.debug = true;
      traceur.options.freeVariableChecker = true;
      traceur.options.validate = true;

      var reporter = new traceur.util.TestErrorReporter();
      var LoaderHooks = traceur.runtime.LoaderHooks;
      var loaderHooks = new LoaderHooks(reporter, './', loader);

      // TODO(jjb): TestLoaderHooks extends LoaderHooks. But this file is ES5.
      var options;
      loaderHooks.translate = function(source) {
        // Only top level file can set options.
        if (!options)
          options = parseProlog(source);

        if (options.skip)
          return '';

        if (options.async) {
          global.done = function() {
            handleShouldCompile();
            done();
          };
        }

        return source;
      }

      var moduleLoader = new traceur.runtime.TraceurLoader(loaderHooks);

      function handleShouldCompile() {
        if (!options.shouldCompile) {
          assert.isTrue(reporter.hadError(),
              'Expected error compiling ' + name + ', but got none.');

          options.expectedErrors.forEach(function(expected) {
            assert.isTrue(reporter.hasMatchingError(expected),
                          'Missing expected error: ' + expected +
                          '\nActual errors:\n' +
                          reporter.errors.join('\n'));
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
        handleShouldCompile();
        // TODO(arv): Improve how errors are passed through the module loader.
        if (options.shouldCompile)
          throw reporter.errors[0];
        done();
      }

      if (/\.module\.js$/.test(url)) {
        moduleLoader.import(url.replace(/\.js$/,''), {}).then(handleSuccess,
            handleFailure);
      } else {
        moduleLoader.loadAsScript(url, {}).then(handleSuccess, handleFailure);
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

      var reporter = new traceur.util.TestErrorReporter();

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
             reporter.errors.join('\n'));
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
