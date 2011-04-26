
goog.provide('goog.debug.ErrorHandler'); 
goog.require('goog.debug'); 
goog.require('goog.debug.EntryPointMonitor'); 
goog.require('goog.debug.Trace'); 
goog.debug.ErrorHandler = function(handler) { 
  goog.base(this); 
  this.errorHandlerFn_ = handler; 
}; 
goog.inherits(goog.debug.ErrorHandler, goog.Disposable); 
goog.debug.ErrorHandler.prototype.addTracersToProtectedFunctions_ = false; 
goog.debug.ErrorHandler.prototype.setAddTracersToProtectedFunctions = function(newVal) { 
  this.addTracersToProtectedFunctions_ = newVal; 
}; 
goog.debug.ErrorHandler.prototype.wrap = function(fn) { 
  return this.protectEntryPoint(fn); 
}; 
goog.debug.ErrorHandler.prototype.unwrap = function(fn) { 
  return fn[this.getFunctionIndex_(false)]|| fn; 
}; 
goog.debug.ErrorHandler.prototype.getStackTraceHolder_ = function(stackTrace) { 
  var buffer =[]; 
  buffer.push('##PE_STACK_START##'); 
  buffer.push(stackTrace.replace(/(\r\n|\r|\n)/g, '##STACK_BR##')); 
  buffer.push('##PE_STACK_END##'); 
  return buffer.join(''); 
}; 
goog.debug.ErrorHandler.prototype.getFunctionIndex_ = function(wrapper) { 
  return(wrapper ? '__wrapper_': '__protected_') + goog.getUid(this) + '__'; 
}; 
goog.debug.ErrorHandler.prototype.protectEntryPoint = function(fn) { 
  var protectedFnName = this.getFunctionIndex_(true); 
  if(! fn[protectedFnName]) { 
    var wrapper = fn[protectedFnName]= this.getProtectedFunction(fn); 
    wrapper[this.getFunctionIndex_(false)]= fn; 
  } 
  return fn[protectedFnName]; 
}; 
goog.debug.ErrorHandler.prototype.getProtectedFunction = function(fn) { 
  var that = this; 
  var tracers = this.addTracersToProtectedFunctions_; 
  if(tracers) { 
    var stackTrace = goog.debug.getStacktraceSimple(15); 
  } 
  var result = function() { 
    if(that.isDisposed()) { 
      return fn.apply(this, arguments); 
    } 
    if(tracers) { 
      var tracer = goog.debug.Trace.startTracer('protectedEntryPoint: ' + that.getStackTraceHolder_(stackTrace)); 
    } 
    try { 
      return fn.apply(this, arguments); 
    } catch(e) { 
      that.errorHandlerFn_(e); 
      throw e; 
    } finally { 
      if(tracers) { 
        goog.debug.Trace.stopTracer(tracer); 
      } 
    } 
  }; 
  result[this.getFunctionIndex_(false)]= fn; 
  return result; 
}; 
goog.debug.ErrorHandler.prototype.protectWindowSetTimeout = function() { 
  this.protectWindowFunctionsHelper_('setTimeout'); 
}; 
goog.debug.ErrorHandler.prototype.protectWindowSetInterval = function() { 
  this.protectWindowFunctionsHelper_('setInterval'); 
}; 
goog.debug.ErrorHandler.prototype.protectWindowFunctionsHelper_ = function(fnName) { 
  var win = goog.getObjectByName('window'); 
  var originalFn = win[fnName]; 
  var that = this; 
  win[fnName]= function(fn, time) { 
    if(goog.isString(fn)) { 
      fn = goog.partial(goog.globalEval, fn); 
    } 
    fn = that.protectEntryPoint(fn); 
    if(originalFn.call) { 
      return originalFn.call(this, fn, time); 
    } else { 
      return originalFn(fn, time); 
    } 
  }; 
  win[fnName][this.getFunctionIndex_(false)]= originalFn; 
}; 
goog.debug.ErrorHandler.prototype.disposeInternal = function() { 
  var win = goog.getObjectByName('window'); 
  win.setTimeout = this.unwrap(win.setTimeout); 
  win.setInterval = this.unwrap(win.setInterval); 
  goog.base(this, 'disposeInternal'); 
}; 
