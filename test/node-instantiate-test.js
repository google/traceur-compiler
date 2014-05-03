var System = require('../third_party/es6-module-loader/index').System;

System.baseURL = __dirname + '/instantiate/';

suite('instantiate', function() {
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
        assert.equal(m.p, 3);
        done();
      }).catch(done);
    }).catch(done);
  });
});