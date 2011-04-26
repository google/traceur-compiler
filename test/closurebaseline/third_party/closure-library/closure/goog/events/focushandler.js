
goog.provide('goog.events.FocusHandler'); 
goog.provide('goog.events.FocusHandler.EventType'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.userAgent'); 
goog.events.FocusHandler = function(element) { 
  goog.events.EventTarget.call(this); 
  this.element_ = element; 
  var typeIn = goog.userAgent.IE ? 'focusin': 'focus'; 
  var typeOut = goog.userAgent.IE ? 'focusout': 'blur'; 
  this.listenKeyIn_ =(goog.events.listen(this.element_, typeIn, this, ! goog.userAgent.IE)); 
  this.listenKeyOut_ =(goog.events.listen(this.element_, typeOut, this, ! goog.userAgent.IE)); 
}; 
goog.inherits(goog.events.FocusHandler, goog.events.EventTarget); 
goog.events.FocusHandler.EventType = { 
  FOCUSIN: 'focusin', 
  FOCUSOUT: 'focusout' 
}; 
goog.events.FocusHandler.prototype.handleEvent = function(e) { 
  var be = e.getBrowserEvent(); 
  var event = new goog.events.BrowserEvent(be); 
  event.type = e.type == 'focusin' || e.type == 'focus' ? goog.events.FocusHandler.EventType.FOCUSIN: goog.events.FocusHandler.EventType.FOCUSOUT; 
  try { 
    this.dispatchEvent(event); 
  } finally { 
    event.dispose(); 
  } 
}; 
goog.events.FocusHandler.prototype.disposeInternal = function() { 
  goog.events.FocusHandler.superClass_.disposeInternal.call(this); 
  goog.events.unlistenByKey(this.listenKeyIn_); 
  goog.events.unlistenByKey(this.listenKeyOut_); 
  delete this.element_; 
}; 
