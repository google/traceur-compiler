var fs = require('fs');
suite('node public api', function() {
  var traceurAPI = require('../src/node/api.js');
  var path = __dirname + '/commonjs/BasicImport.js';
  var contents =
    fs.readFileSync(path, 'utf8');

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
    var compiled = compiler.compile(contents, path.replace(/\//g,'\\'));
    assert.ok(compiled, 'can compile');
    assert.include(
      compiled,

      // the module path is relative to the cwd setting when we compile it.
      'commonjs/BasicImport',

      'module name without backslashes'
    );
    assert.ok(compiler.getSourceMap(), 'has sourceMap');
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
    var compiled = compiler.compile(contents, path);
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
    }, path);

    assert.ok(compiled, 'can compile');

    var gotName;
    var define = function(name) {
      gotName = name;
    }

    eval(compiled);

    assert.ok(gotName == 'test-module', 'module defines into named AMD');
  });
});
