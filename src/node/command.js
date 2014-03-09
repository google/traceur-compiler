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

'use strict';

var path = require('path');
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

var traceur = require('./traceur.js');

// The System object requires traceur, but we want it set for everything that
// follows. The module sets global.System as a side-effect.
require('./System.js');

flags.option('--out <FILE>', 'Compile all input files into a single file');
flags.option('--referrer <name>',
    'Prefix compiled code with System.referrName');

flags.option('--dir <INDIR> <OUTDIR>', 'Compile an input directory of modules into an output directory');

flags.option('--sourcemap', 'Generate source maps');
flags.on('sourcemap', function() {
  flags.sourceMaps = traceur.options.sourceMaps = true;
});

flags.option('--longhelp', 'Show all known options');
flags.on('longhelp', function() {
  flags.help();
  process.exit();
});

// Caling process.exit when there is still characters to be flushed to stdout
// makes Windows drop those characters. We therefor wait until the buffer is
// empty before really exiting.
// Since this makes exiting async we need to manually keep track
var shouldExit = false;

function processExit() {
  shouldExit = true;
  var draining = 0;
  function exit() {
    if (!draining--)
      process.exit();
  }
  if (process.stdout.bufferSize) {
    draining += 1;
    process.stdout.once('drain', exit);
  }
  if (process.stderr.bufferSize) {
    draining += 1;
    process.stderr.once('drain', exit);
  }
  exit();
}

flags.option('-v, --version', 'Show version and exit');
flags.on('version', function() {
  process.stdout.write(System.version);
  processExit();
});

flags.on('--help', function() {
  console.log('  Examples:');
  console.log('');
  console.log('    $ %s a.js [args]', cmdName);
  console.log('    $ %s --out compiled.js b.js c.js', cmdName);
  console.log('    $ %s --dir indir outdir', cmdName);
  console.log('');
});

traceur.options.addOptions(flags);

flags.usage('[options] [files]');

// Override commander.js's optionHelp to filter out the Traceur feature flags
// from showing up in the help message.
var optionHelp = flags.optionHelp;
flags.optionHelp = function() {
  if (!flags.longhelp) {
    this.options = this.options.filter(function(command) {
      var dashedName = command.long.slice(2);
      return traceur.options.filterOption(dashedName);
    });
  }
  return optionHelp.call(this);
}

/**
 * HACK: Process arguments so that in interpret mode, commander.js only parses
 * the flags, without the file name and anything past that. If an invalid flag
 * is encountered, commander.js error reporting is emulated instead.
 * @param {Array.<string>} argv
 * @return {Array.<string>}
 */
function processArguments(argv) {
  // Preserve the original.
  argv = argv.slice();

  var interpretMode = true;
  for (var i = 2; i < argv.length; i++) {
    var arg = argv[i], index;
    if (arg === '--')
      break;

    // Normalize flags in-place.
    if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
      // TODO: Is this needed at all for traceur?
      arg = arg.slice(1).split('').map(function(flag) {
        return '-' + flag;
      });
      // Insert the normalized flags in argv.
      argv.splice.apply(argv, [i, 1].concat(arg));
      // Grab the first normalized flag and process it as usual.
      arg = argv[i];
    } else if (/^--/.test(arg) && (index = arg.indexOf('=')) !== -1) {
      // Insert the flag argument in argv.
      argv.splice(i + 1, 0, arg.slice(index + 1));
      // Replace the flag with the stripped version and process it as usual.
      arg = argv[i] = arg.slice(0, index);
    }

    var option = flags.optionFor(arg);
    if (option) {
      if (arg === '--out' || arg === '--dir')
        interpretMode = false;

      if (option.required)
        i++;
      else if (option.optional) {
        arg = argv[i + 1];
        if (arg && arg[0] !== '-')
          i++;
      }
    } else if (arg === '-h' || arg === '--help') {
      // HACK: Special case for the implicit help flags, which can't have
      // their own option, as --help would set flags.help to true, shadowing
      // the flags.help() method.
    } else if (arg[0] === '-') {
      // HACK: Because commander.js has a flexible policy, this is the only
      // reliable way of reporting invalid flags to the user, and it's limited
      // to the first invalid flag encountered.
      console.log('\n  error: unknown option `%s\'\n', arg);
      process.exit(1);
    } else if (interpretMode) {
      // Add a hint to stop commander.js from parsing following arguments.
      // Note that this means that --out must come before any unknown flag as
      // well as before any filename for it to be used as the out flag.
      argv.splice(i, 0, '--');
      // Save traceur flags for interpret.js.
      argv.flags = argv.slice(2, i);
      break;
    }
  }
  return argv;
}

var argv = processArguments(process.argv);
flags.parse(argv);


var includes = traceur.options.scripts || [];
includes = includes.concat(flags.args);

if (!shouldExit && !includes.length) {
  // TODO: Start trepl
  console.error('\n  Error: At least one input file is needed');
  flags.help();
  process.exit(1);
}


var interpret = require('./interpreter.js');
var compiler = require('./compiler.js');
var compileToSingleFile = compiler.compileToSingleFile;
var compileToDirectory = compiler.compileToDirectory;

var out = flags.out;
var dir = flags.dir;
if (!shouldExit) {
  if (out) {
    var isSingleFileCompile = /\.js$/.test(out);
    if (isSingleFileCompile)
      compileToSingleFile(out, includes, flags.sourceMaps);
    else
      compileToDirectory(out, includes, flags.sourceMaps);
  } else if (dir) {
    var compileAllJsFilesInDir = require('./compile-single-file.js').compileAllJsFilesInDir;
    compileAllJsFilesInDir(dir, includes[0]);
  }
  else {
    interpret(path.resolve(includes[0]), includes.slice(1), argv.flags);
  }
}
