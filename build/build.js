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

(function() {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var http = require('http');
  var querystring = require('querystring');

  var dummyImportScript = '(global||this).traceurImportScript = function() {};';

  function build(fileList, outfile) {
    var src = dummyImportScript;
    console.log('Reading files...');
    var success = fileList.every(function(filename) {
      var data = fs.readFileSync('../src/' + filename);
      if (!data) {
        console.error('Failed to read ' + filename);
        return false;
      }
      src += data.toString('utf8');
      return true;
    });

    if (!success) {
      return false;
    }

    console.info('Compiling...');

    var postData = querystring.stringify({
      'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
      'output_format': 'text',
      'language': 'ECMASCRIPT5',
      'output_info': 'compiled_code',
      'js_code': src,
    });

    var params = {
      host: 'closure-compiler.appspot.com',
      port: '80',
      path: '/compile',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    var compiledCode = '';
    var req = http.request(params, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        compiledCode += chunk;
      });
      res.on('end', function() {
        console.log('Writing compiled code to:', outfile);
        fs.writeFileSync(outfile, new Buffer(compiledCode));
      });
    });

    req.write(postData);
    req.end();
  }

  global.traceur = {
    includes: [
      'src/traceur.js',
    ],
  };

  var data = fs.readFileSync('../src/traceur.js');
  data = data.toString('utf8');
  eval(dummyImportScript + data);

  build(global.traceur.includes,
        process.argv[2] || 'tmp.js');
})();
