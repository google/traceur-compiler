var express = require('express');
var http = require('http');
var serveIndex = require('serve-index');

function servePathAtPort(path, port) {
  var app = express();
  app.use(express.static(path));   // before directory to allow index.html to work
  app.use(serveIndex(path));
  var server = http.createServer(app);
  server.on('error', function(e) {
  	console.log('Port ' + port + ' did not work out');
  });
  server.listen.apply(server, [port]);
  console.log('serving ' + path + ' at ' + port);
}

servePathAtPort(__dirname + '/..', 8099);
servePathAtPort(__dirname + '/..', 80);
