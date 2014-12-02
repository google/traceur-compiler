var fs = require('fs');

var COMPILED_DIR = __dirname + '/commonjs-compiled';

function onlyJsFiles(path) {
  return /\.js$/.test(path);
}

var testFiles = fs.readdirSync(COMPILED_DIR).filter(onlyJsFiles);

suite('commonjs', function() {
  testFiles.forEach(function(testFile) {
    test(testFile, function() {
      require('./commonjs-compiled/' + testFile);
    });
  });
});
