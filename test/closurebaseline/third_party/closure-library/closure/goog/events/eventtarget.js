
goog.provide('goog.events.EventTarget'); 
goog.require('goog.Disposable'); 
goog.require('goog.events'); 
goog.events.EventTarget = function() { 
  goog.Disposable.call(this); 
}; 
goog.inherits(goog.events.EventTarget, goog.Disposable); 
goog.events.EventTarget.prototype.customEvent_ = true; 
goog.events.EventTarget.prototype.parentEventTarget_ = null; 
goog.events.EventTarget.prototype.getParentEventTarget = function() { 
  return this.parentEventTarget_; 
}; 
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) { 
  this.parentEventTarget_ = parent; 
}; 
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) { 
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope); 
}; 
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) { 
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope); 
}; 
goog.events.EventTarget.prototype.dispatchEvent = function(e) { 
  return goog.events.dispatchEvent(this, e); 
}; 
goog.events.EventTarget.prototype.disposeInternal = function() { 
  goog.events.EventTarget.superClass_.disposeInternal.call(this); 
  goog.events.removeAll(this); 
  this.parentEventTarget_ = null; 
}; 
