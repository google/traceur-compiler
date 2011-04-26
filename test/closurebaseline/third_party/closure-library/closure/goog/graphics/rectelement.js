
goog.provide('goog.graphics.RectElement'); 
goog.require('goog.graphics.StrokeAndFillElement'); 
goog.graphics.RectElement = function(element, graphics, stroke, fill) { 
  goog.graphics.StrokeAndFillElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.RectElement, goog.graphics.StrokeAndFillElement); 
goog.graphics.RectElement.prototype.setPosition = goog.abstractMethod; 
goog.graphics.RectElement.prototype.setSize = goog.abstractMethod; 
