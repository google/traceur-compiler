
goog.provide('goog.net.XhrIo'); 
goog.provide('goog.net.XhrIo.ResponseType'); 
goog.require('goog.Timer'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.entryPointRegistry'); 
goog.require('goog.debug.errorHandlerWeakDep'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.json'); 
goog.require('goog.net.ErrorCode'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.HttpStatus'); 
goog.require('goog.net.XmlHttp'); 
goog.require('goog.net.xhrMonitor'); 
goog.require('goog.object'); 
goog.require('goog.structs'); 
goog.require('goog.structs.Map'); 
goog.require('goog.uri.utils'); 
goog.net.XhrIo = function(opt_xmlHttpFactory) { 
  goog.events.EventTarget.call(this); 
  this.headers = new goog.structs.Map(); 
  this.xmlHttpFactory_ = opt_xmlHttpFactory || null; 
}; 
goog.inherits(goog.net.XhrIo, goog.events.EventTarget); 
goog.net.XhrIo.ResponseType = { 
  DEFAULT: '', 
  TEXT: 'text', 
  DOCUMENT: 'document', 
  BLOB: 'blob', 
  ARRAY_BUFFER: 'arraybuffer' 
}; 
goog.net.XhrIo.prototype.logger_ = goog.debug.Logger.getLogger('goog.net.XhrIo'); 
goog.net.XhrIo.CONTENT_TYPE_HEADER = 'Content-Type'; 
goog.net.XhrIo.HTTP_SCHEME_PATTERN = /^https?:?$/i; 
goog.net.XhrIo.FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded;charset=utf-8'; 
goog.net.XhrIo.sendInstances_ =[]; 
goog.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content, opt_headers, opt_timeoutInterval) { 
  var x = new goog.net.XhrIo(); 
  goog.net.XhrIo.sendInstances_.push(x); 
  if(opt_callback) { 
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback); 
  } 
  goog.events.listen(x, goog.net.EventType.READY, goog.partial(goog.net.XhrIo.cleanupSend_, x)); 
  if(opt_timeoutInterval) { 
    x.setTimeoutInterval(opt_timeoutInterval); 
  } 
  x.send(url, opt_method, opt_content, opt_headers); 
}; 
goog.net.XhrIo.cleanup = function() { 
  var instances = goog.net.XhrIo.sendInstances_; 
  while(instances.length) { 
    instances.pop().dispose(); 
  } 
}; 
goog.net.XhrIo.protectEntryPoints = function(errorHandler) { 
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = errorHandler.protectEntryPoint(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_); 
}; 
goog.net.XhrIo.cleanupSend_ = function(XhrIo) { 
  XhrIo.dispose(); 
  goog.array.remove(goog.net.XhrIo.sendInstances_, XhrIo); 
}; 
goog.net.XhrIo.prototype.active_ = false; 
goog.net.XhrIo.prototype.xhr_ = null; 
goog.net.XhrIo.prototype.xhrOptions_ = null; 
goog.net.XhrIo.prototype.lastUri_ = ''; 
goog.net.XhrIo.prototype.lastMethod_ = ''; 
goog.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
goog.net.XhrIo.prototype.lastError_ = ''; 
goog.net.XhrIo.prototype.errorDispatched_ = false; 
goog.net.XhrIo.prototype.inSend_ = false; 
goog.net.XhrIo.prototype.inOpen_ = false; 
goog.net.XhrIo.prototype.inAbort_ = false; 
goog.net.XhrIo.prototype.timeoutInterval_ = 0; 
goog.net.XhrIo.prototype.timeoutId_ = null; 
goog.net.XhrIo.prototype.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT; 
goog.net.XhrIo.prototype.withCredentials_ = false; 
goog.net.XhrIo.prototype.getTimeoutInterval = function() { 
  return this.timeoutInterval_; 
}; 
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) { 
  this.timeoutInterval_ = Math.max(0, ms); 
}; 
goog.net.XhrIo.prototype.setResponseType = function(type) { 
  this.responseType_ = type; 
}; 
goog.net.XhrIo.prototype.getResponseType = function() { 
  return this.responseType_; 
}; 
goog.net.XhrIo.prototype.setWithCredentials = function(withCredentials) { 
  this.withCredentials_ = withCredentials; 
}; 
goog.net.XhrIo.prototype.getWithCredentials = function() { 
  return this.withCredentials_; 
}; 
goog.net.XhrIo.prototype.send = function(url, opt_method, opt_content, opt_headers) { 
  if(this.xhr_) { 
    throw Error('[goog.net.XhrIo] Object is active with another request'); 
  } 
  var method = opt_method ? opt_method.toUpperCase(): 'GET'; 
  this.lastUri_ = url; 
  this.lastError_ = ''; 
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
  this.lastMethod_ = method; 
  this.errorDispatched_ = false; 
  this.active_ = true; 
  this.xhr_ = this.createXhr(); 
  this.xhrOptions_ = this.xmlHttpFactory_ ? this.xmlHttpFactory_.getOptions(): goog.net.XmlHttp.getOptions(); 
  goog.net.xhrMonitor.markXhrOpen(this.xhr_); 
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this); 
  try { 
    this.logger_.fine(this.formatMsg_('Opening Xhr')); 
    this.inOpen_ = true; 
    this.xhr_.open(method, url, true); 
    this.inOpen_ = false; 
  } catch(err) { 
    this.logger_.fine(this.formatMsg_('Error opening Xhr: ' + err.message)); 
    this.error_(goog.net.ErrorCode.EXCEPTION, err); 
    return; 
  } 
  var content = opt_content || ''; 
  var headers = this.headers.clone(); 
  if(opt_headers) { 
    goog.structs.forEach(opt_headers, function(value, key) { 
      headers.set(key, value); 
    }); 
  } 
  if(method == 'POST' && ! headers.containsKey(goog.net.XhrIo.CONTENT_TYPE_HEADER)) { 
    headers.set(goog.net.XhrIo.CONTENT_TYPE_HEADER, goog.net.XhrIo.FORM_CONTENT_TYPE); 
  } 
  goog.structs.forEach(headers, function(value, key) { 
    this.xhr_.setRequestHeader(key, value); 
  }, this); 
  if(this.responseType_) { 
    this.xhr_.responseType = this.responseType_; 
  } 
  if(goog.object.containsKey(this.xhr_, 'withCredentials')) { 
    this.xhr_.withCredentials = this.withCredentials_; 
  } 
  try { 
    if(this.timeoutId_) { 
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_); 
      this.timeoutId_ = null; 
    } 
    if(this.timeoutInterval_ > 0) { 
      this.logger_.fine(this.formatMsg_('Will abort after ' + this.timeoutInterval_ + 'ms if incomplete')); 
      this.timeoutId_ = goog.Timer.defaultTimerObject.setTimeout(goog.bind(this.timeout_, this), this.timeoutInterval_); 
    } 
    this.logger_.fine(this.formatMsg_('Sending request')); 
    this.inSend_ = true; 
    this.xhr_.send(content); 
    this.inSend_ = false; 
  } catch(err) { 
    this.logger_.fine(this.formatMsg_('Send error: ' + err.message)); 
    this.error_(goog.net.ErrorCode.EXCEPTION, err); 
  } 
}; 
goog.net.XhrIo.prototype.createXhr = function() { 
  return this.xmlHttpFactory_ ? this.xmlHttpFactory_.createInstance(): new goog.net.XmlHttp(); 
}; 
goog.net.XhrIo.prototype.dispatchEvent = function(e) { 
  if(this.xhr_) { 
    goog.net.xhrMonitor.pushContext(this.xhr_); 
    try { 
      return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e); 
    } finally { 
      goog.net.xhrMonitor.popContext(); 
    } 
  } else { 
    return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e); 
  } 
}; 
goog.net.XhrIo.prototype.timeout_ = function() { 
  if(typeof goog == 'undefined') { } else if(this.xhr_) { 
    this.lastError_ = 'Timed out after ' + this.timeoutInterval_ + 'ms, aborting'; 
    this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT; 
    this.logger_.fine(this.formatMsg_(this.lastError_)); 
    this.dispatchEvent(goog.net.EventType.TIMEOUT); 
    this.abort(goog.net.ErrorCode.TIMEOUT); 
  } 
}; 
goog.net.XhrIo.prototype.error_ = function(errorCode, err) { 
  this.active_ = false; 
  if(this.xhr_) { 
    this.inAbort_ = true; 
    this.xhr_.abort(); 
    this.inAbort_ = false; 
  } 
  this.lastError_ = err; 
  this.lastErrorCode_ = errorCode; 
  this.dispatchErrors_(); 
  this.cleanUpXhr_(); 
}; 
goog.net.XhrIo.prototype.dispatchErrors_ = function() { 
  if(! this.errorDispatched_) { 
    this.errorDispatched_ = true; 
    this.dispatchEvent(goog.net.EventType.COMPLETE); 
    this.dispatchEvent(goog.net.EventType.ERROR); 
  } 
}; 
goog.net.XhrIo.prototype.abort = function(opt_failureCode) { 
  if(this.xhr_ && this.active_) { 
    this.logger_.fine(this.formatMsg_('Aborting')); 
    this.active_ = false; 
    this.inAbort_ = true; 
    this.xhr_.abort(); 
    this.inAbort_ = false; 
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT; 
    this.dispatchEvent(goog.net.EventType.COMPLETE); 
    this.dispatchEvent(goog.net.EventType.ABORT); 
    this.cleanUpXhr_(); 
  } 
}; 
goog.net.XhrIo.prototype.disposeInternal = function() { 
  if(this.xhr_) { 
    if(this.active_) { 
      this.active_ = false; 
      this.inAbort_ = true; 
      this.xhr_.abort(); 
      this.inAbort_ = false; 
    } 
    this.cleanUpXhr_(true); 
  } 
  goog.net.XhrIo.superClass_.disposeInternal.call(this); 
}; 
goog.net.XhrIo.prototype.onReadyStateChange_ = function() { 
  if(! this.inOpen_ && ! this.inSend_ && ! this.inAbort_) { 
    this.onReadyStateChangeEntryPoint_(); 
  } else { 
    this.onReadyStateChangeHelper_(); 
  } 
}; 
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() { 
  this.onReadyStateChangeHelper_(); 
}; 
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() { 
  if(! this.active_) { 
    return; 
  } 
  if(typeof goog == 'undefined') { } else if(this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR]&& this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE && this.getStatus() == 2) { 
    this.logger_.fine(this.formatMsg_('Local request error detected and ignored')); 
  } else { 
    if(this.inSend_ && this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) { 
      goog.Timer.defaultTimerObject.setTimeout(goog.bind(this.onReadyStateChange_, this), 0); 
      return; 
    } 
    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE); 
    if(this.isComplete()) { 
      this.logger_.fine(this.formatMsg_('Request complete')); 
      this.active_ = false; 
      if(this.isSuccess()) { 
        this.dispatchEvent(goog.net.EventType.COMPLETE); 
        this.dispatchEvent(goog.net.EventType.SUCCESS); 
      } else { 
        this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR; 
        this.lastError_ = this.getStatusText() + ' [' + this.getStatus() + ']'; 
        this.dispatchErrors_(); 
      } 
      this.cleanUpXhr_(); 
    } 
  } 
}; 
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) { 
  if(this.xhr_) { 
    var xhr = this.xhr_; 
    var clearedOnReadyStateChange = this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION]? goog.nullFunction: null; 
    this.xhr_ = null; 
    this.xhrOptions_ = null; 
    if(this.timeoutId_) { 
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_); 
      this.timeoutId_ = null; 
    } 
    if(! opt_fromDispose) { 
      goog.net.xhrMonitor.pushContext(xhr); 
      this.dispatchEvent(goog.net.EventType.READY); 
      goog.net.xhrMonitor.popContext(); 
    } 
    goog.net.xhrMonitor.markXhrClosed(xhr); 
    try { 
      xhr.onreadystatechange = clearedOnReadyStateChange; 
    } catch(e) { 
      this.logger_.severe('Problem encountered resetting onreadystatechange: ' + e.message); 
    } 
  } 
}; 
goog.net.XhrIo.prototype.isActive = function() { 
  return ! ! this.xhr_; 
}; 
goog.net.XhrIo.prototype.isComplete = function() { 
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE; 
}; 
goog.net.XhrIo.prototype.isSuccess = function() { 
  switch(this.getStatus()) { 
    case 0: 
      return ! this.isLastUriEffectiveSchemeHttp_(); 

    case goog.net.HttpStatus.OK: 
    case goog.net.HttpStatus.NO_CONTENT: 
    case goog.net.HttpStatus.NOT_MODIFIED: 
    case goog.net.HttpStatus.QUIRK_IE_NO_CONTENT: 
      return true; 

    default: 
      return false; 

  } 
}; 
goog.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() { 
  var lastUriScheme = goog.isString(this.lastUri_) ? goog.uri.utils.getScheme(this.lastUri_):(this.lastUri_).getScheme(); 
  if(lastUriScheme) { 
    return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(lastUriScheme); 
  } 
  if(self.location) { 
    return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(self.location.protocol); 
  } else { 
    return true; 
  } 
}; 
goog.net.XhrIo.prototype.getReadyState = function() { 
  return this.xhr_ ?(this.xhr_.readyState): goog.net.XmlHttp.ReadyState.UNINITIALIZED; 
}; 
goog.net.XhrIo.prototype.getStatus = function() { 
  try { 
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ? this.xhr_.status: - 1; 
  } catch(e) { 
    this.logger_.warning('Can not get status: ' + e.message); 
    return - 1; 
  } 
}; 
goog.net.XhrIo.prototype.getStatusText = function() { 
  try { 
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ? this.xhr_.statusText: ''; 
  } catch(e) { 
    this.logger_.fine('Can not get status: ' + e.message); 
    return ''; 
  } 
}; 
goog.net.XhrIo.prototype.getLastUri = function() { 
  return String(this.lastUri_); 
}; 
goog.net.XhrIo.prototype.getResponseText = function() { 
  try { 
    return this.xhr_ ? this.xhr_.responseText: ''; 
  } catch(e) { 
    this.logger_.fine('Can not get responseText: ' + e.message); 
    return ''; 
  } 
}; 
goog.net.XhrIo.prototype.getResponseXml = function() { 
  try { 
    return this.xhr_ ? this.xhr_.responseXML: null; 
  } catch(e) { 
    this.logger_.fine('Can not get responseXML: ' + e.message); 
    return null; 
  } 
}; 
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) { 
  if(! this.xhr_) { 
    return undefined; 
  } 
  var responseText = this.xhr_.responseText; 
  if(opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) { 
    responseText = responseText.substring(opt_xssiPrefix.length); 
  } 
  return goog.json.parse(responseText); 
}; 
goog.net.XhrIo.prototype.getResponse = function() { 
  try { 
    return this.xhr_ && this.xhr_.response; 
  } catch(e) { 
    this.logger_.fine('Can not get response: ' + e.message); 
    return null; 
  } 
}; 
goog.net.XhrIo.prototype.getResponseHeader = function(key) { 
  return this.xhr_ && this.isComplete() ? this.xhr_.getResponseHeader(key): undefined; 
}; 
goog.net.XhrIo.prototype.getAllResponseHeaders = function() { 
  return this.xhr_ && this.isComplete() ? this.xhr_.getAllResponseHeaders(): ''; 
}; 
goog.net.XhrIo.prototype.getLastErrorCode = function() { 
  return this.lastErrorCode_; 
}; 
goog.net.XhrIo.prototype.getLastError = function() { 
  return goog.isString(this.lastError_) ? this.lastError_: String(this.lastError_); 
}; 
goog.net.XhrIo.prototype.formatMsg_ = function(msg) { 
  return msg + ' [' + this.lastMethod_ + ' ' + this.lastUri_ + ' ' + this.getStatus() + ']'; 
}; 
goog.debug.entryPointRegistry.register(function(transformer) { 
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = transformer(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_); 
}); 
