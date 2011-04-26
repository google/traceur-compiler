
goog.provide('goog.graphics.ext.StrokeAndFillElement'); 
goog.require('goog.graphics.ext.Element'); 
goog.graphics.ext.StrokeAndFillElement = function(group, wrapper) { 
  goog.graphics.ext.Element.call(this, group, wrapper); 
}; 
goog.inherits(goog.graphics.ext.StrokeAndFillElement, goog.graphics.ext.Element); 
goog.graphics.ext.StrokeAndFillElement.prototype.setFill = function(fill) { 
  this.getWrapper().setFill(fill); 
}; 
goog.graphics.ext.StrokeAndFillElement.prototype.setStroke = function(stroke) { 
  this.getWrapper().setStroke(stroke); 
}; 
goog.graphics.ext.StrokeAndFillElement.prototype.redraw = function() { 
  this.getWrapper().reapplyStroke(); 
}; 
