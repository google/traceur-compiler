var fs = require('fs');
suite('node public api', function() {
  var traceur = require('../');
  var path = __dirname + '/commonjs/BasicImport.js';
  var contents =
    fs.readFileSync(path, 'utf8');

  test('moduleName from filename with backslashes', function() {
    var compiled = traceur.compile(contents, {
      // windows-simulation, with .js
      filename: path.replace(/\//g,'\\'),

      // build ES6 style modules rather then cjs
      modules: 'register',

      // node defaults to moduleName false
      moduleName: true,

      // ensure the source map works
      sourceMap: true
    });

    assert.deepEqual(compiled.errors, []);
    assert.ok(compiled.js, 'can compile');
    assert.include(
      compiled.js,

      // the module path is relative to the cwd setting when we compile it.
      'commonjs/BasicImport',

      'module name without backslashes'
    );
  });

  test('modules: true', function() {
    var compiled = traceur.compile(contents, {
      // absolute path is important
      filename: path,

      // build ES6 style modules rather then cjs
      modules: 'register',

      // node defaults to moduleName false
      moduleName: true,

      // ensure the source map works
      sourceMap: true
    });

    assert.deepEqual(compiled.errors, []);
    assert.ok(compiled.js, 'can compile');
    assert.include(
      compiled.js,

      // the module path is relative to the cwd setting when we compile it.
      'commonjs/BasicImport',

      'module defines its path'
    );
  });

  test('named amd', function() {
    var compiled = traceur.compile(contents, {
      // absolute path is important
      filename: path,

      // build ES6 style modules rather then cjs
      modules: 'amd',

      // enforce a module name in the AMD define
      moduleName: 'test-module'
    });

    assert.deepEqual(compiled.errors, []);
    assert.ok(compiled.js, 'can compile');

    var gotName;
    var define = function(name) {
      gotName = name;
    }

    eval(compiled.js);

    assert.ok(gotName == 'test-module', 'module defines into named AMD');
  });
});
