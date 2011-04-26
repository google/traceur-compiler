
goog.provide('goog.testing.LooseExpectationCollection'); 
goog.provide('goog.testing.LooseMock'); 
goog.require('goog.array'); 
goog.require('goog.structs.Map'); 
goog.require('goog.testing.Mock'); 
goog.testing.LooseExpectationCollection = function() { 
  this.expectations_ =[]; 
}; 
goog.testing.LooseExpectationCollection.prototype.addExpectation = function(expectation) { 
  this.expectations_.push(expectation); 
}; 
goog.testing.LooseExpectationCollection.prototype.getExpectations = function() { 
  return this.expectations_; 
}; 
goog.testing.LooseMock = function(objectToMock, opt_ignoreUnexpectedCalls, opt_mockStaticMethods, opt_createProxy) { 
  goog.testing.Mock.call(this, objectToMock, opt_mockStaticMethods, opt_createProxy); 
  this.$expectations_ = new goog.structs.Map(); 
  this.$calls_ =[]; 
  this.$ignoreUnexpectedCalls_ = ! ! opt_ignoreUnexpectedCalls; 
}; 
goog.inherits(goog.testing.LooseMock, goog.testing.Mock); 
goog.testing.LooseMock.prototype.$setIgnoreUnexpectedCalls = function(ignoreUnexpectedCalls) { 
  this.$ignoreUnexpectedCalls_ = ignoreUnexpectedCalls; 
  return this; 
}; 
goog.testing.LooseMock.prototype.$recordExpectation = function() { 
  if(! this.$expectations_.containsKey(this.$pendingExpectation.name)) { 
    this.$expectations_.set(this.$pendingExpectation.name, new goog.testing.LooseExpectationCollection()); 
  } 
  var collection = this.$expectations_.get(this.$pendingExpectation.name); 
  collection.addExpectation(this.$pendingExpectation); 
}; 
goog.testing.LooseMock.prototype.$recordCall = function(name, args) { 
  if(! this.$expectations_.containsKey(name)) { 
    if(this.$ignoreUnexpectedCalls_) { 
      return; 
    } 
    this.$throwCallException(name, args); 
  } 
  var collection = this.$expectations_.get(name); 
  var matchingExpectation = null; 
  var expectations = collection.getExpectations(); 
  for(var i = 0; i < expectations.length; i ++) { 
    var expectation = expectations[i]; 
    if(this.$verifyCall(expectation, name, args)) { 
      matchingExpectation = expectation; 
      if(expectation.actualCalls < expectation.maxCalls) { 
        break; 
      } 
    } 
  } 
  if(matchingExpectation == null) { 
    this.$throwCallException(name, args, expectation); 
  } 
  matchingExpectation.actualCalls ++; 
  if(matchingExpectation.actualCalls > matchingExpectation.maxCalls) { 
    this.$throwException('Too many calls to ' + matchingExpectation.name + '\nExpected: ' + matchingExpectation.maxCalls + ' but was: ' + matchingExpectation.actualCalls); 
  } 
  this.$calls_.push([name, args]); 
  return this.$do(matchingExpectation, args); 
}; 
goog.testing.LooseMock.prototype.$reset = function() { 
  goog.testing.LooseMock.superClass_.$reset.call(this); 
  this.$expectations_ = new goog.structs.Map(); 
  this.$calls_ =[]; 
}; 
goog.testing.LooseMock.prototype.$replay = function() { 
  goog.testing.LooseMock.superClass_.$replay.call(this); 
  var collections = this.$expectations_.getValues(); 
  for(var i = 0; i < collections.length; i ++) { 
    var expectations = collections[i].getExpectations(); 
    for(var j = 0; j < expectations.length; j ++) { 
      var expectation = expectations[j]; 
      if(! isFinite(expectation.maxCalls)) { 
        for(var k = j + 1; k < expectations.length; k ++) { 
          var laterExpectation = expectations[k]; 
          if(laterExpectation.minCalls > 0 && goog.array.equals(expectation.argumentList, laterExpectation.argumentList)) { 
            var name = expectation.name; 
            var argsString = this.$argumentsAsString(expectation.argumentList); 
            this.$throwException(['Expected call to ', name, ' with arguments ', argsString, ' has an infinite max number of calls; can\'t expect an', ' identical call later with a positive min number of calls'].join('')); 
          } 
        } 
      } 
    } 
  } 
}; 
goog.testing.LooseMock.prototype.$verify = function() { 
  goog.testing.LooseMock.superClass_.$verify.call(this); 
  var collections = this.$expectations_.getValues(); 
  for(var i = 0; i < collections.length; i ++) { 
    var expectations = collections[i].getExpectations(); 
    for(var j = 0; j < expectations.length; j ++) { 
      var expectation = expectations[j]; 
      if(expectation.actualCalls > expectation.maxCalls) { 
        this.$throwException('Too many calls to ' + expectation.name + '\nExpected: ' + expectation.maxCalls + ' but was: ' + expectation.actualCalls); 
      } else if(expectation.actualCalls < expectation.minCalls) { 
        this.$throwException('Not enough calls to ' + expectation.name + '\nExpected: ' + expectation.minCalls + ' but was: ' + expectation.actualCalls); 
      } 
    } 
  } 
}; 
