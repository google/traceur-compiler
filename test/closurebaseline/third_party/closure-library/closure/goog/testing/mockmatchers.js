
goog.provide('goog.testing.mockmatchers'); 
goog.provide('goog.testing.mockmatchers.ArgumentMatcher'); 
goog.provide('goog.testing.mockmatchers.IgnoreArgument'); 
goog.provide('goog.testing.mockmatchers.InstanceOf'); 
goog.provide('goog.testing.mockmatchers.ObjectEquals'); 
goog.provide('goog.testing.mockmatchers.RegexpMatch'); 
goog.provide('goog.testing.mockmatchers.SaveArgument'); 
goog.provide('goog.testing.mockmatchers.TypeOf'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.testing.asserts'); 
goog.testing.mockmatchers.ArgumentMatcher = function(opt_matchFn, opt_matchName) { 
  this.matchFn_ = opt_matchFn || null; 
  this.matchName_ = opt_matchName || null; 
}; 
goog.testing.mockmatchers.ArgumentMatcher.prototype.matches = function(toVerify, opt_expectation) { 
  if(this.matchFn_) { 
    var isamatch = this.matchFn_(toVerify); 
    if(! isamatch && opt_expectation) { 
      if(this.matchName_) { 
        opt_expectation.addErrorMessage('Expected: ' + this.matchName_ + ' but was: ' + _displayStringForValue(toVerify)); 
      } else { 
        opt_expectation.addErrorMessage('Expected: missing mockmatcher' + ' description but was: ' + _displayStringForValue(toVerify)); 
      } 
    } 
    return isamatch; 
  } else { 
    throw Error('No match function defined for this mock matcher'); 
  } 
}; 
goog.testing.mockmatchers.InstanceOf = function(ctor) { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this, function(obj) { 
    return obj instanceof ctor; 
  }, 'instanceOf()'); 
}; 
goog.inherits(goog.testing.mockmatchers.InstanceOf, goog.testing.mockmatchers.ArgumentMatcher); 
goog.testing.mockmatchers.TypeOf = function(type) { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this, function(obj) { 
    return goog.typeOf(obj) == type; 
  }, 'typeOf(' + type + ')'); 
}; 
goog.inherits(goog.testing.mockmatchers.TypeOf, goog.testing.mockmatchers.ArgumentMatcher); 
goog.testing.mockmatchers.RegexpMatch = function(regexp) { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this, function(str) { 
    return regexp.test(str); 
  }, 'match(' + regexp + ')'); 
}; 
goog.inherits(goog.testing.mockmatchers.RegexpMatch, goog.testing.mockmatchers.ArgumentMatcher); 
goog.testing.mockmatchers.IgnoreArgument = function() { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this, function() { 
    return true; 
  }, 'true'); 
}; 
goog.inherits(goog.testing.mockmatchers.IgnoreArgument, goog.testing.mockmatchers.ArgumentMatcher); 
goog.testing.mockmatchers.ObjectEquals = function(expectedObject) { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this, function(matchObject) { 
    assertObjectEquals('Expected equal objects', expectedObject, matchObject); 
    return true; 
  }, 'objectEquals(' + expectedObject + ')'); 
}; 
goog.inherits(goog.testing.mockmatchers.ObjectEquals, goog.testing.mockmatchers.ArgumentMatcher); 
goog.testing.mockmatchers.ObjectEquals.prototype.matches = function(toVerify, opt_expectation) { 
  try { 
    return goog.testing.mockmatchers.ObjectEquals.superClass_.matches.call(this, toVerify, opt_expectation); 
  } catch(e) { 
    if(opt_expectation) { 
      opt_expectation.addErrorMessage(e.message); 
    } 
    return false; 
  } 
}; 
goog.testing.mockmatchers.SaveArgument = function(opt_matcher, opt_matchName) { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this,(opt_matcher), opt_matchName); 
  if(opt_matcher instanceof goog.testing.mockmatchers.ArgumentMatcher) { 
    this.delegateMatcher_ = opt_matcher; 
  } else if(! opt_matcher) { 
    this.delegateMatcher_ = goog.testing.mockmatchers.ignoreArgument; 
  } 
}; 
goog.inherits(goog.testing.mockmatchers.SaveArgument, goog.testing.mockmatchers.ArgumentMatcher); 
goog.testing.mockmatchers.SaveArgument.prototype.matches = function(toVerify, opt_expectation) { 
  this.arg = toVerify; 
  if(this.delegateMatcher_) { 
    return this.delegateMatcher_.matches(toVerify, opt_expectation); 
  } 
  return goog.testing.mockmatchers.SaveArgument.superClass_.matches.call(this, toVerify, opt_expectation); 
}; 
goog.testing.mockmatchers.SaveArgument.prototype.arg; 
goog.testing.mockmatchers.ignoreArgument = new goog.testing.mockmatchers.IgnoreArgument(); 
goog.testing.mockmatchers.isArray = new goog.testing.mockmatchers.ArgumentMatcher(goog.isArray, 'isArray'); 
goog.testing.mockmatchers.isArrayLike = new goog.testing.mockmatchers.ArgumentMatcher(goog.isArrayLike, 'isArrayLike'); 
goog.testing.mockmatchers.isDateLike = new goog.testing.mockmatchers.ArgumentMatcher(goog.isDateLike, 'isDateLike'); 
goog.testing.mockmatchers.isString = new goog.testing.mockmatchers.ArgumentMatcher(goog.isString, 'isString'); 
goog.testing.mockmatchers.isBoolean = new goog.testing.mockmatchers.ArgumentMatcher(goog.isBoolean, 'isBoolean'); 
goog.testing.mockmatchers.isNumber = new goog.testing.mockmatchers.ArgumentMatcher(goog.isNumber, 'isNumber'); 
goog.testing.mockmatchers.isFunction = new goog.testing.mockmatchers.ArgumentMatcher(goog.isFunction, 'isFunction'); 
goog.testing.mockmatchers.isObject = new goog.testing.mockmatchers.ArgumentMatcher(goog.isObject, 'isObject'); 
goog.testing.mockmatchers.isNodeLike = new goog.testing.mockmatchers.ArgumentMatcher(goog.dom.isNodeLike, 'isNodeLike'); 
goog.testing.mockmatchers.flexibleArrayMatcher = function(expectedArr, arr, opt_expectation) { 
  return goog.array.equals(expectedArr, arr, function(a, b) { 
    var errCount = 0; 
    if(opt_expectation) { 
      errCount = opt_expectation.getErrorMessageCount(); 
    } 
    var isamatch = a === b || a instanceof goog.testing.mockmatchers.ArgumentMatcher && a.matches(b, opt_expectation); 
    var failureMessage = null; 
    if(! isamatch) { 
      failureMessage = goog.testing.asserts.findDifferences(a, b); 
      isamatch = ! failureMessage; 
    } 
    if(! isamatch && opt_expectation) { 
      if(errCount == opt_expectation.getErrorMessageCount()) { 
        if(! failureMessage) { 
          failureMessage = 'Expected: ' + _displayStringForValue(a) + ' but was: ' + _displayStringForValue(b); 
        } 
        opt_expectation.addErrorMessage(failureMessage); 
      } 
    } 
    return isamatch; 
  }); 
}; 
