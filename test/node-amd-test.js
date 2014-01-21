var requirejs = require('requirejs');
var fs = require('fs');
var path = require('path');

var COMPILED_DIR = __dirname + '/amd-compiled';

function onlyJsFiles(path) {
  return /\.js$/.test(path);
}

function moduleFromSource(src) {
  var module;
  var define = function(deps, factory) {
    var output = factory();
    module = output.__transpiledModule ? output : {default: output};
  }
  Function('define', src).call(global, define);
  return module;
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

  test('Transpiled module export', function(done) {
    var module = moduleFromSource(fs.readFileSync(path.resolve(COMPILED_DIR, 'NamedExports.js')));
    assert.equal(module.someExport, 'val');
    done();
  })
});
