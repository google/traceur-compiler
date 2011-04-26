
goog.provide('goog.graphics.ImageElement'); 
goog.require('goog.graphics.Element'); 
goog.graphics.ImageElement = function(element, graphics) { 
  goog.graphics.Element.call(this, element, graphics); 
}; 
goog.inherits(goog.graphics.ImageElement, goog.graphics.Element); 
goog.graphics.ImageElement.prototype.setPosition = goog.abstractMethod; 
goog.graphics.ImageElement.prototype.setSize = goog.abstractMethod; 
goog.graphics.ImageElement.prototype.setSource = goog.abstractMethod; 
