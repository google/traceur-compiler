
import {globPatterns} from '../test/modular/NodeTraceurTestRunner.js';

let express = require('express');
let http = require('http');
let serveIndex = require('serve-index');

function servePathAtPort(path, port) {
  let app = express();
  app.use(express.static(path));   // before directory to allow index.html to work
  app.use(serveIndex(path));
  app.get('/traceurService/testGlobs', function(req, res) {
  	console.log('req', req.query.patterns);
  	let patterns = JSON.parse(req.query.patterns);
  	return globPatterns(patterns).then((files) => {
  		console.log('files ', files);
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

console.log('moduleName ' + __moduleName);
servePathAtPort(System.dirname(__moduleName) + '/..', 8099);
servePathAtPort(System.dirname(__moduleName) + '/..', 80);
