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

var repl = require('repl');
var vm = require('vm');
var util = require('util');

var traceur = require('../src/node/traceur.js');
traceur.options.freeVariableChecker = false;

// Debug functions.

var debug, debug2, debug3, debugTree;

/**
 * Selectively enables and disables the debug functions.
 * @param {number|string} level The debug level to set (0-3).
 * @param {function} printf The printf-style function to use.
 * @return {number} The level that was set.
 */
function setDebugLevel(level, printf) {
  var outLevel = 0;

  debug = debug2 = debug3 = debugTree = function() {};

  switch (String(level)) {
    case '3':
      debug3 = printf;
      outLevel++;
      // fall through
    case '2':
      debugTree = function (fmt, tree) {
        printf(fmt, util.inspect(tree.toJSON(), false, 64));
      };
      debug2 = printf;
      outLevel++;
      // fall through
    case '1':
      debug = printf;
      outLevel++;
      // fall through
    default:
      return outLevel;
  }
}

/**
 * Works similarly to Compiler.compileFile, except without a reporter arg.
 * @param {string} cmd The source text to compile.
 * @param {string} url Used as script location in error messages.
 */
function compile(cmd, url) {
  var err = false;
  var reporter = {
    reportError: function(pos, msg) {
      err = true;

      var errMsg = util.format('%s:%s:%s %s', url, pos.line, pos.offset, msg);

      debug2('traceur-report-error: %s', errMsg);
      throw new Error(errMsg);
    },
    hadError: function() {
      return err;
    }
  };

  try {
    debug('traceur-input: %s', cmd);
    var InterceptOutputLoaderHooks = traceur.runtime.InterceptOutputLoaderHooks;
    var Loader = traceur.runtime.Loader;
    var loaderHooks = new InterceptOutputLoaderHooks(reporter, url);
    var loader = new Loader(loaderHooks);
    loader.script(cmd, {address: url});
    var output = loaderHooks.transcoded;
    debug('traceur-output: %s', output);
    return output;
  } catch(e) {
    debug3('traceur-compile-exception: %s', e.stack || e);

    if (parser && parser.isAtEnd())
      throw new SyntaxError('skip incomplete input');

    if (isWrapped(cmd))
      throw new SyntaxError('skip wrap');

    throw e;
  }
}

/**
 * Returns true if the node repl has passed in the command with extra
 * paren-wrapping added. The reason this works is because in the unwrapped
 * case, |cmd| always ends with a newline.
 *
 * Needless to say, this code will break if someone decides to randomly add
 * whitespace to that part of node's lib/repl.js -- but that seems unlikely.
 * More likely is that the whole interface changes, which means everything
 * has to be rewritten anyway.
 * @param cmd The command passed to the custom eval function.
 */
function isWrapped(cmd) {
  return cmd.endsWith(')');
}

/**
 * A one-time initialization function for setting up the initial repl
 * environment. We need to do this because it runs in a separate context.
 *
 * Or to be more specific, the globals from the current context are copied
 * into the repl context -- except for the core JS objects such as Object,
 * String, Array, etc.
 * @param {object} ctx The context to initialise.
 * @param {string} filename The filename to use when reporting errors.
 */
function init(ctx, filename) {
  vm.runInContext('$traceurRuntime.setupGlobals(global);', ctx, filename);
}

var trepl = repl.start({
  prompt: 'traceur> ',
  input: process.stdin,
  output: process.stdout,
  eval: function(cmd, ctx, filename, callback) {
    var err, result;

    try {
      // Don't eval class declarations as wrapped.
      if (isWrapped(cmd) && /^[\r\n\s]*class\b/.test(cmd.substr(1)))
        throw new SyntaxError('skip wrapped class declaration');

      result = vm.runInContext(compile(cmd, filename), ctx, filename);
    } catch(e) {
      debug2('traceur-eval-exception: %s', String(e));
      err = e;
    }
    callback(err, result);
  }
});

var tconsole = trepl.context.console;
var tprintf = tconsole.error.bind(tconsole);

var optTable = {
  '-vvv': 3,
  '-V': 2,
  '-vv': 2,
  '-v': 1
};

setDebugLevel(optTable[process.argv[2]], tprintf);

try {
  init(trepl.context, 'init');
} catch(e) {
  tprintf('\ntraceur-init-error: %s', e.stack);
  trepl.bufferedCommand = '';
  trepl.displayPrompt();
}

// Add a '.debug' command to set debug level from the repl environment.
trepl.defineCommand('debug', {
  help: 'set debug level (0-3)',
  action: function(level) {
    // Conversion needed in case someone types '.debug random-words'.
    level = setDebugLevel(level, tprintf);
    this.bufferedCommand = '';
    this.outputStream.write('debug level set to ' + level + '\n');
    this.displayPrompt();
  }
});
