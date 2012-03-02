/*globals require module exports console define*/
(function (global, factory) { 
    // https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
    if (typeof exports === 'object') {  // Node. 
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      testModule['assert'] = factory();
    }
}(this,  function() {

  var assert = {
    ok: function(value) {
      console.assert(value);
    },
    strictEqual: function(actual, expected) {
      console.assert(actual === expected);
    },
    equal: function(actual, expected) {
     console.assert(actual === expected);
    },
    throws: function(mustThrow) {
      try {
        mustThrow();
        console.assert("must throw");
      } catch(exc) {
        // success
      }
    },
    doesNotThrow: function(mustNotThrow) {
      try {
        mustNotThrow();
      } catch(exc) {
        console.assert("must Not throw");
      }
    },
    deepEqual: function(actual, expected) {
      Object.keys(actual).forEach(function(key) {
        if (actual[key] !== expected) {
          console.assert("deepEqual fails");
        }
        if(typeof actual[key] === 'object') {
          assert.deepEqual(actual[key], expected[key]);
        }
      });
    }
  };
    
  return assert;
}));