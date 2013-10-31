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

var fs = require('fs');

/**
 * Returns all input read from |fd| as a string, correctly handling ending of
 * piped input.
 * @param {number} fd File descriptor to read from.
 * @return {string}
 */
function readSyncString(fd) {
  var BUFFER_SIZE = 4096;

  var buf = new Buffer(BUFFER_SIZE);
  var len = 0;
  var text = '';

  try {
    while (len = fs.readSync(fd, buf, 0, BUFFER_SIZE, null)) {
      text += buf.toString('utf8', 0, len);
    }
  } catch (e) {
    // On Windows readSync throws if attempting to read at EOF
    if (e.message.indexOf('EOF') != 0) {
      throw e;
    }
  }
  return text;
}

var lines = readSyncString(process.stdin.fd).split('\n').filter(function(x) {
  // Remove /resources/ directories.
  if (/\/resources\//i.test(x))
    return false;

  // JS files only
  return x && x.match('\\.js$');
}).map(function(x) {
  // remove "test/feature/"
  return x.split('/').slice(2).join('/');
});

console.log('var testList = %s;', JSON.stringify(lines, null, 2));
console.log('if (typeof exports === \'object\') exports.testList = testList;');
