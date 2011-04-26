
goog.provide('goog.net.MockIFrameIo'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.net.ErrorCode'); 
goog.require('goog.net.IframeIo'); 
goog.require('goog.net.IframeIo.IncrementalDataEvent'); 
goog.net.MockIFrameIo = function(testQueue) { 
  goog.events.EventTarget.call(this); 
  this.testQueue_ = testQueue; 
}; 
goog.inherits(goog.net.MockIFrameIo, goog.events.EventTarget); 
goog.net.MockIFrameIo.prototype.active_ = false; 
goog.net.MockIFrameIo.prototype.lastContent_ = ''; 
goog.net.MockIFrameIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
goog.net.MockIFrameIo.prototype.lastError_ = ''; 
goog.net.MockIFrameIo.prototype.lastCustomError_ = null; 
goog.net.MockIFrameIo.prototype.lastUri_ = null; 
goog.net.MockIFrameIo.prototype.send = function(uri, opt_method, opt_noCache, opt_data) { 
  if(this.active_) { 
    throw Error('[goog.net.IframeIo] Unable to send, already active.'); 
  } 
  this.testQueue_.enqueue(['s', uri, opt_method, opt_noCache, opt_data]); 
  this.complete_ = false; 
  this.active_ = true; 
}; 
goog.net.MockIFrameIo.prototype.sendFromForm = function(form, opt_uri, opt_noCache) { 
  if(this.active_) { 
    throw Error('[goog.net.IframeIo] Unable to send, already active.'); 
  } 
  this.testQueue_.enqueue(['s', form, opt_uri, opt_noCache]); 
  this.complete_ = false; 
  this.active_ = true; 
}; 
goog.net.MockIFrameIo.prototype.abort = function(opt_failureCode) { 
  if(this.active_) { 
    this.testQueue_.enqueue(['a', opt_failureCode]); 
    this.complete_ = false; 
    this.active_ = false; 
    this.success_ = false; 
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT; 
    this.dispatchEvent(goog.net.EventType.ABORT); 
    this.simulateReady(); 
  } 
}; 
goog.net.MockIFrameIo.prototype.simulateIncrementalData = function(data) { 
  this.dispatchEvent(new goog.net.IframeIo.IncrementalDataEvent(data)); 
}; 
goog.net.MockIFrameIo.prototype.simulateDone = function(errorCode) { 
  if(errorCode) { 
    this.success_ = false; 
    this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR; 
    this.lastError_ = this.getLastError(); 
    this.dispatchEvent(goog.net.EventType.ERROR); 
  } else { 
    this.success_ = true; 
    this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
    this.dispatchEvent(goog.net.EventType.SUCCESS); 
  } 
  this.complete_ = true; 
  this.dispatchEvent(goog.net.EventType.COMPLETE); 
}; 
goog.net.MockIFrameIo.prototype.simulateReady = function() { 
  this.dispatchEvent(goog.net.EventType.READY); 
}; 
goog.net.MockIFrameIo.prototype.isComplete = function() { 
  return this.complete_; 
}; 
goog.net.MockIFrameIo.prototype.isSuccess = function() { 
  return this.success_; 
}; 
goog.net.MockIFrameIo.prototype.isActive = function() { 
  return this.active_; 
}; 
goog.net.MockIFrameIo.prototype.getResponseText = function() { 
  return this.lastContent_; 
}; 
goog.net.MockIFrameIo.prototype.getResponseJson = function() { 
  return goog.json.parse(this.lastContent_); 
}; 
goog.net.MockIFrameIo.prototype.getLastUri = function() { 
  return this.lastUri_; 
}; 
goog.net.MockIFrameIo.prototype.getLastErrorCode = function() { 
  return this.lastErrorCode_; 
}; 
goog.net.MockIFrameIo.prototype.getLastError = function() { 
  return goog.net.ErrorCode.getDebugMessage(this.lastErrorCode_); 
}; 
goog.net.MockIFrameIo.prototype.getLastCustomError = function() { 
  return this.lastCustomError_; 
}; 
goog.net.MockIFrameIo.prototype.setErrorChecker = function(fn) { 
  this.errorChecker_ = fn; 
}; 
goog.net.MockIFrameIo.prototype.getErrorChecker = function() { 
  return this.errorChecker_; 
}; 
goog.net.MockIFrameIo.prototype.getTimeoutInterval = function() { 
  return this.timeoutInterval_; 
}; 
goog.net.MockIFrameIo.prototype.setTimeoutInterval = function(ms) { 
  this.timeoutInterval_ = Math.max(0, ms); 
}; 
