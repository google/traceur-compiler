
goog.provide('goog.events.Event'); 
goog.require('goog.Disposable'); 
goog.events.Event = function(type, opt_target) { 
  goog.Disposable.call(this); 
  this.type = type; 
  this.target = opt_target; 
  this.currentTarget = this.target; 
}; 
goog.inherits(goog.events.Event, goog.Disposable); 
goog.events.Event.prototype.disposeInternal = function() { 
  delete this.type; 
  delete this.target; 
  delete this.currentTarget; 
}; 
goog.events.Event.prototype.propagationStopped_ = false; 
goog.events.Event.prototype.returnValue_ = true; 
goog.events.Event.prototype.stopPropagation = function() { 
  this.propagationStopped_ = true; 
}; 
goog.events.Event.prototype.preventDefault = function() { 
  this.returnValue_ = false; 
}; 
goog.events.Event.stopPropagation = function(e) { 
  e.stopPropagation(); 
}; 
goog.events.Event.preventDefault = function(e) { 
  e.preventDefault(); 
}; 
