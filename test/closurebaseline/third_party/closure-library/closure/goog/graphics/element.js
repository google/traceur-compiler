
goog.provide('goog.graphics.Element'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.graphics.AffineTransform'); 
goog.require('goog.math'); 
goog.graphics.Element = function(element, graphics) { 
  goog.events.EventTarget.call(this); 
  this.element_ = element; 
  this.graphics_ = graphics; 
  this.customEvent_ = false; 
}; 
goog.inherits(goog.graphics.Element, goog.events.EventTarget); 
goog.graphics.Element.prototype.graphics_ = null; 
goog.graphics.Element.prototype.element_ = null; 
goog.graphics.Element.prototype.transform_ = null; 
goog.graphics.Element.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.graphics.Element.prototype.getGraphics = function() { 
  return this.graphics_; 
}; 
goog.graphics.Element.prototype.setTransformation = function(x, y, rotate, centerX, centerY) { 
  this.transform_ = goog.graphics.AffineTransform.getRotateInstance(goog.math.toRadians(rotate), centerX, centerY).translate(x, y); 
  this.getGraphics().setElementTransform(this, x, y, rotate, centerX, centerY); 
}; 
goog.graphics.Element.prototype.getTransform = function() { 
  return this.transform_ ? this.transform_.clone(): new goog.graphics.AffineTransform(); 
}; 
goog.graphics.Element.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) { 
  goog.events.listen(this.element_, type, handler, opt_capture, opt_handlerScope); 
}; 
goog.graphics.Element.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) { 
  goog.events.unlisten(this.element_, type, handler, opt_capture, opt_handlerScope); 
}; 
goog.graphics.Element.prototype.disposeInternal = function() { 
  goog.graphics.Element.superClass_.disposeInternal.call(this); 
  goog.events.removeAll(this.element_); 
}; 
