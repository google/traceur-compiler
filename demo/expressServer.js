var express = require('express');

function servePathAtPort(path, port) {
  var app = express();
  app.use(express.static(path));   // before directory to allow index.html to work
  app.use(express.directory(path));
  app.listen(port);
  console.log('serving ' + path + ' at ' + port);
}

servePathAtPort(__dirname + '/..', 8099);

