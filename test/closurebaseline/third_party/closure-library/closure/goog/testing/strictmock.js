
goog.provide('goog.testing.StrictMock'); 
goog.require('goog.array'); 
goog.require('goog.testing.Mock'); 
goog.testing.StrictMock = function(objectToMock, opt_mockStaticMethods, opt_createProxy) { 
  goog.testing.Mock.call(this, objectToMock, opt_mockStaticMethods, opt_createProxy); 
  this.$expectations_ =[]; 
}; 
goog.inherits(goog.testing.StrictMock, goog.testing.Mock); 
goog.testing.StrictMock.prototype.$recordExpectation = function() { 
  this.$expectations_.push(this.$pendingExpectation); 
}; 
goog.testing.StrictMock.prototype.$recordCall = function(name, args) { 
  if(this.$expectations_.length == 0) { 
    this.$throwCallException(name, args); 
  } 
  var currentExpectation = this.$expectations_[0]; 
  while(! this.$verifyCall(currentExpectation, name, args)) { 
    if(currentExpectation.actualCalls < currentExpectation.minCalls) { 
      this.$throwCallException(name, args, currentExpectation); 
    } 
    this.$expectations_.shift(); 
    if(this.$expectations_.length == 0) { 
      this.$throwCallException(name, args, currentExpectation); 
    } 
    currentExpectation = this.$expectations_[0]; 
  } 
  currentExpectation.actualCalls ++; 
  if(currentExpectation.actualCalls >= currentExpectation.maxCalls) { 
    this.$expectations_.shift(); 
  } 
  return this.$do(currentExpectation, args); 
}; 
goog.testing.StrictMock.prototype.$reset = function() { 
  goog.testing.StrictMock.superClass_.$reset.call(this); 
  goog.array.clear(this.$expectations_); 
}; 
goog.testing.StrictMock.prototype.$verify = function() { 
  goog.testing.StrictMock.superClass_.$verify.call(this); 
  while(this.$expectations_.length > 0) { 
    var expectation = this.$expectations_[0]; 
    if(expectation.actualCalls < expectation.minCalls) { 
      this.$throwException('Missing a call to ' + expectation.name + '\nExpected: ' + expectation.minCalls + ' but was: ' + expectation.actualCalls); 
    } else { 
      this.$expectations_.shift(); 
    } 
  } 
}; 
