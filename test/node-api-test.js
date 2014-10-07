var fs = require('fs');
var path = require('path');
suite('node public api', function() {
  var traceurAPI = require('../src/node/api.js');
  var sourceMapUtil = require('source-map/lib/source-map/util.js');

  var nativeFilename = path.join(__dirname + '/commonjs/BasicImport.js');
  var nativeDirname = __dirname;
  assert(nativeDirname[nativeDirname.length - 1] !== path.sep,
      'expect no trailing slash');

  // Non-native path separators
  function swapSlash(s) {
    return s.split(path.sep).join(path.sep === '/' ? '\\' : '/');
  }
  var swapSlashFilename = swapSlash(nativeFilename);
  var swapSlashDirname  = swapSlash(nativeDirname);

  // Traceur uses forward slashes since these work cross platform in APIs.
  function forwardSlash(s) {
    return s.replace(/\\/g, '/');
  }
  var traceurFilename = forwardSlash(nativeFilename);
  var traceurDirname = forwardSlash(nativeDirname);

  var contents = fs.readFileSync(nativeFilename, 'utf8');

  test('moduleName from filename with backslashes', function() {
    var compiler = new traceurAPI.NodeCompiler({
      // build ES6 style modules rather then cjs
      modules: 'register',

      // node defaults to moduleName false
      moduleName: true,

      // ensure the source map works
      sourceMaps: 'file'
    });
    // windows-simulation, with .js
    var compiled = compiler.compile(contents, swapSlashFilename);
    assert.ok(compiled, 'can compile');
    assert.include(
      compiled,

      // the module path is relative to the cwd setting when we compile it.
      'commonjs/BasicImport',

      'module name without backslashes'
    );
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
  });

  test('sourceRoot with backslashes', function() {
    var compiler = new traceurAPI.NodeCompiler({
      // build ES6 style modules rather then cjs
      modules: 'register',

      // ensure the source map works
      sourceMaps: true
    });
    // windows-simulation, with .js
    var compiled = compiler.compile(contents, swapSlashFilename,
        swapSlashFilename, swapSlashDirname);
    assert.ok(compiled, 'can compile');
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
    var sourceMap = JSON.parse(compiler.getSourceMap());
    assert.equal(traceurDirname, sourceMap.sourceRoot,
        'has correct sourceRoot');
    assert(sourceMap.sources.some(function(name) {
      return sourceMapUtil.join(sourceMap.sourceRoot, name) === traceurFilename;
    }), 'One of the sources is the source');
  });


  test('sourceRoot with full windows path and backslashes', function() {
    var compiler = new traceurAPI.NodeCompiler({
      // build ES6 style modules rather then cjs
      modules: 'register',

      // ensure the source map works
      sourceMaps: true
    });
    // windows-simulation, with .js
    var compiled = compiler.compile(contents, swapSlashFilename,
        swapSlashFilename, swapSlashDirname);
    assert.ok(compiled, 'can compile');
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
    var sourceMap = JSON.parse(compiler.getSourceMap());
    assert.equal(traceurDirname, sourceMap.sourceRoot,
        'has correct sourceRoot');
    assert(sourceMap.sources.some(function(name) {
      return (sourceMap.sourceRoot + '/' + name) === traceurFilename;
    }), 'One of the sources is the source');
  });

  test('modules: true', function() {
    var compiler = new traceurAPI.NodeCompiler({

      // build ES6 style modules rather then cjs
      modules: 'register',

      // node defaults to moduleName false
      moduleName: true,

      // ensure the source map works
      sourceMaps: true
    });
    var compiled = compiler.compile(contents, nativeFilename);
    assert.ok(compiled, 'can compile');
    assert.include(
      compiled,

      // the module path is relative to the cwd setting when we compile it.
      'commonjs/BasicImport',

      'module defines its path'
    );
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
  });

  test('named amd', function() {
    var compiled = traceurAPI.compile(contents, {
      // build ES6 style modules rather then cjs
      modules: 'amd',

      // enforce a module name in the AMD define
      moduleName: 'test-module'
    }, nativeFilename);

    assert.ok(compiled, 'can compile');

    var gotName;
    var define = function(name) {
      gotName = name;
    }

    eval(compiled);

    assert.ok(gotName == 'test-module', 'module defines into named AMD');
  });
});
