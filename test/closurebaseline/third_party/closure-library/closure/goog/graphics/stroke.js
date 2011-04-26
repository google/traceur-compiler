
goog.provide('goog.graphics.Stroke'); 
goog.graphics.Stroke = function(width, color) { 
  this.width_ = width; 
  this.color_ = color; 
}; 
goog.graphics.Stroke.prototype.getWidth = function() { 
  return this.width_; 
}; 
goog.graphics.Stroke.prototype.getColor = function() { 
  return this.color_; 
}; 
