
goog.provide('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Fill'); 
goog.graphics.SolidFill = function(color, opt_opacity) { 
  this.color_ = color; 
  this.opacity_ = opt_opacity || 1.0; 
}; 
goog.inherits(goog.graphics.SolidFill, goog.graphics.Fill); 
goog.graphics.SolidFill.prototype.getColor = function() { 
  return this.color_; 
}; 
goog.graphics.SolidFill.prototype.getOpacity = function() { 
  return this.opacity_; 
}; 
