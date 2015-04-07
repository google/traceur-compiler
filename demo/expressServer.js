// Copyright 2015 Traceur Authors.
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

import {globPatterns} from '../test/modular/NodeTraceurTestRunner.js';

let express = require('express');
let http = require('http');
let serveIndex = require('serve-index');

function servePathAtPort(path, port) {
  let app = express();
  // serveIndex must precede static to allow index.html to work
  app.use(serveIndex(path));
  app.use(express.static(path));
  // Expand the test list based on the file system.
  app.get('/traceurService/testGlobs', function(req, res) {
    let patterns = JSON.parse(req.query.patterns);
    return globPatterns(patterns).then((files) => {
      let nodeless = [];
      files.forEach((file) => {
        if (file.indexOf('/node/') === -1) {
          nodeless.push(file);
        }
      });
      return res.send(nodeless);
    });
  });
  let server = http.createServer(app);
  server.on('error', function(e) {
    console.error('Port ' + port + ' did not work out');
  });
  server.listen.apply(server, [port]);
  console.log('serving ' + path + ' at ' + port);
}

servePathAtPort(System.dirname(__moduleName) + '/..', 8099);
servePathAtPort(System.dirname(__moduleName) + '/..', 80);
