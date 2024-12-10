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

var fs = require('fs');
var path = require('path');

function existsSync(p) {
  return fs.existsSync ? fs.existsSync(p) : path.existsSync(p);
}

/**
 * Recursively makes all directoires, similar to mkdir -p
 * @param {string} dir
 */
function mkdirRecursive(dir) {
  var parts = path.normalize(dir).split(path.sep);
  dir = '';
  for (var i = 0; i < parts.length; i++) {
    dir += parts[i] + path.sep;
    if (!existsSync(dir)) {
      fs.mkdirSync(dir, 0x1FD); // 0775 permissions
    }
  }
}

/**
 * Removes the common prefix of basedir and filedir from filedir
 * @param {string} basedir
 * @param {string} filedir
 */
function removeCommonPrefix(basedir, filedir) {
  var baseparts = basedir.split(path.sep);
  var fileparts = filedir.split(path.sep);

  var i = 0;
  while (i < fileparts.length && fileparts[i] === baseparts[i]) {
    i++;
  }
  return fileparts.slice(i).join(path.sep);
}

function writeFile(filename, contents) {
  // Compute the output path
  var outputdir = fs.realpathSync(process.cwd());
  
  // Resolve the full path of the target file
  var resolvedFilePath = path.resolve(outputdir, filename);

  // Ensure the parent directory of the target file exists
  var parentDir = path.dirname(resolvedFilePath);

  // Only create the necessary parent directory structure
  mkdirRecursive(parentDir);

  // Write the file
  fs.writeFileSync(resolvedFilePath, contents, 'utf8');
}

function normalizePath(s) {
  return path.sep == '\\' ? s.replace(/\\/g, '/') : s;
}

exports.mkdirRecursive = mkdirRecursive;
exports.normalizePath = normalizePath;
exports.removeCommonPrefix = removeCommonPrefix;
exports.writeFile = writeFile;
