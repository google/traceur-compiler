// Copyright 2012 Google Inc.
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

var includes = [
  // We assume we're always relative to "src/"
  '../third_party/source-map/lib/source-map/array-set.js',
  '../third_party/source-map/lib/source-map/base64.js',
  '../third_party/source-map/lib/source-map/base64-vlq.js',
  '../third_party/source-map/lib/source-map/binary-search.js',
  '../third_party/source-map/lib/source-map/util.js',
  '../third_party/source-map/lib/source-map/source-map-generator.js',
  '../third_party/source-map/lib/source-map/source-map-consumer.js',
  '../third_party/source-map/lib/source-map/source-node.js',
  'runtime/runtime.js',
  'traceur.js'
];

var fs = require('fs');
var path = require('path');

require('../src/traceur-node.js');

var ErrorReporter = traceur.util.ErrorReporter;
var TreeWriter = traceur.outputgeneration.TreeWriter;

function existsSync(p) {
  return fs.existsSync ? fs.existsSync(p) : path.existsSync(p);
}

/**
 * Recursively makes all directoires, similar to mkdir -p
 * @param {string} dir
 */
function mkdirRecursive(dir) {
  var parts = path.normalize(dir).split('/');

  dir = '';
  for (var i = 0; i < parts.length; i++) {
    dir += parts[i] + '/';
    if (!existsSync(dir)) {
      fs.mkdirSync(dir, 0x1FF);
    }
  }
}

traceur.options.reset(true);
traceur.options.arrowFunctions = true;
traceur.options.modules = true;
traceur.options.destructuring = true;
traceur.options.quasi = true;
traceur.options.spread = true;

var reporter = new ErrorReporter();

var inlineAndCompile = require('./inline-module.js').inlineAndCompile;

var srcDir = path.join(path.dirname(process.argv[1]), '..', 'src');
var resolvedIncludes = includes.map(function(include) {
  return path.join(srcDir, include);
});

inlineAndCompile(resolvedIncludes, reporter, function(tree) {
  var contents = TreeWriter.write(tree);
  var outputfile = process.argv[2];
  mkdirRecursive(path.dirname(outputfile));
  fs.writeFileSync(outputfile, contents, 'utf8');
  process.exit(1);
}, function(err) {
  console.error(err);
  process.exit(0);
});
