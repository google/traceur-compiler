
goog.provide('goog.dom.pattern.callback.Test'); 
goog.require('goog.iter.StopIteration'); 
goog.dom.pattern.callback.Test = function() { }; 
goog.dom.pattern.callback.Test.prototype.matched = false; 
goog.dom.pattern.callback.Test.prototype.callback_ = null; 
goog.dom.pattern.callback.Test.prototype.getCallback = function() { 
  if(! this.callback_) { 
    this.callback_ = goog.bind(function(node, position) { 
      this.matched = true; 
      throw goog.iter.StopIteration; 
    }, this); 
  } 
  return this.callback_; 
}; 
goog.dom.pattern.callback.Test.prototype.reset = function() { 
  this.matched = false; 
}; 
