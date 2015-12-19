
var assert = require('chai').assert;
var traceurSystem = require('../src/node/System.js');
var System = require('../third_party/es6-module-loader/index').System;
global.System = traceurSystem;
var Options = global.traceur.util.Options;

System.baseURL = __dirname + '/instantiate/';

var traceurOptions;

suite('instantiate', function() {

  beforeEach(function() {
    traceurOptions = null;
    System.translate = function(load) {
      load.metadata.traceurOptions = traceurOptions;
      return load.source;
    };
  });

  test('Inheritance', function(done) {
    System.import('./inheritance.js').then(function(m) {
      assert.instanceOf(m.test, m.Bar);
      assert.instanceOf(m.test, m.Foo);
      done();
    }).catch(done);
  });

  test('Variable Hoisting', function(done) {
    System.import('./hoisting.js').then(function(m) {
      assert.equal(m.a, 1);
      done();
    }).catch(done);
  });

  test('Circular dependencies', function(done) {
    System.import('./circular1.js').then(function(m1) {
      System.import('./circular2.js').then(function(m2) {
        assert.equal(m2.output, 'test circular 1');
        assert.equal(m1.output, 'test circular 2');
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Circular annotations', function(done) {
    traceurOptions = new Options();
    traceurOptions.types = true;
    traceurOptions.annotations = true;
    traceurOptions.validate = true;
    System.import('./circular_annotation1.js').then(function(m1) {
      System.import('./circular_annotation2.js').then(function(m2) {
        assert.instanceOf(m1.BarAnnotation.annotations[0], m2.FooAnnotation);
        assert.instanceOf(m2.FooAnnotation.annotations[0], m1.BarAnnotation);
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Circular parameter annotations', function(done) {
    System.import('./circular_annotation1.js').then(function(m1) {
      System.import('./circular_annotation2.js').then(function(m2) {
        assert.instanceOf(m1.BarAnnotation.parameters[0][0], m2.FooAnnotation);
        assert.instanceOf(m2.FooAnnotation.parameters[0][0], m1.BarAnnotation);
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Circular type annotations', function(done) {
    System.import('./circular_annotation1.js').then(function(m1) {
      System.import('./circular_annotation2.js').then(function(m2) {
        assert.equal(m1.BarAnnotation.parameters[1][0], m2.FooAnnotation);
        assert.equal(m2.FooAnnotation.parameters[1][0], m1.BarAnnotation);
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Re-export', function(done) {
    System.import('./reexport1.js').then(function(m) {
      assert(m.p, 5);
      done();
    }).catch(done);
  });

  test('Re-export bindings', function(done) {
    System.import('./reexport-binding.js').then(function(m) {
      System.import('./rebinding.js').then(function(m) {
        assert.equal(m.p, 4);
        done();
      }).catch(done);
    }).catch(done);
  });

  test('Shorthand syntax with import', function(done) {
    System.import('./shorthand.js').then(function(m) {
      done();
    }).catch(done);
  });

  test('Export Reassignments', function(done) {
    System.import('./export-reassignment.js').then(function(m) {
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
    System.import('./postfix-operator.js').then(function(m) {
      assert.equal(m.a, 5);
      assert.equal(m.b, 5);
      assert.equal(m.c, 6);
      assert.equal(m.d, 5);
      done();
    }).catch(done);
  });

  test('Module import', function(done) {
    System.import('./module-import.js').then(function(m) {
      assert.equal(m.default, -6);
      done();
    }).catch(done);
  });

  test('Export Star', function(done) {
    System.import('./export-reassignment.js').then(function(ma) {
      return System.import('./export-star.js').then(function(mb) {
        assert.equal(mb.a, -6);
        assert.equal(mb.b, 'localvalue');
        ma.reassign(); // updates the a export variable to 10, which should push the change out
        assert.equal(mb.a, 10);
        assert.equal(mb.b, 'localvalue');
        assert.equal(mb.default, undefined);
        done();
      });
    }).catch(done);
  });

  test('Generator exports', function(done) {
    System.import('./generator.js').then(function(m) {
      done();
    }).catch(done);
  });

  test('Export default function parsing', function(done) {
    System.import('./export-default-fn.js').then(function(m) {
      assert.equal(m.test, undefined);
      done();
    }).catch(done);
  });

  test('Export default class', function(done) {
    System.import('./export-default-class.js').then(function(m) {
      var f = new m.default();
      assert.equal(f.foo(), 'foo');
      done();
    }).catch(done);
  });

  test('Export star as', function(done) {
    System.import('./export-star-as.js').then(function(m) {
      assert.equal(2, m.a.b);
      done();
    }).catch(done);
  });

  test('Export name from', function(done) {
    traceurOptions = new Options();
    traceurOptions.exportFromExtended = true;
    traceurOptions.validate = true;
    System.import('./export-forward-default.js').then(function(m) {
      assert.equal(42, m.a);
      done();
    }).catch(done);
  });

  test('Export destructuring', function(done) {
    System.import('./export-destructuring.js').then(function(m) {
      assert.equal(1, m.x);
      assert.equal(2, m.y);
      m.f();
      assert.equal(3, m.x);
      done();
    }).catch(done);
  });

  test('__moduleName support', function(done) {
    System.import('./module-name.js').then(function(m) {
      // note that strictly module name should be a URL with the latest loader implementation
      assert.equal('module-name.js', m.name);
      assert.equal(42, m.f(42));
      done();
    }).catch(done);
  });

});
