var fs = require('fs');
var path = require('path');

/**
 * Reads a script and eval's it into the global scope.
 * TODO: this is needed for now because of how our scripts are designed.
 * Change this once we have a module system.
 * @param {string} filename
 */
function importScript(filename) {
  // TODO(rnystrom): Hack. Assumes this is being run from a sibling of src/.
  filename = path.join(__dirname, '../src/', filename);
  var script = fs.readFileSync(filename, 'utf8');
  if (!script) {
    throw new Error('Failed to import ' + filename);
  }
  ('global', eval)('"use strict";' + script);
}

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
  },

  assertNoOwnProperties: function(o) {
    var m = Object.getOwnPropertyNames(o);
    if (m.length) {
      fail('Unexpected members found:' + m.join(', '));
    }
  },

  assertHasOwnProperty: function(o) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i ++) {
      var m = args[i];
      if (!o.hasOwnProperty(m)) {
        fail('Expected member ' + m + ' not found.');
      }
    }
  },

  assertLacksOwnProperty: function(o) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i ++) {
      var m = args[i];
      if (o.hasOwnProperty(m)) {
        fail('Unxpected member ' + m + ' found.');
      }
    }
  },

  assertArrayEquals: function(expected, actual) {
    assertEquals(JSON.stringify(expected, null, 2),
                 JSON.stringify(actual, null, 2));
  }
};

/**
 * Load, compile, and execute the feature script at the given path.
 */
function testScript(filePath) {
  var source = fs.readFileSync(filePath, 'utf8');
  if (!source) {
    failScript(filePath, 'Could not read file.');
    return false;
  }

  var onlyInBrowser = false;
  var skip = false;
  var shouldCompile = true;
  var expectedErrors = [];
  forEachPrologLine(source, function(line) {
    var m;
    if (line.indexOf('// Only in browser.') === 0) {
      onlyInBrowser = true;
    } else if (line.indexOf('// Should not compile.') === 0) {
      shouldCompile = false;
    } else if (line.indexOf('// Skip.') === 0) {
      skip = true;
    } else if ((m = /\/\ Options:\s*(.+)/.exec(line))) {
      traceur.options.fromString(m[1]);
    } else if ((m = /\/\/ Error:\s*(.+)/.exec(line))) {
      expectedErrors.push(m[1]);
    }
  });

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
      traceur.strictGlobalEval(javascript);
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

      tests++;
      if (testScript(filePath))
        passes++;
    }
  }
}

// Allow traceur.js to use importScript.
global.traceurImportScript = importScript;

// Add assert methods to global so that our FreeVariableChecker does not think
// they are undefined.
for (var key in asserts) {
  global[key] = asserts[key];
}

// Load the compiler.
importScript('traceur.js');

// Run all of the feature scripts.
var tests  = 0;
var passes = 0;
runFeatureScripts(path.join(__dirname, 'feature'));

clearLastLine();
if (passes == tests) {
  print('Passed all ' + green(tests) + ' tests.\n');
} else {
  print('\nPassed ' + green(passes) + ' and failed ' + red(tests - passes) +
        ' out of ' + tests + ' tests.\n');
}
