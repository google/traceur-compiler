
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
      return res.send(files);
    });
  });
  let server = http.createServer(app);
  server.on('error', function(e) {
    console.log('Port ' + port + ' did not work out');
  });
  server.listen.apply(server, [port]);
  console.log('serving ' + path + ' at ' + port);
}

servePathAtPort(System.dirname(__moduleName) + '/..', 8099);
servePathAtPort(System.dirname(__moduleName) + '/..', 80);
