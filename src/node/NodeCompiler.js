// Copyright 2014 Traceur Authors.
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

// Node.js API
//
// This is what you get when you `require('traceur')`.
// It's suppose to be used by custom scripts or tools such as Grunt or Karma.

'use strict';

var path = require('path');
var fs = require('fs');
var util = require('./file-util.js');
var writeFile = util.writeFile;
var traceur = require('./traceur.js');

var Compiler = traceur.Compiler;

function NodeCompiler(options, sourceRoot) {
  sourceRoot = sourceRoot || process.cwd();
  Compiler.call(this, options, sourceRoot);
}

NodeCompiler.prototype = {
  __proto__: Compiler.prototype,

  resolveModuleName: function(filename) {
    if (!filename)
      return;
    var moduleName = filename.replace(/\.js$/, '');
    return path.relative(this.sourceRoot, moduleName).replace(/\\/g,'/');
  },

  sourceName: function(filename) {
    return path.relative(this.sourceRoot, filename);
  },

  writeTreeToFile: function(tree, filename) {
    var compiledCode = this.write(tree);
    var sourcemap = this.getSourceMap();
    if (sourcemap) {
      // Assume that the .map and .js will be in the same subdirectory,
      // Use the rule from Source Map Revision 3:
      // If the generated code is associated with a script element and the
      // script element has a “src” attribute, the “src” attribute of the script
      // element will be the source origin.
      var sourceMapFilePath = path.basename(filename.replace(/\.js$/, '.map'));
      compiledCode += '\n//# sourceMappingURL=' + sourceMapFilePath + '\n';
      writeFile(sourceMapFilePath, sourcemap);
    }
    writeFile(filename, compiledCode);
  },

  compileSingleFile: function(inputFilePath, outputFilePath, errback) {
    fs.readFile(inputFilePath, function(err, contents) {
      if (err) {
        errback(err);
        return;
      }

      this.writeTreeToFile(this.transform(
          this.parse(contents.toString(), inputFilePath)), outputFilePath);
    }.bind(this));
  }
};


module.exports = {
  NodeCompiler: NodeCompiler
};
