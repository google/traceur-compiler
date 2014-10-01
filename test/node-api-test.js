var fs = require('fs');
var path = require('path');
suite('node public api', function() {
  var traceurAPI = require('../src/node/api.js');
  var filename = __dirname + '/commonjs/BasicImport.js';
  var contents =
    fs.readFileSync(filename, 'utf8');

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
    var compiled = compiler.compile(contents, filename.replace(/\//g,'\\'));
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
    var windowsLikeFilename = filename.replace(/\//g,'\\');
    var windowsLikeDirname  = path.dirname(filename).replace(/\//g,'\\');
    var compiled = compiler.compile(contents, windowsLikeFilename,
        windowsLikeFilename, windowsLikeDirname);
    assert.ok(compiled, 'can compile');
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
    var sourceMap = JSON.parse(compiler.getSourceMap());
    assert.equal(__dirname + '/commonjs/', sourceMap.sourceRoot,
        'has correct sourceRoot');
    assert(sourceMap.sources.some(function(name) {
      return (sourceMap.sourceRoot + name) === filename;
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
    var windowsLikeDirname = 'D:\\traceur\\test\\commonjs\\';
    var windowsLikeFilename = windowsLikeDirname + 'BasicImport.js';
    var compiled = compiler.compile(contents, windowsLikeFilename,
        windowsLikeFilename, windowsLikeDirname);
    assert.ok(compiled, 'can compile');
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
    var sourceMap = JSON.parse(compiler.getSourceMap());
    assert.equal(windowsLikeDirname.replace(/\\/g,'/'), sourceMap.sourceRoot,
        'has correct sourceRoot');
    var forwardSlashedName = windowsLikeFilename.replace(/\\/g,'/');
    assert(sourceMap.sources.some(function(name) {
      return (sourceMap.sourceRoot + name) === forwardSlashedName;
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
    var compiled = compiler.compile(contents, filename);
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
    }, filename);

    assert.ok(compiled, 'can compile');

    var gotName;
    var define = function(name) {
      gotName = name;
    }

    eval(compiled);

    assert.ok(gotName == 'test-module', 'module defines into named AMD');
  });
});
