
goog.provide('goog.graphics.EllipseElement'); 
goog.require('goog.graphics.StrokeAndFillElement'); 
goog.graphics.EllipseElement = function(element, graphics, stroke, fill) { 
  goog.graphics.StrokeAndFillElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.EllipseElement, goog.graphics.StrokeAndFillElement); 
goog.graphics.EllipseElement.prototype.setCenter = goog.abstractMethod; 
goog.graphics.EllipseElement.prototype.setRadius = goog.abstractMethod; 
