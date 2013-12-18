var fs = require('fs');

var COMPILED_DIR = __dirname + '/nodejs-compiled';

function onlyJsFiles(path) {
  return /\.js$/.test(path);
}

var testFiles = fs.readdirSync(COMPILED_DIR).filter(onlyJsFiles);

suite('nodejs', function() {
  testFiles.forEach(function(testFile) {
    test(testFile, function() {
      require('./nodejs-compiled/' + testFile.replace(/\.js$/, ''));
    });
  });
});
