
goog.provide('goog.asserts'); 
goog.provide('goog.asserts.AssertionError'); 
goog.require('goog.debug.Error'); 
goog.require('goog.string'); 
goog.asserts.ENABLE_ASSERTS = goog.DEBUG; 
goog.asserts.AssertionError = function(messagePattern, messageArgs) { 
  messageArgs.unshift(messagePattern); 
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs)); 
  messageArgs.shift(); 
  this.messagePattern = messagePattern; 
}; 
goog.inherits(goog.asserts.AssertionError, goog.debug.Error); 
goog.asserts.AssertionError.prototype.name = 'AssertionError'; 
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) { 
  var message = 'Assertion failed'; 
  if(givenMessage) { 
    message += ': ' + givenMessage; 
    var args = givenArgs; 
  } else if(defaultMessage) { 
    message += ': ' + defaultMessage; 
    args = defaultArgs; 
  } 
  throw new goog.asserts.AssertionError('' + message, args ||[]); 
}; 
goog.asserts.assert = function(condition, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! condition) { 
    goog.asserts.doAssertFailure_('', null, opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return condition; 
}; 
goog.asserts.fail = function(opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS) { 
    throw new goog.asserts.AssertionError('Failure' +(opt_message ? ': ' + opt_message: ''), Array.prototype.slice.call(arguments, 1)); 
  } 
}; 
goog.asserts.assertNumber = function(value, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! goog.isNumber(value)) { 
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',[goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return(value); 
}; 
goog.asserts.assertString = function(value, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! goog.isString(value)) { 
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',[goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return(value); 
}; 
goog.asserts.assertFunction = function(value, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! goog.isFunction(value)) { 
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',[goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return(value); 
}; 
goog.asserts.assertObject = function(value, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! goog.isObject(value)) { 
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',[goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return(value); 
}; 
goog.asserts.assertArray = function(value, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! goog.isArray(value)) { 
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',[goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return(value); 
}; 
goog.asserts.assertBoolean = function(value, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && ! goog.isBoolean(value)) { 
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',[goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2)); 
  } 
  return(value); 
}; 
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) { 
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) { 
    goog.asserts.doAssertFailure_('instanceof check failed.', null, opt_message, Array.prototype.slice.call(arguments, 3)); 
  } 
}; 
