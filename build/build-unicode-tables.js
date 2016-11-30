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

var http = require('http');
var util = require('./util.js');
var print = util.print;

var url = 'http://www.unicode.org/Public/UNIDATA/DerivedCoreProperties.txt';

util.printLicense();
util.printAutoGenerated(url);

var data = '';

http.get(url, function(res) {
  res.setEncoding('utf-8');
  res.on('data', function(chunk) {
    data += chunk;
  });
  res.on('end', processData);
});

var unicodeIdStart = [];
var unicodeIdContinue = [];
var es6UnicodeIds = [];

var idStartRanges = {};
var es6UnicodeIdRanges = {};

function printArray(name, array) {
  print('export const ' + name + ' = [');
  for (var i = 0; i < array.length; i += 2) {
    print('  ' + array[i] + ', ' + array[i + 1] + ',');
  }
  print('];')
}

function processData() {
  data.split(/\n/).forEach(function(line) {
    var m = line.match(/([0-9a-fA-F]+)(?:\.\.(.+))?\s+;\s+ID_Start\s+(?:#\s+(.*?)\s+)?/);
    if (!m) return;
    var first = parseInt(m[1], 16);
    var last = parseInt(m[2] || m[1], 16);
    var category = m[3] || "";
    if (last < 128) return;
    if (!es6UnicodeIdRanges[first + '..' + last] &&
        !/^(L&)|(Lu)|(Ll)|(Lt)|(Lm)|(Lo)|(Nl)$/.test(category)) {
      es6UnicodeIdRanges[first + '..' + last] = true;
      es6UnicodeIds.push(first, last);
    }
    unicodeIdStart.push(first, last);
    idStartRanges[first + '..' + last] = true;
  });

  data.split(/\n/).forEach(function(line) {
    var m = line.match(/([0-9a-fA-F]+)(?:\.\.(.+))?\s+;\s+ID_Continue\s+(?:#\s+(.*?)\s+)?/);
    if (!m) return;
    var first = parseInt(m[1], 16);
    var last = parseInt(m[2] || m[1], 16);
    var category = m[3] || "";
    if (last < 128) return;
    if (!es6UnicodeIdRanges[first + '..' + last] &&
        !/^(L&)|(Lu)|(Ll)|(Lt)|(Lm)|(Lo)|(Nl)|(Mn)|(Mc)|(Nd)|(Pc)$/.test(category)) {
      es6UnicodeIdRanges[first + '..' + last] = true;
      es6UnicodeIds.push(first, last);
    }
    if (idStartRanges[first + '..' + last])
      return;
    unicodeIdContinue.push(first, last);
  });

  printArray('idStartTable', unicodeIdStart);
  print('');
  printArray('idContinueTable', unicodeIdContinue);
  print('');
  printArray('idES6OnlyTable', es6UnicodeIds);
}
