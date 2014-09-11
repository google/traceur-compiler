
var traceurSystem = global.System;
var System = require('../third_party/es6-module-loader/index').System;
global.System = traceurSystem;

System.baseURL = __dirname + '/instantiate/';

suite('instantiate', function() {
  test('Inheritance', function(done) {
    System.import('inheritance').then(function(m) {
      assert.instanceOf(m.test, m.Bar);
      assert.instanceOf(m.test, m.Foo);
      done();
    }).catch(done);
  });

  test('Variable Hoisting', function(done) {
    System.import('hoisting').then(function(m) {
      assert.equal(m.a, 1);
      done();
    }).catch(done);
  });

  test('Circular dependencies', function(done) {
    System.import('circular1').then(function(m1) {
      System.import('circular2').then(function(m2) {
        assert.equal(m2.output, 'test circular 1');
        assert.equal(m1.output, 'test circular 2');
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Re-export', function(done) {
    System.import('reexport1').then(function(m) {
      assert(m.p, 5);
      done();
    }).catch(done);
  });

  test('Re-export bindings', function(done) {
    System.import('reexport-binding').then(function(m) {
      System.import('rebinding').then(function(m) {
        assert.equal(m.p, 4);
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Shorthand syntax with import', function(done) {
    System.import('shorthand').then(function(m) {
      done();
    }).catch(done);
  });

  test('Export Reassignments', function(done) {
    System.import('export-reassignment').then(function(m) {
      assert.equal(m.a, -6);
      assert.equal(m.b, 6);
      assert.equal(m.c, 'number');
      assert.equal(m.d, 4);
      assert.equal(m.e, 6);
      assert.equal(m.default, 5);
      done();
    }).catch(done);
  });

  test('Postfix Operator', function(done) {
    System.import('postfix-operator').then(function(m) {
      assert.equal(m.a, 5);
      assert.equal(m.b, 5);
      assert.equal(m.c, 6);
      assert.equal(m.d, 5);
      done();
    }).catch(done);
  });

  test('Module import', function(done) {
    System.import('module-import').then(function(m) {
      assert.equal(m.default, -6);
      done();
    }).catch(done);
  });

  test('Export Star', function(done) {
    System.import('export-reassignment').then(function(ma) {
      return System.import('export-star').then(function(mb) {
        assert.equal(mb.a, -6);
        ma.reassign(); // updates the a export variable to 10, which should push the change out
        assert.equal(mb.a, 10);
        done();
      });
    }).catch(done);
  });

  test('Generator exports', function(done) {
    System.import('generator').then(function(m) {
      done();
    }).catch(done);
  });
});
