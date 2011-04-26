
goog.provide('goog.graphics.StrokeAndFillElement'); 
goog.require('goog.graphics.Element'); 
goog.graphics.StrokeAndFillElement = function(element, graphics, stroke, fill) { 
  goog.graphics.Element.call(this, element, graphics); 
  this.setStroke(stroke); 
  this.setFill(fill); 
}; 
goog.inherits(goog.graphics.StrokeAndFillElement, goog.graphics.Element); 
goog.graphics.StrokeAndFillElement.prototype.fill = null; 
goog.graphics.StrokeAndFillElement.prototype.stroke_ = null; 
goog.graphics.StrokeAndFillElement.prototype.setFill = function(fill) { 
  this.fill = fill; 
  this.getGraphics().setElementFill(this, fill); 
}; 
goog.graphics.StrokeAndFillElement.prototype.getFill = function() { 
  return this.fill; 
}; 
goog.graphics.StrokeAndFillElement.prototype.setStroke = function(stroke) { 
  this.stroke_ = stroke; 
  this.getGraphics().setElementStroke(this, stroke); 
}; 
goog.graphics.StrokeAndFillElement.prototype.getStroke = function() { 
  return this.stroke_; 
}; 
goog.graphics.StrokeAndFillElement.prototype.reapplyStroke = function() { 
  if(this.stroke_) { 
    this.setStroke(this.stroke_); 
  } 
}; 
