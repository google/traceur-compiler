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
  filename = path.join('../src/', filename);
  var script = fs.readFileSync(filename, 'utf8');
  if (!script) {
    throw new Error('Failed to import ' + filename);
  }
  eval.call(global, script);
}

/**
 * Show a failure message for the given script.
 */
function failScript(script, message) {
  console.log('\x1B[31mFAIL\x1B[0m ' + script);
  console.log('     ' + message);
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
      fail('Function should have thrown and did not.');
    } catch (e) {
      // Do nothing.
    }
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
  var script = fs.readFileSync(filePath, 'utf8');
  if (!script) {
    failScript(filePath, 'Could not read file.');
    return false;
  }

  var reporter = new traceur.util.ErrorReporter();
  var sourceFile = new traceur.syntax.SourceFile(filePath, script);
  var tree = traceur.codegeneration.Compiler.compileFile(reporter, sourceFile);

  if (reporter.hadError()) {
    failScript(filePath, 'Unexpected compile error in script.');
    return false;
  }

  var javascript = traceur.codegeneration.ParseTreeWriter.write(tree, false);

  try {
    testScriptInContext(javascript);
    return true;
  } catch (e) {
    if (e instanceof UnitTestError) {
      failScript(filePath, e.message);
    } else if (e instanceof SyntaxError) {
      failScript(filePath, 'Compiled to invalid Javascript. Source:\n\n     ' +
          javascript.trim().replace(/\n/g, '\n     ') + '\n\n' +
          '     ' + e.toString());
    } else {
      failScript(filePath, 'Unexpected exception:\n' + e.toString());
    }
  }

  return false;
}

function UnitTestError(message) {
  this.message = message;
}

/**
 * Feature scripts are evaluated in the context of this function, so it contains
 * the functions that the scripts need access to.
 */
function testScriptInContext(javascript) {
  // Define this so that scripts that use the DOM know not to run.
  var IN_BROWSER = false;

  // TODO(rnystrom): Hack. Don't let Traceur spew all over our beautiful
  // test results.
  var console = {
    log: function() {},
    info: function() {},
    error: function() {}
  };

  eval(javascript);
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
      tests++;
      if (testScript(filePath)) passes++;
    }
  }
}

// Allow traceur.js to use importScript.
global.importScript = importScript;

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
runFeatureScripts('feature');

if (passes == tests) {
  console.log('Passed all \x1B[32m' + tests + '\x1B[0m tests.');
} else {
  console.log();
  console.log('Passed \x1B[32m' + passes + '\x1B[0m and failed \x1B[31m' +
      (tests - passes) + '\x1B[0m out of ' + tests + ' tests.');
}
