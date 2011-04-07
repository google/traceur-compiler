// Copyright 2011 Google Inc.
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

(function() {
  'use strict';

  if (process.argv.length <= 2) {
    console.log('Usage: node ' + process.argv[1] + ' filename.js...');
    process.exit(1);
  }

  var fs = require('fs');
  var path = require('path');

  /**
   * Reads a script and eval's it into the global scope.
   * TODO: this is needed for now because of how our scripts are designed.
   * Change this once we have a module system.
   * @param {string} filename
   */
  function importScript(filename) {
    filename = path.join(path.dirname(process.argv[1]), filename);
    var data = fs.readFileSync(filename);
    if (!data) {
      throw new Error('Failed to import ' + filename);
    }
    data = data.toString('utf8');
    eval.call(global, data);
  }

  // Allow traceur.js to use importScript.
  global.importScript = importScript;

  importScript('./traceur.js');

  /**
   * A command-line precompiler for a traceur JS file.
   * @param {string} filename
   */
  function compile(filename) {
    var data = fs.readFileSync(filename);
    if (!data) {
      console.log('Failed to read ' + filename);
      return;
    }
    data = data.toString('utf8');

    var compiler = new global.traceur.Compiler();
    var result = compiler.compile(filename, data);

    if (result.errors.hadError()) {
      console.log('Compilation of ' + filename + ' failed.');
      return;
    }

    filename = path.basename(filename, '.js') + '.traceur.js';
    fs.writeFileSync(filename, new Buffer(result.result));
    console.log('Compilation of ' + filename + ' successful.');
  }

  process.argv.slice(2).forEach(compile);
})();
