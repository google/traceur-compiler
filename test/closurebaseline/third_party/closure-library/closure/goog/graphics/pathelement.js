
goog.provide('goog.graphics.PathElement'); 
goog.require('goog.graphics.StrokeAndFillElement'); 
goog.graphics.PathElement = function(element, graphics, stroke, fill) { 
  goog.graphics.StrokeAndFillElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.PathElement, goog.graphics.StrokeAndFillElement); 
goog.graphics.PathElement.prototype.setPath = goog.abstractMethod; 
