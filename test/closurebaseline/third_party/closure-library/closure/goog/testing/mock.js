
goog.provide('goog.testing.Mock'); 
goog.provide('goog.testing.MockExpectation'); 
goog.require('goog.array'); 
goog.require('goog.testing.JsUnitException'); 
goog.require('goog.testing.MockInterface'); 
goog.require('goog.testing.mockmatchers'); 
goog.testing.MockExpectation = function(name) { 
  this.name = name; 
  this.errorMessages =[]; 
}; 
goog.testing.MockExpectation.prototype.minCalls = 1; 
goog.testing.MockExpectation.prototype.maxCalls = 1; 
goog.testing.MockExpectation.prototype.returnValue; 
goog.testing.MockExpectation.prototype.exceptionToThrow; 
goog.testing.MockExpectation.prototype.argumentList; 
goog.testing.MockExpectation.prototype.actualCalls = 0; 
goog.testing.MockExpectation.prototype.verificationCalls = 0; 
goog.testing.MockExpectation.prototype.toDo; 
goog.testing.MockExpectation.prototype.addErrorMessage = function(message) { 
  this.errorMessages.push(message); 
}; 
goog.testing.MockExpectation.prototype.getErrorMessage = function() { 
  return this.errorMessages.join('\n'); 
}; 
goog.testing.MockExpectation.prototype.getErrorMessageCount = function() { 
  return this.errorMessages.length; 
}; 
goog.testing.Mock = function(objectToMock, opt_mockStaticMethods, opt_createProxy) { 
  if(! goog.isObject(objectToMock) && ! goog.isFunction(objectToMock)) { 
    throw new Error('objectToMock must be an object or constructor.'); 
  } 
  if(opt_createProxy && ! opt_mockStaticMethods && goog.isFunction(objectToMock)) { 
    try { 
      throw undefined; 
    } catch(tempCtor) { 
      (tempCtor = function tempCtor() { }); 
      ; 
      goog.inherits(tempCtor, objectToMock); 
      this.$proxy = new tempCtor(); 
    } 
  } else if(opt_createProxy && opt_mockStaticMethods && goog.isFunction(objectToMock)) { 
    throw Error('Cannot create a proxy when opt_mockStaticMethods is true'); 
  } else if(opt_createProxy && ! goog.isFunction(objectToMock)) { 
    throw Error('Must have a constructor to create a proxy'); 
  } 
  if(goog.isFunction(objectToMock) && ! opt_mockStaticMethods) { 
    this.$initializeFunctions_(objectToMock.prototype); 
  } else { 
    this.$initializeFunctions_(objectToMock); 
  } 
  this.$argumentListVerifiers_ = { }; 
}; 
goog.testing.Mock.prototype.$proxy = null; 
goog.testing.Mock.prototype.$argumentListVerifiers_; 
goog.testing.Mock.prototype.$recording_ = true; 
goog.testing.Mock.prototype.$pendingExpectation; 
goog.testing.Mock.prototype.$threwException_ = null; 
goog.testing.Mock.prototype.$initializeFunctions_ = function(objectToMock) { 
  for(var prop in objectToMock) { 
    if(typeof objectToMock[prop]== 'function') { 
      this[prop]= goog.bind(this.$mockMethod, this, prop); 
      if(this.$proxy) { 
        this.$proxy[prop]= goog.bind(this.$mockMethod, this, prop); 
      } 
    } 
  } 
}; 
goog.testing.Mock.prototype.$registerArgumentListVerifier = function(methodName, fn) { 
  this.$argumentListVerifiers_[methodName]= fn; 
  return this; 
}; 
goog.testing.Mock.prototype.$mockMethod = function(name) { 
  try { 
    var args = goog.array.slice(arguments, 1); 
    if(this.$recording_) { 
      this.$pendingExpectation = new goog.testing.MockExpectation(name); 
      this.$pendingExpectation.argumentList = args; 
      this.$recordExpectation(); 
      return this; 
    } else { 
      return this.$recordCall(name, args); 
    } 
  } catch(ex) { 
    this.$recordAndThrow(ex); 
  } 
}; 
goog.testing.Mock.prototype.$recordExpectation = function() { }; 
goog.testing.Mock.prototype.$recordCall = function(name, args) { 
  return undefined; 
}; 
goog.testing.Mock.prototype.$maybeThrow = function(expectation) { 
  if(typeof expectation.exceptionToThrow != 'undefined') { 
    throw expectation.exceptionToThrow; 
  } 
}; 
goog.testing.Mock.prototype.$do = function(expectation, args) { 
  if(typeof expectation.toDo == 'undefined') { 
    this.$maybeThrow(expectation); 
    return expectation.returnValue; 
  } else { 
    return expectation.toDo.apply(this, args); 
  } 
}; 
goog.testing.Mock.prototype.$returns = function(val) { 
  this.$pendingExpectation.returnValue = val; 
  return this; 
}; 
goog.testing.Mock.prototype.$throws = function(val) { 
  this.$pendingExpectation.exceptionToThrow = val; 
  return this; 
}; 
goog.testing.Mock.prototype.$does = function(func) { 
  this.$pendingExpectation.toDo = func; 
  return this; 
}; 
goog.testing.Mock.prototype.$atMostOnce = function() { 
  this.$pendingExpectation.minCalls = 0; 
  this.$pendingExpectation.maxCalls = 1; 
  return this; 
}; 
goog.testing.Mock.prototype.$atLeastOnce = function() { 
  this.$pendingExpectation.maxCalls = Infinity; 
  return this; 
}; 
goog.testing.Mock.prototype.$anyTimes = function() { 
  this.$pendingExpectation.minCalls = 0; 
  this.$pendingExpectation.maxCalls = Infinity; 
  return this; 
}; 
goog.testing.Mock.prototype.$times = function(times) { 
  this.$pendingExpectation.minCalls = times; 
  this.$pendingExpectation.maxCalls = times; 
  return this; 
}; 
goog.testing.Mock.prototype.$replay = function() { 
  this.$recording_ = false; 
}; 
goog.testing.Mock.prototype.$reset = function() { 
  this.$recording_ = true; 
  this.$threwException_ = null; 
  delete this.$pendingExpectation; 
}; 
goog.testing.Mock.prototype.$throwException = function(comment, opt_message) { 
  this.$recordAndThrow(new goog.testing.JsUnitException(comment, opt_message)); 
}; 
goog.testing.Mock.prototype.$recordAndThrow = function(ex) { 
  if(ex['isJsUnitException']) { 
    var testRunner = goog.global['G_testRunner']; 
    if(testRunner) { 
      var logTestFailureFunction = testRunner['logTestFailure']; 
      if(logTestFailureFunction) { 
        logTestFailureFunction.call(testRunner, ex); 
      } 
    } 
    if(! this.$threwException_) { 
      this.$threwException_ = ex; 
    } 
  } 
  throw ex; 
}; 
goog.testing.Mock.prototype.$verify = function() { 
  if(this.$threwException_) { 
    throw this.$threwException_; 
  } 
}; 
goog.testing.Mock.prototype.$verifyCall = function(expectation, name, args) { 
  if(expectation.name != name) { 
    return false; 
  } 
  var verifierFn = this.$argumentListVerifiers_[expectation.name]|| goog.testing.mockmatchers.flexibleArrayMatcher; 
  return verifierFn(expectation.argumentList, args, expectation); 
}; 
goog.testing.Mock.prototype.$argumentsAsString = function(args) { 
  var retVal =[]; 
  for(var i = 0; i < args.length; i ++) { 
    try { 
      retVal.push(goog.typeOf(args[i])); 
    } catch(e) { 
      retVal.push('[unknown]'); 
    } 
  } 
  return '(' + retVal.join(', ') + ')'; 
}; 
goog.testing.Mock.prototype.$throwCallException = function(name, args, opt_expectation) { 
  var errorStringBuffer =[]; 
  var actualArgsString = this.$argumentsAsString(args); 
  var expectedArgsString = opt_expectation ? this.$argumentsAsString(opt_expectation.argumentList): ''; 
  if(opt_expectation && opt_expectation.name == name) { 
    errorStringBuffer.push('Bad arguments to ', name, '().\n', 'Actual: ', actualArgsString, '\n', 'Expected: ', expectedArgsString, '\n', opt_expectation.getErrorMessage()); 
  } else { 
    errorStringBuffer.push('Unexpected call to ', name, actualArgsString, '.'); 
    if(opt_expectation) { 
      errorStringBuffer.push('\nNext expected call was to ', opt_expectation.name, expectedArgsString); 
    } 
  } 
  this.$throwException(errorStringBuffer.join('')); 
}; 
