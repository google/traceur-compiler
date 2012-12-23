// Copyright 2012 Google Inc.
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

var fs = require('fs');
var path = require('path');
var testUtil = require('./test-utils.js');

/**
 * Show a failure message for the given script.
 */
function failScript(script, message) {
  clearLastLine();
  print(red('FAIL ') + script + '\n     ' + message + '\n\n');
}

// Define some rudimentary versions of the JSUnit assertions that the
// feature tests use.
var asserts = {

  fail: function(message) {
    throw new UnitTestError(message);
  },

  assertEquals: function(expected, actual) {
    if (actual !== expected) {
      fail('Expected ' + expected + ' but was ' + actual + '.');
    }
  },

  assertNotEquals: function(expected, actual) {
    if (actual === expected) {
      fail('Expected ' + expected + ' to not be ' + actual + '.');
    }
  },

  assertNotNull: function(actual) {
    if (actual === null) {
      fail('Unexpected null.');
    }
  },

  assertFalse: function(actual) {
    assertEquals(false, actual);
  },

  assertTrue: function(actual) {
    assertEquals(true, actual);
  },

  assertUndefined: function(actual) {
    assertEquals(undefined, actual);
  },

  assertThrows: function (fn) {
    try {
      fn();
    } catch (e) {
      // Do nothing.
      return;
    }
    fail('Function should have thrown and did not.');
  }
};

/**
 * Load, compile, and execute the feature script at the given path.
 */
function testScript(filePath) {
  var source = fs.readFileSync(filePath, 'utf8');
  var options = testUtil.parseProlog(source);
  var onlyInBrowser = options.onlyInBrowser;
  var skip = options.skip;
  var shouldCompile = options.shouldCompile;
  var expectedErrors = options.expectedErrors;

  if (skip || onlyInBrowser) {
    return true;
  }

  try {
    silenceConsole();

    var reporter = new traceur.util.TestErrorReporter();
    var sourceFile = new traceur.syntax.SourceFile(filePath, source);
    var tree = traceur.codegeneration.Compiler.compileFile(reporter,
                                                           sourceFile,
                                                           filePath);

    if (!shouldCompile) {
      if (!reporter.hadError()) {
        // Script should not compile.
        failScript(filePath, 'Compile error expected.');
        return false;
      }

      var missingExpectations = expectedErrors.filter(function(expected) {
        return !reporter.hasMatchingError(expected);
      });
      if (missingExpectations.length) {
        failScript(filePath, 'Expected error missing.');
        print('Expected errors:\n' + expectedErrors.join('\n') + '\n\n');
        print('Actual errors:\n' + red(reporter.errors.join('\n')) + '\n\n');

        return false;
      }
      return true;
    }

    if (reporter.hadError()) {
      failScript(filePath, 'Unexpected compile error in script.');
      print(red(reporter.errors.join('\n')) + '\n\n');
      return false;
    }

    var TreeWriter = traceur.outputgeneration.TreeWriter;
    var javascript = TreeWriter.write(tree, false);

    try {
      ('global', eval)(javascript);
      var CloneTreeTransformer = traceur.codegeneration.CloneTreeTransformer;
      var cloneTree = CloneTreeTransformer.cloneTree(tree);
      var cloneGeneratedSource = TreeWriter.write(cloneTree);
      assertEquals(javascript, cloneGeneratedSource);
      return true;
    } catch (e) {
      if (e instanceof UnitTestError) {
        failScript(filePath, e.message);
      } else if (e instanceof SyntaxError) {
        failScript(filePath,
            'Compiled to invalid Javascript. Source:\n\n     ' +
            javascript.trim().replace(/\n/g, '\n     ') + '\n\n' +
            '     ' + e);
      } else {
        failScript(filePath, 'Unexpected exception:\n' + e);
      }
    }

  } finally {
    traceur.options.reset();
    restoreConsole();
  }

  return false;
}

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

var originalConsole;

function silenceConsole() {
  // TODO(rnystrom): Hack. Don't let Traceur spew all over our beautiful
  // test results.
  if (originalConsole)
    throw new Error('Unbalanced call to silenceConsole');

  originalConsole = {
    log: console.log,
    info: console.info,
    error: console.error
  };

  console.log = console.info = console.error = function() {};
}

function restoreConsole() {
  if (!originalConsole)
    throw new Error('Unbalanced call to restoreConsole');

  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.error = originalConsole.error;
  originalConsole = null;
}

function UnitTestError(message) {
  this.message = message;
}

function print(s) {
  process.stdout.write(s);
}

function green(s) {
  return '\x1B[32m' + s + '\x1B[0m';
}

function red(s) {
  return '\x1B[31m' + s + '\x1B[0m';
}

function clearLastLine() {
  print('\x1B[1A\x1B[K');
}

/**
 * Recursively walk the "feature" directory and run each feature script found.
 */
function runFeatureScripts(dir) {
  var contents = fs.readdirSync(dir);
  for (var i = 0; i < contents.length; i++) {
    var filePath = path.join(dir, contents[i]);
    var stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      runFeatureScripts(filePath);
    } else if (path.extname(filePath) == '.js') {
      clearLastLine();
      if (passes === tests) {
        print('Passed ' + green(passes) + ' so far. Testing: ' + filePath);
      } else {
        print('Passed ' + green(passes) + ' and failed ' +
              red(tests - passes) + ' Testing: ' + filePath);
      }
      print('\n');

      if (errslast && errslast.indexOf(filePath) >= 0)
        continue;

      tests++;
      if (testScript(filePath))
        passes++;

      if (tests - passes > errsnew.length)
        errsnew.push(filePath);
    }
  }
}

// Add assert methods to global so that our FreeVariableChecker does not think
// they are undefined.
for (var key in asserts) {
  global[key] = asserts[key];
}
global.assertNoOwnProperties = testUtil.assertNoOwnProperties;
global.assertHasOwnProperty = testUtil.assertHasOwnProperty;
global.assertLacksOwnProperty = testUtil.assertLacksOwnProperty;
global.assertArrayEquals = testUtil.assertArrayEquals;


// Load the compiler.
require('../src/traceur-node.js');

print('\n');

// Run all of the feature scripts.
var tests  = 0;
var passes = 0;

// errsfile is an optional argument that activates the following behavior:
//
// if errsfile exists
//   run all tests in errsfile.
//   if anything failed, and failfast flag is set
//     write to errsfile.
//     immediately fail and exit.
//
// run the full test suite, excluding those already run.
// if anything failed
//   write to errsfile.
// else
//   delete errsfile.
var flags;
var cmdName = path.basename(process.argv[1]);
try {
  flags = new (require('commander').Command)(cmdName);
} catch (ex) {
  console.error('Commander.js is required for this to work. To install it ' +
                'run:\n\n  npm install commander\n');
  process.exit(1);
}
flags.setMaxListeners(100);
flags.option('--errsfile <FILE>', 'path to the error file');
flags.option('--failfast', 'exit if anything from the error file failed');
flags.parse(process.argv);

var errsfile = flags.errsfile;
var errsnew = [];
var errslast;

if (errsfile && fs.existsSync(errsfile)) {
  print('Using error file \'' + errsfile + '\' ...\n\n');
  errslast = JSON.parse(fs.readFileSync(errsfile, 'utf8'));
  errslast.forEach(function(f) {
    tests++;
    if (testScript(f))
      passes++;

    if (tests - passes > errsnew.length)
      errsnew.push(f);
  });
} else {
  print('\n');
}

if (!flags.failfast || passes == tests)
  runFeatureScripts(path.join(__dirname, 'feature'), errsnew);

clearLastLine();
if (passes == tests) {
  print('Passed all ' + green(tests) + ' tests.\n');

  if (errsfile && fs.existsSync(errsfile)) {
    print('Removing error file \'' + errsfile + '\' ...\n');
    fs.unlink(errsfile);
  }
} else {
  print('\nPassed ' + green(passes) + ' and failed ' + red(tests - passes) +
        ' out of ' + tests + ' tests.\n');

  if (errsnew.length && errsfile) {
    print('Writing error file \'' + errsfile + '\' ...\n');
    fs.writeFileSync(errsfile, JSON.stringify(errsnew, null, 2), 'utf8');
  }
}
