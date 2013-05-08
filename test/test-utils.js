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

(function(exports) {
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
      shouldCompile: true,
      expectedErrors: []
    };
    forEachPrologLine(source, function(line) {
      var m;
      if (line.indexOf('// Only in browser.') === 0) {
        returnValue.onlyInBrowser = true;
      } else if (line.indexOf('// Should not compile.') === 0) {
        returnValue.shouldCompile = false;
      } else if (line.indexOf('// Skip.') === 0) {
        returnValue.skip = true;
      } else if ((m = /\/\ Options:\s*(.+)/.exec(line))) {
        traceur.options.fromString(m[1]);
      } else if ((m = /\/\/ Error:\s*(.+)/.exec(line))) {
        returnValue.expectedErrors.push(m[1]);
      }
    });
    return returnValue;
  }

  var assert = chai.assert;

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
    assert.equal(JSON.stringify(expected, null, 2),
                 JSON.stringify(actual, null, 2));
  }

  function fail(message) {
    throw new chai.AssertionError({message: message});
  }

  function assertThrows(fn) {
    try {
      fn();
    } catch (e) {
      // Do nothing.
      return e;
    }
    fail('Function should have thrown and did not.');
  }

  function runCode(code, name) {
    try {
      ('global', eval)(code);
    } catch (e) {
      fail('Error running compiled output for : ' + name + '\n' + e + '\n' +
           code);
    }
  }

  function featureTest(name, url, loader, urlOptions) {

    teardown(function() {
      traceur.options.reset();
    });

    var source;

    test(name, function(done) {
      loader.load(url, function(data) {
        source = data;
        doTest(done);
      }, function() {
        fail('Load error');
        done();
      });
    });

    function doTest(done) {
      traceur.options.debug = true;
      traceur.options.freeVariableChecker = true;
      traceur.options.validate = true;

      var options = parseProlog(source);
      var skip = options.skip;
      var shouldCompile = options.shouldCompile;
      var expectedErrors = options.expectedErrors;

      try {
        var reporter = new traceur.util.TestErrorReporter();
        var sourceFile = new traceur.syntax.SourceFile(name, source);

        // TODO(arv): We really need a better way to generate unique names that
        // works across multiple projects.
        var project = new traceur.semantics.symbols.Project(url);
        project.identifierGenerator.identifierIndex = Date.now();
        var tree = traceur.codegeneration.Compiler.compileFile(reporter,
                                                               sourceFile,
                                                               url,
                                                               project);
        var code = traceur.outputgeneration.TreeWriter.write(tree);

        if (!shouldCompile) {
          assert.isTrue(reporter.hadError(),
              'Expected error compiling ' + name + ', but got none.');

          var missingExpectations = expectedErrors.forEach(function(expected) {
            assert.isTrue(reporter.hasMatchingError(expected),
                          'Missing expected error: ' + expected);
          });

          skip = true;
        }

        var CloneTreeTransformer = traceur.codegeneration.CloneTreeTransformer;

        if (!skip) {
            if (reporter.hadError()) {
              fail('Error compiling ' + name + '.\n' +
                   reporter.errors.join('\n'));
              return;
            }
            if (urlOptions.testClone === 'true') {
              var clone = CloneTreeTransformer.cloneTree(tree);
              code = traceur.outputgeneration.TreeWriter.write(tree);
              var cloneCode = traceur.outputgeneration.TreeWriter.write(clone);
              assert.equal(code, cloneCode);
            } else {
              // Script compiled, so run it.
              runCode(code, name);
            }
        }
      } finally {
        traceur.options.reset();
      }

      done();
    }
  }

  function featureSuite(testList, loader, options) {
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
            featureTest(tuple.name,
                        'feature/' + tuple.path,
                        loader,
                        options);
          });
        });
      }
    });
  }

  var g = typeof global !== 'undefined' ? global : exports;

  g.assert = assert;
  g.assertArrayEquals = assertArrayEquals;
  g.assertHasOwnProperty = assertHasOwnProperty;
  g.assertLacksOwnProperty = assertLacksOwnProperty;
  g.assertNoOwnProperties = assertNoOwnProperties;
  g.assertThrows = assertThrows;
  g.fail = fail;

  exports.parseProlog = parseProlog;
  exports.featureSuite = featureSuite;

})(typeof exports !== 'undefined' ? exports : this);
