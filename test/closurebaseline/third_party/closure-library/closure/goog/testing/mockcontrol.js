
goog.provide('goog.testing.MockControl'); 
goog.require('goog.array'); 
goog.require('goog.testing'); 
goog.require('goog.testing.LooseMock'); 
goog.require('goog.testing.MockInterface'); 
goog.require('goog.testing.StrictMock'); 
goog.testing.MockControl = function() { 
  this.mocks_ =[]; 
}; 
goog.testing.MockControl.prototype.addMock = function(mock) { 
  this.mocks_.push(mock); 
  return mock; 
}; 
goog.testing.MockControl.prototype.$replayAll = function() { 
  goog.array.forEach(this.mocks_, function(m) { 
    m.$replay(); 
  }); 
}; 
goog.testing.MockControl.prototype.$resetAll = function() { 
  goog.array.forEach(this.mocks_, function(m) { 
    m.$reset(); 
  }); 
}; 
goog.testing.MockControl.prototype.$verifyAll = function() { 
  goog.array.forEach(this.mocks_, function(m) { 
    m.$verify(); 
  }); 
}; 
goog.testing.MockControl.prototype.$tearDown = function() { 
  goog.array.forEach(this.mocks_, function(m) { 
    if(m.$tearDown) { 
      m.$tearDown(); 
    } 
  }); 
}; 
goog.testing.MockControl.prototype.createStrictMock = function(objectToMock, opt_mockStaticMethods, opt_createProxy) { 
  var m = new goog.testing.StrictMock(objectToMock, opt_mockStaticMethods, opt_createProxy); 
  this.addMock(m); 
  return m; 
}; 
goog.testing.MockControl.prototype.createLooseMock = function(objectToMock, opt_ignoreUnexpectedCalls, opt_mockStaticMethods, opt_createProxy) { 
  var m = new goog.testing.LooseMock(objectToMock, opt_ignoreUnexpectedCalls, opt_mockStaticMethods, opt_createProxy); 
  this.addMock(m); 
  return m; 
}; 
goog.testing.MockControl.prototype.createFunctionMock = function(opt_functionName) { 
  var m = goog.testing.createFunctionMock(opt_functionName); 
  this.addMock(m); 
  return m; 
}; 
goog.testing.MockControl.prototype.createMethodMock = function(scope, functionName) { 
  var m = goog.testing.createMethodMock(scope, functionName); 
  this.addMock(m); 
  return m; 
}; 
goog.testing.MockControl.prototype.createConstructorMock = function(scope, constructorName) { 
  var m = goog.testing.createConstructorMock(scope, constructorName); 
  this.addMock(m); 
  return m; 
}; 
goog.testing.MockControl.prototype.createGlobalFunctionMock = function(functionName) { 
  var m = goog.testing.createGlobalFunctionMock(functionName); 
  this.addMock(m); 
  return m; 
}; 
