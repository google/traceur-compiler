var requirejs = require('requirejs');
var fs = require('fs');

var COMPILED_DIR = __dirname + '/amd-compiled';

function onlyJsFiles(path) {
  return /\.js$/.test(path);
}

var testFiles = fs.readdirSync(COMPILED_DIR).filter(onlyJsFiles);

requirejs.config({
  baseUrl: COMPILED_DIR
});

suite('amd', function() {
  testFiles.forEach(function(testFile) {
    test(testFile, function(done) {
      requirejs(['./' + testFile.replace(/\.js$/, '')], function() {done();});
    });
  });
});
