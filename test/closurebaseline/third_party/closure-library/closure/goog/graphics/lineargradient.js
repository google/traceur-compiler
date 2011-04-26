
goog.provide('goog.graphics.LinearGradient'); 
goog.require('goog.graphics.Fill'); 
goog.graphics.LinearGradient = function(x1, y1, x2, y2, color1, color2) { 
  this.x1_ = x1; 
  this.y1_ = y1; 
  this.x2_ = x2; 
  this.y2_ = y2; 
  this.color1_ = color1; 
  this.color2_ = color2; 
}; 
goog.inherits(goog.graphics.LinearGradient, goog.graphics.Fill); 
goog.graphics.LinearGradient.prototype.getX1 = function() { 
  return this.x1_; 
}; 
goog.graphics.LinearGradient.prototype.getY1 = function() { 
  return this.y1_; 
}; 
goog.graphics.LinearGradient.prototype.getX2 = function() { 
  return this.x2_; 
}; 
goog.graphics.LinearGradient.prototype.getY2 = function() { 
  return this.y2_; 
}; 
goog.graphics.LinearGradient.prototype.getColor1 = function() { 
  return this.color1_; 
}; 
goog.graphics.LinearGradient.prototype.getColor2 = function() { 
  return this.color2_; 
}; 
