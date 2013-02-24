// Copyright 2012 Traceur Authors.
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

var http = require('http');
var path = require('path');
var qs = require('querystring');
var fs = require('fs');

/**
 * Prints a formatted error or warning message.
 * @param {CompilerMsg} msg An error or warning message as returned by the
 *     Closure Compiler Service's JSON output format.
 * @param {string|null} file The filename to refer to in error messages. If
 *     null, then msg.file is used instead.
 */
function printCompilerMsg(msg, file) {
  console.error('%s:%d:%d %s - %s',
                file || msg.file, msg.lineno + 1,
                msg.charno + 1, msg.type, msg.error);
  console.error('%s\n%s^',
                msg.line, Array(msg.charno + 1).join(' '));
}

/**
 * Used to merge the warning and error lists so that everything can be printed
 * in lineno and charno order. If lineno and charno match, then list2 is chosen
 * first.
 * @param {Array.<CompilerMsg>} list1
 * @param {Array.<CompilerMsg>} list2
 */
function mergedCompilerMsgLists(list1, list2) {
  var list = [];

  list1 = list1 || [];
  list2 = list2 || [];

  function lessThan(e1, e2) {
    if (e1.lineno < e2.lineno)
      return true;
    return e1.lineno === e2.lineno && e1.charno < e2.charno;
  }

  var i1 = 0, i2 = 0;
  while (true) {
    if (i1 >= list1.length)
      return list.concat(list2.slice(i2));
    if (i2 >= list2.length)
      return list.concat(list1.slice(i1));
    if (lessThan(list1[i1], list2[i2]))
      list.push(list1[i1++]);
    else
      list.push(list2[i2++]);
  }
}

var cmdName = path.basename(process.argv[1]);

// Expected: argv === ['node', 'path/to/script.js', 'infile', 'outfile']
if (process.argv.length < 4) {
  console.error('Usage: %s [infile] [outfile]', cmdName);
  process.exit(1);
}

// [1] Read file data
var data = fs.readFileSync(process.argv[2], 'utf-8');

var opt = {
  host: 'closure-compiler.appspot.com',
  port: 80,
  path: '/compile',
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
};

var req = http.request(opt, function(res) {
  var out = [];

  res.setEncoding('utf8');

  // [3] Collect response
  res.on('data', function(chunk) {
    out.push(chunk);
  });

  // [4] Hendle response
  res.on('end', function() {
    var json = JSON.parse(out.join(''));
    var outfileName = process.argv[3];

    if (json.errors || json.warnings)
      mergedCompilerMsgLists(json.errors, json.warnings)
          .forEach(function(x) { printCompilerMsg(x, outfileName); });

    if (json.errors)
      process.exit(1);

    fs.writeFileSync(outfileName, json.compiledCode, 'utf8');
    process.exit(0);
  });
});

req.on('error', function(err) {
  console.error('Problem with request: %s', err.message);
  process.exit(1);
});

// [2] Send data in request
req.write(
  qs.stringify({
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
    js_code: data,
    output_format: 'json',
    output_info: ['compiled_code', 'errors', 'warnings', 'statistics'],
    language: 'ECMASCRIPT5'
  }), 'utf8');

req.end();
