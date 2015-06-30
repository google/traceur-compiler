var requirejs = require('requirejs');
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;

var COMPILED_DIR = __dirname + '/amd-compiled';
var INPUT_DIR = __dirname + '/amd';

function onlyJsFiles(path) {
  return /\.js$/.test(path);
}

function moduleFromSource(src) {
  if (!src || (src + '') === 'undefined')
    throw new Error('The test/' + COMPILED_DIR + ' FAILED');
  var module;
  var define = function(deps, factory) {
    var output = factory();
    module = output.__esModule ? output : {default: output};
  }
  Function('define', src).call(global, define);
  return module;
}

var inputFiles = fs.readdirSync(INPUT_DIR).filter(onlyJsFiles);
var testFiles = fs.readdirSync(COMPILED_DIR).filter(onlyJsFiles);

// Verify that all the inputs resulted in outputs.
assert.equal(inputFiles.length, testFiles.length);

requirejs.config({
  baseUrl: COMPILED_DIR
});

suite('amd', function() {
  // Verify that the testFiles are all valid AMD
  testFiles.forEach(function(testFile) {
    test(testFile, function(done) {
      requirejs(['./' + testFile.replace(/\.js$/, '')], function() {
        done();
      });
    });
  });

  test('Transpiled module export', function(done) {
    var module = moduleFromSource(
        fs.readFileSync(path.resolve(COMPILED_DIR, 'NamedExports.js')));
    assert.equal(module.someExport, 'val');
    done();
  })
});
