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
var traceur = require('./traceur.js');
var util = require('./file-util.js');
var writeFile = util.writeFile;

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
  sourceRootForFilename: function(filename) {
    return path.relative(path.dirname(filename), '.');
  }
};

/**
 * Use Traceur to Compile ES6 module source code to commonjs format.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
function moduleToCommonJS(content, options) {
  var compiler = new NodeCompiler(Compiler.commonJSOptions(options));
  return {
    js: compiler.compile(content),
    sourceMap: compiler.getSourceMap()
  };
}
/**
 * Use Traceur to Compile ES6 module source code to amd format.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
function moduleToAmd(content, options) {
  var compiler = new NodeCompiler(Compiler.amdOptions(options));
  return {
    js: compiler.compile(content),
    sourceMap: compiler.getSourceMap()
  };
}

function getSourceMapFileName(name) {
  return name.replace(/\.js$/, '.map');
}

function writeCompiledCodeToFile(compiledCode, filename, sourcemap) {
  var sourceMapFilePath;
  if (sourcemap) {
    sourceMapFilePath = getSourceMapFileName(filename);
    compiledCode += '\n//# sourceMappingURL=' +
        path.basename(sourceMapFilePath) + '\n';
  }
  writeFile(filename, compiledCode);
  if (sourcemap)
    writeFile(sourceMapFilePath, sourcemap);
}

module.exports = {
  NodeCompiler: NodeCompiler,
  moduleToCommonJS: moduleToCommonJS,
  moduleToAmd: moduleToAmd,
  writeCompiledCodeToFile: writeCompiledCodeToFile,
};
