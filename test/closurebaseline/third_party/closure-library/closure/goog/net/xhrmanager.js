
goog.provide('goog.net.XhrManager'); 
goog.provide('goog.net.XhrManager.Event'); 
goog.provide('goog.net.XhrManager.Request'); 
goog.require('goog.Disposable'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.XhrIo'); 
goog.require('goog.net.XhrIoPool'); 
goog.require('goog.structs.Map'); 
goog.net.XhrManager = function(opt_maxRetries, opt_headers, opt_minCount, opt_maxCount, opt_timeoutInterval) { 
  this.maxRetries_ = goog.isDef(opt_maxRetries) ? opt_maxRetries: 1; 
  this.timeoutInterval_ = goog.isDef(opt_timeoutInterval) ? Math.max(0, opt_timeoutInterval): 0; 
  this.xhrPool_ = new goog.net.XhrIoPool(opt_headers, opt_minCount, opt_maxCount); 
  this.requests_ = new goog.structs.Map(); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.net.XhrManager, goog.events.EventTarget); 
goog.net.XhrManager.ERROR_ID_IN_USE_ = '[goog.net.XhrManager] ID in use'; 
goog.net.XhrManager.XHR_EVENT_TYPES_ =[goog.net.EventType.READY, goog.net.EventType.COMPLETE, goog.net.EventType.SUCCESS, goog.net.EventType.ERROR, goog.net.EventType.ABORT, goog.net.EventType.TIMEOUT]; 
goog.net.XhrManager.prototype.setTimeoutInterval = function(ms) { 
  this.timeoutInterval_ = Math.max(0, ms); 
}; 
goog.net.XhrManager.prototype.getOutstandingCount = function() { 
  return this.requests_.getCount(); 
}; 
goog.net.XhrManager.prototype.send = function(id, url, opt_method, opt_content, opt_headers, opt_priority, opt_callback, opt_maxRetries) { 
  var requests = this.requests_; 
  if(requests.get(id)) { 
    throw Error(goog.net.XhrManager.ERROR_ID_IN_USE_); 
  } 
  var request = new goog.net.XhrManager.Request(url, goog.bind(this.handleEvent_, this, id), opt_method, opt_content, opt_headers, opt_callback, goog.isDef(opt_maxRetries) ? opt_maxRetries: this.maxRetries_); 
  this.requests_.set(id, request); 
  var callback = goog.bind(this.handleAvailableXhr_, this, id); 
  this.xhrPool_.getObject(callback, opt_priority); 
  return request; 
}; 
goog.net.XhrManager.prototype.abort = function(id, opt_force) { 
  var request = this.requests_.get(id); 
  if(request) { 
    var xhrIo = request.xhrIo; 
    request.setAborted(true); 
    if(opt_force) { 
      this.removeXhrListener_(xhrIo, request.getXhrEventCallback()); 
      goog.events.listenOnce(xhrIo, goog.net.EventType.READY, function() { 
        this.xhrPool_.releaseObject(xhrIo); 
      }, false, this); 
      this.requests_.remove(id); 
    } 
    if(xhrIo) { 
      xhrIo.abort(); 
    } 
  } 
}; 
goog.net.XhrManager.prototype.handleAvailableXhr_ = function(id, xhrIo) { 
  var request = this.requests_.get(id); 
  if(request && ! request.xhrIo) { 
    this.addXhrListener_(xhrIo, request.getXhrEventCallback()); 
    xhrIo.setTimeoutInterval(this.timeoutInterval_); 
    request.xhrIo = request.xhrLite = xhrIo; 
    this.dispatchEvent(new goog.net.XhrManager.Event(goog.net.EventType.READY, this, id, xhrIo)); 
    this.retry_(id, xhrIo); 
    if(request.getAborted()) { 
      xhrIo.abort(); 
    } 
  } else { 
    this.xhrPool_.releaseObject(xhrIo); 
  } 
}; 
goog.net.XhrManager.prototype.handleEvent_ = function(id, e) { 
  var xhrIo =(e.target); 
  switch(e.type) { 
    case goog.net.EventType.READY: 
      this.retry_(id, xhrIo); 
      break; 

    case goog.net.EventType.COMPLETE: 
      return this.handleComplete_(id, xhrIo, e); 

    case goog.net.EventType.SUCCESS: 
      this.handleSuccess_(id, xhrIo); 
      break; 

    case goog.net.EventType.TIMEOUT: 
    case goog.net.EventType.ERROR: 
      this.handleError_(id, xhrIo); 
      break; 

    case goog.net.EventType.ABORT: 
      this.handleAbort_(id, xhrIo); 
      break; 

  } 
  return null; 
}; 
goog.net.XhrManager.prototype.retry_ = function(id, xhrIo) { 
  var request = this.requests_.get(id); 
  if(request && ! request.getCompleted() && ! request.hasReachedMaxRetries()) { 
    request.increaseAttemptCount(); 
    xhrIo.send(request.getUrl(), request.getMethod(), request.getContent(), request.getHeaders()); 
  } else { 
    if(request) { 
      this.removeXhrListener_(xhrIo, request.getXhrEventCallback()); 
      this.requests_.remove(id); 
    } 
    this.xhrPool_.releaseObject(xhrIo); 
  } 
}; 
goog.net.XhrManager.prototype.handleComplete_ = function(id, xhrIo, e) { 
  var request = this.requests_.get(id); 
  if(xhrIo.getLastErrorCode() == goog.net.ErrorCode.ABORT || xhrIo.isSuccess() || request.hasReachedMaxRetries()) { 
    this.dispatchEvent(new goog.net.XhrManager.Event(goog.net.EventType.COMPLETE, this, id, xhrIo)); 
    if(request) { 
      request.setCompleted(true); 
      if(request.getCompleteCallback()) { 
        return request.getCompleteCallback().call(xhrIo, e); 
      } 
    } 
  } 
  return null; 
}; 
goog.net.XhrManager.prototype.handleAbort_ = function(id, xhrIo) { 
  this.dispatchEvent(new goog.net.XhrManager.Event(goog.net.EventType.ABORT, this, id, xhrIo)); 
}; 
goog.net.XhrManager.prototype.handleSuccess_ = function(id, xhrIo) { 
  this.dispatchEvent(new goog.net.XhrManager.Event(goog.net.EventType.SUCCESS, this, id, xhrIo)); 
}; 
goog.net.XhrManager.prototype.handleError_ = function(id, xhrIo) { 
  var request = this.requests_.get(id); 
  if(request.hasReachedMaxRetries()) { 
    this.dispatchEvent(new goog.net.XhrManager.Event(goog.net.EventType.ERROR, this, id, xhrIo)); 
  } 
}; 
goog.net.XhrManager.prototype.removeXhrListener_ = function(xhrIo, func, opt_types) { 
  var types = opt_types || goog.net.XhrManager.XHR_EVENT_TYPES_; 
  this.eventHandler_.unlisten(xhrIo, types, func); 
}; 
goog.net.XhrManager.prototype.addXhrListener_ = function(xhrIo, func, opt_types) { 
  var types = opt_types || goog.net.XhrManager.XHR_EVENT_TYPES_; 
  this.eventHandler_.listen(xhrIo, types, func); 
}; 
goog.net.XhrManager.prototype.disposeInternal = function() { 
  goog.net.XhrManager.superClass_.disposeInternal.call(this); 
  this.xhrPool_.dispose(); 
  this.xhrPool_ = null; 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
  var requests = this.requests_; 
  goog.structs.forEach(requests, function(value, key) { 
    value.dispose(); 
  }); 
  requests.clear(); 
  this.requests_ = null; 
}; 
goog.net.XhrManager.Event = function(type, target, id, xhrIo) { 
  goog.events.Event.call(this, type, target); 
  this.id = id; 
  this.xhrIo = xhrIo; 
  this.xhrLite =(xhrIo); 
}; 
goog.inherits(goog.net.XhrManager.Event, goog.events.Event); 
goog.net.XhrManager.Event.prototype.disposeInternal = function() { 
  goog.net.XhrManager.Event.superClass_.disposeInternal.call(this); 
  delete this.id; 
  this.xhrIo = null; 
  this.xhrLite = null; 
}; 
goog.net.XhrManager.Request = function(url, xhrEventCallback, opt_method, opt_content, opt_headers, opt_callback, opt_maxRetries) { 
  goog.Disposable.call(this); 
  this.url_ = url; 
  this.method_ = opt_method || 'GET'; 
  this.content_ = opt_content; 
  this.headers_ = opt_headers || null; 
  this.maxRetries_ = goog.isDef(opt_maxRetries) ? opt_maxRetries: 1; 
  this.attemptCount_ = 0; 
  this.completed_ = false; 
  this.aborted_ = false; 
  this.xhrEventCallback_ = xhrEventCallback; 
  this.completeCallback_ = opt_callback; 
  this.xhrIo = null; 
}; 
goog.inherits(goog.net.XhrManager.Request, goog.Disposable); 
goog.net.XhrManager.Request.prototype.getUrl = function() { 
  return this.url_; 
}; 
goog.net.XhrManager.Request.prototype.getMethod = function() { 
  return this.method_; 
}; 
goog.net.XhrManager.Request.prototype.getContent = function() { 
  return this.content_; 
}; 
goog.net.XhrManager.Request.prototype.getHeaders = function() { 
  return this.headers_; 
}; 
goog.net.XhrManager.Request.prototype.getMaxRetries = function() { 
  return this.maxRetries_; 
}; 
goog.net.XhrManager.Request.prototype.getAttemptCount = function() { 
  return this.attemptCount_; 
}; 
goog.net.XhrManager.Request.prototype.increaseAttemptCount = function() { 
  this.attemptCount_ ++; 
}; 
goog.net.XhrManager.Request.prototype.hasReachedMaxRetries = function() { 
  return this.attemptCount_ > this.maxRetries_; 
}; 
goog.net.XhrManager.Request.prototype.setCompleted = function(complete) { 
  this.completed_ = complete; 
}; 
goog.net.XhrManager.Request.prototype.getCompleted = function() { 
  return this.completed_; 
}; 
goog.net.XhrManager.Request.prototype.setAborted = function(aborted) { 
  this.aborted_ = aborted; 
}; 
goog.net.XhrManager.Request.prototype.getAborted = function() { 
  return this.aborted_; 
}; 
goog.net.XhrManager.Request.prototype.getXhrEventCallback = function() { 
  return this.xhrEventCallback_; 
}; 
goog.net.XhrManager.Request.prototype.getCompleteCallback = function() { 
  return this.completeCallback_; 
}; 
goog.net.XhrManager.Request.prototype.disposeInternal = function() { 
  goog.net.XhrManager.Request.superClass_.disposeInternal.call(this); 
  delete this.xhrEventCallback_; 
  delete this.completeCallback_; 
}; 
