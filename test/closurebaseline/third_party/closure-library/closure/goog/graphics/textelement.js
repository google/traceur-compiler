
goog.provide('goog.graphics.TextElement'); 
goog.require('goog.graphics.StrokeAndFillElement'); 
goog.graphics.TextElement = function(element, graphics, stroke, fill) { 
  goog.graphics.StrokeAndFillElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.TextElement, goog.graphics.StrokeAndFillElement); 
goog.graphics.TextElement.prototype.setText = goog.abstractMethod; 
