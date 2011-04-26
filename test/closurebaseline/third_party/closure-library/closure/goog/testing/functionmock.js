
goog.provide('goog.testing'); 
goog.provide('goog.testing.FunctionMock'); 
goog.provide('goog.testing.GlobalFunctionMock'); 
goog.provide('goog.testing.MethodMock'); 
goog.require('goog.object'); 
goog.require('goog.testing.MockInterface'); 
goog.require('goog.testing.PropertyReplacer'); 
goog.require('goog.testing.StrictMock'); 
goog.testing.FunctionMock = function(opt_functionName) { 
  var fn = function() { 
    var args = Array.prototype.slice.call(arguments); 
    args.splice(0, 0, opt_functionName || '[anonymous mocked function]'); 
    return fn.$mockMethod.apply(fn, args); 
  }; 
  goog.object.extend(fn, new goog.testing.StrictMock({ })); 
  return(fn); 
}; 
goog.testing.MethodMock = function(scope, functionName) { 
  if(!(functionName in scope)) { 
    throw Error(functionName + ' is not a property of the given scope.'); 
  } 
  var fn = goog.testing.FunctionMock(functionName); 
  fn.$propertyReplacer_ = new goog.testing.PropertyReplacer(); 
  fn.$propertyReplacer_.set(scope, functionName, fn); 
  fn.$tearDown = goog.testing.MethodMock.$tearDown; 
  return fn; 
}; 
goog.testing.MethodMock.$tearDown = function() { 
  this.$propertyReplacer_.reset(); 
}; 
goog.testing.GlobalFunctionMock = function(functionName) { 
  return goog.testing.MethodMock(goog.global, functionName); 
}; 
goog.testing.createFunctionMock = function(opt_functionName) { 
  return goog.testing.FunctionMock(opt_functionName); 
}; 
goog.testing.createMethodMock = function(scope, functionName) { 
  return goog.testing.MethodMock(scope, functionName); 
}; 
goog.testing.createConstructorMock = function(scope, constructorName) { 
  var realConstructor = scope[constructorName]; 
  var constructorMock = goog.testing.MethodMock(scope, constructorName); 
  for(var property in realConstructor) { 
    if(property != 'superClass_' && property != 'prototype' && realConstructor.hasOwnProperty(property)) { 
      constructorMock[property]= realConstructor[property]; 
    } 
  } 
  return constructorMock; 
}; 
goog.testing.createGlobalFunctionMock = function(functionName) { 
  return goog.testing.GlobalFunctionMock(functionName); 
}; 
