
goog.provide('goog.net.MultiIframeLoadMonitor'); 
goog.require('goog.net.IframeLoadMonitor'); 
goog.net.MultiIframeLoadMonitor = function(iframes, callback, opt_hasContent) { 
  this.pendingIframeLoadMonitors_ =[]; 
  this.callback_ = callback; 
  for(var i = 0; i < iframes.length; i ++) { 
    var iframeLoadMonitor = new goog.net.IframeLoadMonitor(iframes[i], opt_hasContent); 
    if(iframeLoadMonitor.isLoaded()) { 
      iframeLoadMonitor.dispose(); 
    } else { 
      this.pendingIframeLoadMonitors_.push(iframeLoadMonitor); 
      goog.events.listen(iframeLoadMonitor, goog.net.IframeLoadMonitor.LOAD_EVENT, this); 
    } 
  } 
  if(! this.pendingIframeLoadMonitors_.length) { 
    this.callback_(); 
  } 
}; 
goog.net.MultiIframeLoadMonitor.prototype.handleEvent = function(e) { 
  var iframeLoadMonitor = e.target; 
  for(var i = 0; i < this.pendingIframeLoadMonitors_.length; i ++) { 
    if(this.pendingIframeLoadMonitors_[i]== iframeLoadMonitor) { 
      this.pendingIframeLoadMonitors_.splice(i, 1); 
      break; 
    } 
  } 
  iframeLoadMonitor.dispose(); 
  if(! this.pendingIframeLoadMonitors_.length) { 
    this.callback_(); 
  } 
}; 
goog.net.MultiIframeLoadMonitor.prototype.stopMonitoring = function() { 
  for(var i = 0; i < this.pendingIframeLoadMonitors_.length; i ++) { 
    this.pendingIframeLoadMonitors_[i].dispose(); 
  } 
  this.pendingIframeLoadMonitors_.length = 0; 
}; 
