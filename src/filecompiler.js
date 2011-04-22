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
   * Recursively makes all directoires, similar to mkdir -p
   * @param {string} dir
   */
  function mkdirRecursive(dir) {
    var parts = path.normalize(dir).split('/');

    dir = '';
    for (var i = 0; i < parts.length; i++) {
      dir += parts[i] + '/';
      if (!path.existsSync(dir)) {
        fs.mkdirSync(dir, 0x1FF);
      }
    }
  }

  /**
   * Removes the common prefix of basedir and filedir from filedir
   * @param {string} basedir
   * @param {string} filedir
   */
  function removeCommonPrefix(basedir, filedir) {
    var baseparts = basedir.split('/');
    var fileparts = filedir.split('/');

    var i = 0;
    while (i < fileparts.length && fileparts[i] === baseparts[i]) {
      i++;
    }
    return fileparts.slice(i).join('/');
  }

  function compileFiles(filenames) {
    var reporter = new traceur.util.ErrorReporter();
    var project = new traceur.semantics.symbols.Project();

    console.log('Reading files...');
    var success = filenames.every(function(filename) {
      var data = fs.readFileSync(filename);
      if (!data) {
        console.log('Failed to read ' + filename);
        return false;
      }
      data = data.toString('utf8');
      var sourceFile = new traceur.syntax.SourceFile(filename, data);
      project.addFile(sourceFile);
      return true;
    });

    if (!success) {
      return false;
    }

    console.log('Compiling...');
    var results = traceur.codegeneration.Compiler.compile(reporter, project);
    if (reporter.hadError()) {
      console.log('Compilation failed.');
      return false;
    }

    console.log('Compilation successful');

    results.keys().forEach(function(file) {
      var tree = results.get(file);
      var filename = file.name;
      var result = traceur.codegeneration.ParseTreeWriter.write(tree, false);

      // Compute the output path
      var outputdir = fs.realpathSync(process.cwd());
      var filedir = fs.realpathSync(path.dirname(filename));
      filedir = removeCommonPrefix(outputdir, filedir);
      outputdir = path.join(outputdir, 'out', filedir);

      mkdirRecursive(outputdir);
      var outputfile = path.join(outputdir, path.basename(filename));
      fs.writeFileSync(outputfile, new Buffer(result));
      console.log('Writing of out/' + filename + ' successful.');
    });

    return true;
  }

  var success = compileFiles(process.argv.slice(2));
  if (!success) {
    process.exit(2);
  }
})();
