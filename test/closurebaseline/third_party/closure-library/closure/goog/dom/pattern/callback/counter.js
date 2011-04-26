
goog.provide('goog.dom.pattern.callback.Counter'); 
goog.dom.pattern.callback.Counter = function() { }; 
goog.dom.pattern.callback.Counter.prototype.count = 0; 
goog.dom.pattern.callback.Counter.prototype.callback_ = null; 
goog.dom.pattern.callback.Counter.prototype.getCallback = function() { 
  if(! this.callback_) { 
    this.callback_ = goog.bind(function() { 
      this.count ++; 
      return false; 
    }, this); 
  } 
  return this.callback_; 
}; 
goog.dom.pattern.callback.Counter.prototype.reset = function() { 
  this.count = 0; 
}; 
