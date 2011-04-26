
goog.provide('goog.dom.ViewportSizeMonitor'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Size'); 
goog.require('goog.userAgent'); 
goog.dom.ViewportSizeMonitor = function(opt_window) { 
  goog.events.EventTarget.call(this); 
  this.window_ = opt_window || window; 
  this.listenerKey_ = goog.events.listen(this.window_, goog.events.EventType.RESIZE, this.handleResize_, false, this); 
  this.size_ = goog.dom.getViewportSize(this.window_); 
  if(this.isPollingRequired_()) { 
    this.windowSizePollInterval_ = window.setInterval(goog.bind(this.checkForSizeChange_, this), goog.dom.ViewportSizeMonitor.WINDOW_SIZE_POLL_RATE); 
  } 
}; 
goog.inherits(goog.dom.ViewportSizeMonitor, goog.events.EventTarget); 
goog.dom.ViewportSizeMonitor.getInstanceForWindow = function(opt_window) { 
  var currentWindow = opt_window || window; 
  var uid = goog.getUid(currentWindow); 
  return goog.dom.ViewportSizeMonitor.windowInstanceMap_[uid]= goog.dom.ViewportSizeMonitor.windowInstanceMap_[uid]|| new goog.dom.ViewportSizeMonitor(currentWindow); 
}; 
goog.dom.ViewportSizeMonitor.windowInstanceMap_ = { }; 
goog.dom.ViewportSizeMonitor.WINDOW_SIZE_POLL_RATE = 500; 
goog.dom.ViewportSizeMonitor.prototype.listenerKey_ = null; 
goog.dom.ViewportSizeMonitor.prototype.window_ = null; 
goog.dom.ViewportSizeMonitor.prototype.size_ = null; 
goog.dom.ViewportSizeMonitor.prototype.windowSizePollInterval_ = null; 
goog.dom.ViewportSizeMonitor.prototype.isPollingRequired_ = function() { 
  return goog.userAgent.WEBKIT && goog.userAgent.WINDOWS || goog.userAgent.OPERA && this.window_.self != this.window_.top; 
}; 
goog.dom.ViewportSizeMonitor.prototype.getSize = function() { 
  return this.size_ ? this.size_.clone(): null; 
}; 
goog.dom.ViewportSizeMonitor.prototype.disposeInternal = function() { 
  goog.dom.ViewportSizeMonitor.superClass_.disposeInternal.call(this); 
  if(this.listenerKey_) { 
    goog.events.unlistenByKey(this.listenerKey_); 
    this.listenerKey_ = null; 
  } 
  if(this.windowSizePollInterval_) { 
    window.clearInterval(this.windowSizePollInterval_); 
    this.windowSizePollInterval_ = null; 
  } 
  this.window_ = null; 
  this.size_ = null; 
}; 
goog.dom.ViewportSizeMonitor.prototype.handleResize_ = function(event) { 
  this.checkForSizeChange_(); 
}; 
goog.dom.ViewportSizeMonitor.prototype.checkForSizeChange_ = function() { 
  var size = goog.dom.getViewportSize(this.window_); 
  if(! goog.math.Size.equals(size, this.size_)) { 
    this.size_ = size; 
    this.dispatchEvent(goog.events.EventType.RESIZE); 
  } 
}; 
