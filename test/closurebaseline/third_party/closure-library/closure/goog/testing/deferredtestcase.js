
goog.provide('goog.testing.DeferredTestCase'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.testing.AsyncTestCase'); 
goog.require('goog.testing.TestCase'); 
goog.testing.DeferredTestCase = function(opt_name) { 
  goog.testing.AsyncTestCase.call(this, opt_name); 
}; 
goog.inherits(goog.testing.DeferredTestCase, goog.testing.AsyncTestCase); 
goog.testing.DeferredTestCase.createAndInstall = function(opt_name) { 
  var deferredTestCase = new goog.testing.DeferredTestCase(opt_name); 
  goog.testing.TestCase.initializeTestRunner(deferredTestCase); 
  return deferredTestCase; 
}; 
goog.testing.DeferredTestCase.prototype.onError = function(err) { 
  this.doAsyncError(err); 
}; 
goog.testing.DeferredTestCase.prototype.onSuccess = function() { 
  this.continueTesting(); 
}; 
goog.testing.DeferredTestCase.prototype.addWaitForAsync = function(msg, d) { 
  d.addCallback(goog.bind(this.waitForAsync, this, msg)); 
}; 
goog.testing.DeferredTestCase.prototype.waitForDeferred = function(a, opt_b) { 
  var waitMsg; 
  var deferred; 
  switch(arguments.length) { 
    case 1: 
      deferred = a; 
      waitMsg = null; 
      break; 

    case 2: 
      deferred = opt_b; 
      waitMsg = a; 
      break; 

    default: 
      throw Error('Invalid number of arguments'); 

  } 
  deferred.addCallbacks(this.onSuccess, this.onError, this); 
  if(! waitMsg) { 
    waitMsg = 'Waiting for deferred in ' + this.activeTest.name; 
  } 
  this.waitForAsync((waitMsg)); 
  deferred.callback(true); 
}; 
