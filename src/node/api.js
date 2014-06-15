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

// Node.js API
//
// This is what you get when you `require('traceur')`.
// It's suppose to be used by custom scripts or tools such as Grunt or Karma.

'use strict';

var path = require('path');
var traceur = require('./traceur.js');
// require compiler so we can export it for consumers that want to do a single file concatenation using the
// traceur es6 module based topological sort.  for instance, gulp-traceur
var compiler = require('./compiler');
// The System object requires traceur, but we want it set for everything that
// follows. The module sets global.System as a side-effect.
// load this to avoid getting an error about not setting the baseURL.
require('./System.js');

var ToCommonJSCompiler = traceur.ToCommonJSCompiler;

function NodeCompiler() {
  ToCommonJSCompiler.call(this);
  this.cwd = process.cwd();
}

NodeCompiler.prototype = {
  __proto__: ToCommonJSCompiler.prototype,
  resolveModuleName: function(filename) {
    var moduleName = filename.replace(/\.js$/, '');
    return path.relative(this.cwd, moduleName).replace(/\\/g,'/');
  },
  sourceRootForFilename: function(filename) {
    return path.relative(path.dirname(filename), '.');
  }
};

/**
 * Compile ES6 source code with Traceur.
 *
 * @param  {string} content ES6 source code.
 * @param  {Object=} options Traceur options.
 * @return {{js: string, errors: Array, sourceMap: string} Transpiled code.
 */
function compile(content, options) {
  return new NodeCompiler().compile(content, options);
}

// The absolute path to traceur-runtime.js -- the file that should be executed
// if you want to run Traceur-compiled scripts when the compiler isn't present.
var RUNTIME_PATH = path.join(__dirname, '../../bin/traceur-runtime.js');

// extend traceur module
module.exports = {
  __proto__: traceur,
  compile: compile,
  // export this for consumers that want to do a single file concatenation using the
  // traceur es6 module based topological sort.  for instance, gulp-traceur
  compiler: compiler,
  RUNTIME_PATH: RUNTIME_PATH
};
