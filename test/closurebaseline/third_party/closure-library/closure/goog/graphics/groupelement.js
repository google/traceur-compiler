
goog.provide('goog.graphics.GroupElement'); 
goog.require('goog.graphics.Element'); 
goog.graphics.GroupElement = function(element, graphics) { 
  goog.graphics.Element.call(this, element, graphics); 
}; 
goog.inherits(goog.graphics.GroupElement, goog.graphics.Element); 
goog.graphics.GroupElement.prototype.clear = goog.abstractMethod; 
goog.graphics.GroupElement.prototype.setSize = goog.abstractMethod; 
