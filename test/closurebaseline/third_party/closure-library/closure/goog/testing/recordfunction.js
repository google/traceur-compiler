
goog.provide('goog.testing.FunctionCall'); 
goog.provide('goog.testing.recordConstructor'); 
goog.provide('goog.testing.recordFunction'); 
goog.testing.recordFunction = function(opt_f) { 
  var f = opt_f || goog.nullFunction; 
  var calls =[]; 
  function recordedFunction() { 
    try { 
      var ret = f.apply(this, arguments); 
      calls.push(new goog.testing.FunctionCall(f, this, arguments, ret, null)); 
      return ret; 
    } catch(err) { 
      calls.push(new goog.testing.FunctionCall(f, this, arguments, undefined, err)); 
      throw err; 
    } 
  } 
  recordedFunction.getCallCount = function() { 
    return calls.length; 
  }; 
  recordedFunction.getCalls = function() { 
    return calls; 
  }; 
  recordedFunction.getLastCall = function() { 
    return calls[calls.length - 1]|| null; 
  }; 
  recordedFunction.popLastCall = function() { 
    return calls.pop() || null; 
  }; 
  return recordedFunction; 
}; 
goog.testing.recordConstructor = function(ctor) { 
  var recordedConstructor = goog.testing.recordFunction(ctor); 
  recordedConstructor.prototype = ctor.prototype; 
  goog.mixin(recordedConstructor, ctor); 
  return recordedConstructor; 
}; 
goog.testing.FunctionCall = function(func, thisContext, args, ret, error) { 
  this.function_ = func; 
  this.thisContext_ = thisContext; 
  this.arguments_ = Array.prototype.slice.call(args); 
  this.returnValue_ = ret; 
  this.error_ = error; 
}; 
goog.testing.FunctionCall.prototype.getFunction = function() { 
  return this.function_; 
}; 
goog.testing.FunctionCall.prototype.getThis = function() { 
  return this.thisContext_; 
}; 
goog.testing.FunctionCall.prototype.getArguments = function() { 
  return this.arguments_; 
}; 
goog.testing.FunctionCall.prototype.getArgument = function(index) { 
  return this.arguments_[index]; 
}; 
goog.testing.FunctionCall.prototype.getReturnValue = function() { 
  return this.returnValue_; 
}; 
goog.testing.FunctionCall.prototype.getError = function() { 
  return this.error_; 
}; 
