
goog.provide('goog.net.IframeLoadMonitor'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.userAgent'); 
goog.net.IframeLoadMonitor = function(iframe, opt_hasContent) { 
  this.iframe_ = iframe; 
  this.hasContent_ = ! ! opt_hasContent; 
  this.isLoaded_ = this.isLoadedHelper_(); 
  if(! this.isLoaded_) { 
    var isIe6OrLess = goog.userAgent.IE && ! goog.userAgent.isVersion('7'); 
    var loadEvtType = isIe6OrLess ? goog.events.EventType.READYSTATECHANGE: goog.events.EventType.LOAD; 
    this.onloadListenerKey_ = goog.events.listen(this.iframe_, loadEvtType, this.handleLoad_, false, this); 
    this.intervalId_ = window.setInterval(goog.bind(this.handleLoad_, this), goog.net.IframeLoadMonitor.POLL_INTERVAL_MS_); 
  } 
}; 
goog.inherits(goog.net.IframeLoadMonitor, goog.events.EventTarget); 
goog.net.IframeLoadMonitor.LOAD_EVENT = 'ifload'; 
goog.net.IframeLoadMonitor.POLL_INTERVAL_MS_ = 100; 
goog.net.IframeLoadMonitor.prototype.onloadListenerKey_ = null; 
goog.net.IframeLoadMonitor.prototype.isLoaded = function() { 
  return this.isLoaded_; 
}; 
goog.net.IframeLoadMonitor.prototype.maybeStopTimer_ = function() { 
  if(this.intervalId_) { 
    window.clearInterval(this.intervalId_); 
    this.intervalId_ = null; 
  } 
}; 
goog.net.IframeLoadMonitor.prototype.getIframe = function() { 
  return this.iframe_; 
}; 
goog.net.IframeLoadMonitor.prototype.disposeInternal = function() { 
  delete this.iframe_; 
  this.maybeStopTimer_(); 
  goog.events.unlistenByKey(this.onloadListenerKey_); 
  goog.net.IframeLoadMonitor.superClass_.disposeInternal.call(this); 
}; 
goog.net.IframeLoadMonitor.prototype.isLoadedHelper_ = function() { 
  var isLoaded = false; 
  try { 
    isLoaded = goog.userAgent.IE ? this.iframe_.readyState == 'complete': ! ! goog.dom.getFrameContentDocument(this.iframe_).body &&(! this.hasContent_ || ! ! goog.dom.getFrameContentDocument(this.iframe_).body.firstChild); 
  } catch(e) { } 
  return isLoaded; 
}; 
goog.net.IframeLoadMonitor.prototype.handleLoad_ = function() { 
  if(this.isLoadedHelper_()) { 
    this.maybeStopTimer_(); 
    goog.events.unlistenByKey(this.onloadListenerKey_); 
    this.onloadListenerKey_ = null; 
    this.isLoaded_ = true; 
    this.dispatchEvent(goog.net.IframeLoadMonitor.LOAD_EVENT); 
  } 
}; 
