var fs = require('fs');
suite('node public api', function() {
  var traceur = require('../');
  var path = __dirname + '/commonjs/BasicImport.js';
  var contents =
    fs.readFileSync(path, 'utf8');

  test('modules: true', function() {
    var compiled = traceur.compile(contents, {
      // absolute path is important
      filename: path,

      // build ES6 style modules rather then cjs
      modules: 'register',

      // cwd is this test directory
      cwd: __dirname,

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
});
