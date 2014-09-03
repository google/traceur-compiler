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

function NodeCompiler(options) {
  Compiler.call(this, options);
  this.cwd = process.cwd();
}

NodeCompiler.prototype = {
  __proto__: Compiler.prototype,

  resolveModuleName: function(filename) {
    if (!filename)
      return;
    var moduleName = filename.replace(/\.js$/, '');
    return path.relative(this.cwd, moduleName).replace(/\\/g,'/');
  },

  sourceName: function(filename) {
    return path.relative(this.cwd, filename);
  },

  sourceRoot: function(filename) {
    return this.options_.sourceRoot || this.cwd + '/';
  },

  writeTreeToFile: function(tree, filename) {
    var compiledCode = this.write(tree);
    var sourcemap = this.getSourceMap();
    if (sourcemap) {
      var sourceMapFilePath = filename.replace(/\.js$/, '.map');
      compiledCode += '\n//# sourceMappingURL=' +
          path.basename(sourceMapFilePath) + '\n';
      writeFile(sourceMapFilePath, sourcemap);
    }
    writeFile(filename, compiledCode);
  },

  compileSingleFile: function(inputFilePath, outputFilePath) {
    fs.readFile(inputFilePath, function(err, contents) {
      if (err)
        throw new Error('While reading ' + inputFilePath + ': ' + err);

      this.options_.filename = inputFilePath;
      this.writeTreeToFile(this.transform(this.parse(contents.toString())),
          outputFilePath);
    }.bind(this));
  }
};


module.exports = {
  NodeCompiler: NodeCompiler
};
