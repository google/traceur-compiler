
goog.provide('goog.testing.async.MockControl'); 
goog.require('goog.asserts'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.debug'); 
goog.require('goog.testing.asserts'); 
goog.require('goog.testing.mockmatchers.IgnoreArgument'); 
goog.testing.async.MockControl = function(mockControl) { 
  this.mockControl_ = mockControl; 
}; 
goog.testing.async.MockControl.prototype.createCallbackMock = function(name, callback, opt_selfObj) { 
  goog.asserts.assert(goog.isString(name), 'name parameter ' + goog.debug.deepExpose(name) + ' should be a string'); 
  var ignored = new goog.testing.mockmatchers.IgnoreArgument(); 
  var obj =(this.mockControl_.createFunctionMock(name)); 
  var fn =(obj); 
  fn(ignored).$does(function(args) { 
    if(opt_selfObj) { 
      callback = goog.bind(callback, opt_selfObj); 
    } 
    return callback.apply(this, args); 
  }); 
  fn.$replay(); 
  return function() { 
    return fn(arguments); 
  }; 
}; 
goog.testing.async.MockControl.prototype.asyncAssertEquals = function(message, var_args) { 
  var expectedArgs = Array.prototype.slice.call(arguments, 1); 
  return this.createCallbackMock('asyncAssertEquals', function() { 
    assertObjectEquals(message, expectedArgs, Array.prototype.slice.call(arguments)); 
  }); 
}; 
goog.testing.async.MockControl.prototype.assertDeferredError = function(deferred, fn) { 
  deferred.addErrback(this.createCallbackMock('assertDeferredError', function() { })); 
  goog.testing.asserts.callWithoutLogging(fn); 
}; 
goog.testing.async.MockControl.prototype.assertDeferredEquals = function(message, expected, actual) { 
  if(expected instanceof goog.async.Deferred && actual instanceof goog.async.Deferred) { 
    expected.addCallback(this.createCallbackMock('assertDeferredEquals', function(exp) { 
      actual.addCallback(this.asyncAssertEquals(message, exp)); 
    }, this)); 
  } else if(expected instanceof goog.async.Deferred) { 
    expected.addCallback(this.createCallbackMock('assertDeferredEquals', function(exp) { 
      assertObjectEquals(message, exp, actual); 
    })); 
  } else if(actual instanceof goog.async.Deferred) { 
    actual.addCallback(this.asyncAssertEquals(message, expected)); 
  } else { 
    throw Error('Either expected or actual must be deferred'); 
  } 
}; 
