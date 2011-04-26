
goog.provide('goog.testing.net.XhrIo'); 
goog.require('goog.array'); 
goog.require('goog.dom.xml'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.json'); 
goog.require('goog.net.ErrorCode'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.HttpStatus'); 
goog.require('goog.net.XhrIo.ResponseType'); 
goog.require('goog.net.XmlHttp'); 
goog.require('goog.object'); 
goog.require('goog.structs.Map'); 
goog.require('goog.uri.utils'); 
goog.testing.net.XhrIo = function(opt_testQueue) { 
  goog.events.EventTarget.call(this); 
  this.headers = new goog.structs.Map(); 
  this.testQueue_ = opt_testQueue || null; 
}; 
goog.inherits(goog.testing.net.XhrIo, goog.events.EventTarget); 
goog.testing.net.XhrIo.sendInstances_ =[]; 
goog.testing.net.XhrIo.getSendInstances = function() { 
  return goog.testing.net.XhrIo.sendInstances_; 
}; 
goog.testing.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content, opt_headers, opt_timeoutInterval) { 
  var x = new goog.testing.net.XhrIo(); 
  goog.testing.net.XhrIo.sendInstances_.push(x); 
  if(opt_callback) { 
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback); 
  } 
  goog.events.listen(x, goog.net.EventType.READY, goog.partial(goog.testing.net.XhrIo.cleanupSend_, x)); 
  if(opt_timeoutInterval) { 
    x.setTimeoutInterval(opt_timeoutInterval); 
  } 
  x.send(url, opt_method, opt_content, opt_headers); 
}; 
goog.testing.net.XhrIo.cleanupSend_ = function(XhrIo) { 
  XhrIo.dispose(); 
  goog.array.remove(goog.testing.net.XhrIo.sendInstances_, XhrIo); 
}; 
goog.testing.net.XhrIo.prototype.responseHeaders_; 
goog.testing.net.XhrIo.prototype.active_ = false; 
goog.testing.net.XhrIo.prototype.lastUri_ = ''; 
goog.testing.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
goog.testing.net.XhrIo.prototype.lastError_ = ''; 
goog.testing.net.XhrIo.prototype.response_ = ''; 
goog.testing.net.XhrIo.prototype.readyState_ = goog.net.XmlHttp.ReadyState.UNINITIALIZED; 
goog.testing.net.XhrIo.prototype.timeoutInterval_ = 0; 
goog.testing.net.XhrIo.prototype.timeoutId_ = null; 
goog.testing.net.XhrIo.prototype.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT; 
goog.testing.net.XhrIo.prototype.withCredentials_ = false; 
goog.testing.net.XhrIo.prototype.xhr_ = false; 
goog.testing.net.XhrIo.prototype.getTimeoutInterval = function() { 
  return this.timeoutInterval_; 
}; 
goog.testing.net.XhrIo.prototype.setTimeoutInterval = function(ms) { 
  this.timeoutInterval_ = Math.max(0, ms); 
}; 
goog.testing.net.XhrIo.prototype.simulateTimeout = function() { 
  this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT; 
  this.dispatchEvent(goog.net.EventType.TIMEOUT); 
  this.abort(goog.net.ErrorCode.TIMEOUT); 
}; 
goog.testing.net.XhrIo.prototype.setResponseType = function(type) { 
  this.responseType_ = type; 
}; 
goog.testing.net.XhrIo.prototype.getResponseType = function() { 
  return this.responseType_; 
}; 
goog.testing.net.XhrIo.prototype.setWithCredentials = function(withCredentials) { 
  this.withCredentials_ = withCredentials; 
}; 
goog.testing.net.XhrIo.prototype.getWithCredentials = function() { 
  return this.withCredentials_; 
}; 
goog.testing.net.XhrIo.prototype.abort = function(opt_failureCode) { 
  if(this.active_) { 
    try { 
      this.active_ = false; 
      this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT; 
      this.dispatchEvent(goog.net.EventType.COMPLETE); 
      this.dispatchEvent(goog.net.EventType.ABORT); 
    } finally { 
      this.simulateReady(); 
    } 
  } 
}; 
goog.testing.net.XhrIo.prototype.send = function(url, opt_method, opt_content, opt_headers) { 
  if(this.xhr_) { 
    throw Error('[goog.net.XhrIo] Object is active with another request'); 
  } 
  this.lastUri_ = url; 
  if(this.testQueue_) { 
    this.testQueue_.enqueue(['s', url, opt_method, opt_content, opt_headers]); 
  } 
  this.xhr_ = true; 
  this.active_ = true; 
  this.readyState_ = goog.net.XmlHttp.ReadyState.UNINITIALIZED; 
  this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.LOADING); 
}; 
goog.testing.net.XhrIo.prototype.createXhr = function() { 
  return new goog.net.XmlHttp(); 
}; 
goog.testing.net.XhrIo.prototype.simulateReadyStateChange = function(readyState) { 
  if(readyState < this.readyState_) { 
    throw Error('Readystate cannot go backwards'); 
  } 
  while(this.readyState_ < readyState) { 
    this.readyState_ ++; 
    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE); 
    if(this.readyState_ == goog.net.XmlHttp.ReadyState.COMPLETE) { 
      this.active_ = false; 
      this.dispatchEvent(goog.net.EventType.COMPLETE); 
    } 
  } 
}; 
goog.testing.net.XhrIo.prototype.simulateResponse = function(statusCode, response, opt_headers) { 
  this.statusCode_ = statusCode; 
  this.response_ = response || ''; 
  this.responseHeaders_ = opt_headers || { }; 
  try { 
    if(this.isSuccess()) { 
      this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.COMPLETE); 
      this.dispatchEvent(goog.net.EventType.SUCCESS); 
    } else { 
      this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR; 
      this.lastError_ = this.getStatusText() + ' [' + this.getStatus() + ']'; 
      this.simulateReadyStateChange(goog.net.XmlHttp.ReadyState.COMPLETE); 
      this.dispatchEvent(goog.net.EventType.ERROR); 
    } 
  } finally { 
    this.simulateReady(); 
  } 
}; 
goog.testing.net.XhrIo.prototype.simulateReady = function() { 
  this.active_ = false; 
  this.xhr_ = false; 
  this.dispatchEvent(goog.net.EventType.READY); 
}; 
goog.testing.net.XhrIo.prototype.isActive = function() { 
  return ! ! this.xhr_; 
}; 
goog.testing.net.XhrIo.prototype.isComplete = function() { 
  return this.readyState_ == goog.net.XmlHttp.ReadyState.COMPLETE; 
}; 
goog.testing.net.XhrIo.prototype.isSuccess = function() { 
  switch(this.getStatus()) { 
    case goog.net.HttpStatus.OK: 
    case goog.net.HttpStatus.NO_CONTENT: 
    case goog.net.HttpStatus.NOT_MODIFIED: 
      return true; 

    default: 
      return false; 

  } 
}; 
goog.testing.net.XhrIo.prototype.getReadyState = function() { 
  return this.readyState_; 
}; 
goog.testing.net.XhrIo.prototype.getStatus = function() { 
  return this.statusCode_; 
}; 
goog.testing.net.XhrIo.prototype.getStatusText = function() { 
  return ''; 
}; 
goog.testing.net.XhrIo.prototype.getLastErrorCode = function() { 
  return this.lastErrorCode_; 
}; 
goog.testing.net.XhrIo.prototype.getLastError = function() { 
  return this.lastError_; 
}; 
goog.testing.net.XhrIo.prototype.getLastUri = function() { 
  return this.lastUri_; 
}; 
goog.testing.net.XhrIo.prototype.getResponseText = function() { 
  return goog.isString(this.response_) ? this.response_: goog.dom.xml.serialize(this.response_); 
}; 
goog.testing.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) { 
  var responseText = this.getResponseText(); 
  if(opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) { 
    responseText = responseText.substring(opt_xssiPrefix.length); 
  } 
  return goog.json.parse(responseText); 
}; 
goog.testing.net.XhrIo.prototype.getResponseXml = function() { 
  return goog.isString(this.response_) ? null: this.response_; 
}; 
goog.testing.net.XhrIo.prototype.getResponse = function() { 
  return this.response_; 
}; 
goog.testing.net.XhrIo.prototype.getResponseHeader = function(key) { 
  return this.isComplete() ? this.responseHeaders_[key]: undefined; 
}; 
goog.testing.net.XhrIo.prototype.getAllResponseHeaders = function() { 
  if(! this.isComplete()) { 
    return ''; 
  } 
  var headers =[]; 
  goog.object.forEach(this.responseHeaders_, function(value, name) { 
    headers.push(name + ': ' + value); 
  }); 
  return headers.join('\n'); 
}; 
