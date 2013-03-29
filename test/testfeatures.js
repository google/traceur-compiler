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

'use strict';

var fs = require('fs');
var path = require('path');
var testUtil = require('./test-utils.js');
var testList;

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

  assertThrows: function(fn) {
    try {
      fn();
    } catch (e) {
      // Do nothing.
      return e;
    }
    fail('Function should have thrown and did not.');
  },

  assertNotThrows: function(fn) {
    try {
      fn();
    } catch (e) {
      fail('Function should not have thrown.');
    }
  }
};

// Verifies that the reporter reported the expected errors.
// Displays differences between actual and expected errors.
function checkExpectedErrors(reporter, filePath, expectedErrors) {
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

function parseSourceFile(filePath, code, reporter) {
  try {
    var sourceFile = new traceur.syntax.SourceFile(filePath, code);
    var parser = new traceur.syntax.Parser(reporter, sourceFile);
    return parser.parseProgram(true);
  } catch (e) {
    fail('Exception during parse of: ' + filePath + '\n' + code + '\n' + e);
  }
}

function writeTree(filePath, tree, originalCode) {
  try {
    return traceur.outputgeneration.TreeWriter.write(tree, false);
  } catch (e) {
    fail('Exception during write of:' + filePath + '\n' + originalCode +
        '\n\ + e');
  }
}

function compileToTree(filePath, source, reporter) {
  var sourceFile = new traceur.syntax.SourceFile(filePath, source);
  return traceur.codegeneration.Compiler.compileFile(reporter,
                                                     sourceFile,
                                                     filePath);
}

function parseAndWrite(filePath, code, reporter) {
  var tree = parseSourceFile(filePath, code, reporter);
  return writeTree(filePath, tree, code);
}

// Tests that writing a cloned tree is the same as writing the original tree.
function testClone(tree, originalSource) {
  var CloneTreeTransformer = traceur.codegeneration.CloneTreeTransformer;
  var cloneTree = CloneTreeTransformer.cloneTree(tree);
  var cloneGeneratedSource =
      traceur.outputgeneration.TreeWriter.write(cloneTree);
  assertEquals(originalSource, cloneGeneratedSource);

  function TaggingVisitor(){}
  TaggingVisitor.prototype = Object.create(traceur.codegeneration.ParseTreeTransformer.prototype);

  TaggingVisitor.transformAny = function(tree) {
    if (tree) 
      tree.tagged = true;
    return tree; 
  }
  
  function CheckingTagsVisitor(){}
  CheckingTagsVisitor.prototype = Object.create(traceur.syntax.ParseTreeVisitor.prototype);
  CheckingTagsVisitor.visitAny = function(tree) {
    assertUndefined(tree.tagged);
  }

  var tagged = (new TaggingVisitor).transformAny(cloneTree);
  (new CheckingTagsVisitor()).visitAny(tree);

  return true;
}

// Multiple round trips through the parser/writer should result in a
// fixed point. This test will expose bugs in the TreeWriter for each
// feature test.
function testTreeWriter(filePath, source, reporter) {
  var write1 = parseAndWrite(filePath, source, reporter);
  var write2 = parseAndWrite(filePath, write1, reporter);
  if (write1 !== write2) {
    failScript(filePath, "Round trip of " + filePath + " through the parser" +
      " and writer results in different results.\nPass 1:\n" + write1 +
      "\nPass 2:\n" + write2);
    return false;
  }
  return true;
}

function runCompiledTest(filePath, compiledCode) {
  try {
    ('global', eval)(compiledCode);
    return true;
  } catch (e) {
    if (e instanceof UnitTestError) {
      failScript(filePath, e.message + '\n' + e.stack);
    } else if (e instanceof SyntaxError) {
      failScript(filePath,
          'Compiled to invalid Javascript. Source:\n\n     ' +
          compiledCode.trim().replace(/\n/g, '\n     ') + '\n\n' +
          '     ' + e);
    } else {
      failScript(filePath, 'Unexpected exception running script:\n' + e +
          '\n' + e.stack);
    }
    return false;
  }
}

/**
 * Load, compile, and execute the feature script at the given path.
 */
function testScript(filePath) {

  traceur.options.debug = true;
  traceur.options.freeVariableChecker = true;
  traceur.options.validate = true;

  var source = fs.readFileSync(filePath, 'utf8');
  var options = testUtil.parseProlog(source);
  var onlyInBrowser = options.onlyInBrowser;
  var skip = options.skip;
  var shouldCompile = options.shouldCompile;
  var expectedErrors = options.expectedErrors;

  if (skip || onlyInBrowser) {
    return true;
  }

  silenceConsole();
  try {
    var reporter = new traceur.util.TestErrorReporter();
    var tree = compileToTree(filePath, source, reporter);
    var compiledCode = writeTree(filePath, tree, source);

    if (!shouldCompile) {
      return checkExpectedErrors(reporter, filePath, expectedErrors);
    }

    if (reporter.hadError()) {
      failScript(filePath, 'Unexpected compile error in script.');
      print(red(reporter.errors.join('\n')) + '\n\n');
      return false;
    }

    return runCompiledTest(filePath, compiledCode) &&
        testTreeWriter(filePath, source, reporter) &&
        testClone(tree, compiledCode);
  } catch(e) {
    failScript(filePath, 'Unexpected exception:\n' + e + '\n' + e.stack);
    return false;
  } finally {
    traceur.options.reset();
    restoreConsole();
  }
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
 * Recursively walk the directory |dir| and run each test script found.
 * @param {string} dir Directory to walk. Absolute or relative to process.cwd()
 * @param {string|undefined} basePath Base path for errslast and updateProgress.
 */
function runTestScripts(dir, basePath) {
  var contents = fs.readdirSync(dir);
  for (var i = 0; i < contents.length; i++) {
    var filePath = path.join(dir, contents[i]);
    var stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      runTestScripts(filePath, basePath);
    } else if (path.extname(filePath) == '.js') {
      filePath = basePath ? path.relative(basePath, filePath) : filePath;
      if (errslast && errslast.indexOf(filePath) >= 0)
        continue;
      updateProgress(testScript, filePath, basePath);
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
var traceur = require('../src/node/traceur.js');

print('\n');

// Running counts of total and passed tests.
var tests  = 0;
var passes = 0;

/**
 * Run |testFunction| on |filePath| and update |tests| and |passes|
 * appropriately, while also printing progress.
 * @param {function} testFunction
 * @param {string} filePath
 * @param {string|undefined} basePath Optional base path for |filePath|
 */
function updateProgress(testFunction, filePath, basePath) {
  clearLastLine();
  if (passes === tests) {
    print('Passed ' + green(passes) + ' so far. Testing: ' + filePath);
  } else {
    print('Passed ' + green(passes) + ' and failed ' +
          red(tests - passes) + ' Testing: ' + filePath);
  }
  print('\n');

  tests++;

  var filePathFull = basePath ? path.join(basePath, filePath) : filePath;
  if (testScript(filePathFull))
    passes++;

  if (tests - passes > errsnew.length)
    errsnew.push(filePath);
}

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
flags.option('--dirwalk <DIR>', 'run all .js test files in <DIR>');
flags.parse(process.argv);

var errsfile = flags.errsfile;
var errsnew = [];
var errslast;

var basePath = path.join(__dirname, 'feature');

if (errsfile && fs.existsSync(errsfile)) {
  print('Using error file \'' + errsfile + '\' ...\n\n');
  errslast = JSON.parse(fs.readFileSync(errsfile, 'utf8'));
  errslast.forEach(function(f) {
    try {
      updateProgress(testScript, f, basePath);
    } catch(e) {
      failScript(String(e));
      // Don't count this test in the total if the error was
      // "ENOENT, no such file or directory".
      if (e.code === 'ENOENT') {
        tests--;
      }
    }
  });
}

if (!flags.failfast || passes == tests) {
  if (flags.dirwalk) {
    runTestScripts(flags.dirwalk, basePath);
  } else {
    try {
      testList = require('./test-list.js').testList;
      testList.forEach(function(f) {
        if (errslast && errslast.indexOf(f) >= 0)
          return;
        updateProgress(testScript, f, basePath);
      });
    } catch(e) {
      if (!errslast) {
        console.error(String(e));
        process.exit(1);
      }
    }
  }
}

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
