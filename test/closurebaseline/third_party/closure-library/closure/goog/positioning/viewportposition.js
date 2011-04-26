
goog.provide('goog.positioning.ViewportPosition'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Size'); 
goog.require('goog.positioning.AbstractPosition'); 
goog.positioning.ViewportPosition = function(arg1, opt_arg2) { 
  this.coordinate = arg1 instanceof goog.math.Coordinate ? arg1: new goog.math.Coordinate((arg1), opt_arg2); 
}; 
goog.inherits(goog.positioning.ViewportPosition, goog.positioning.AbstractPosition); 
goog.positioning.ViewportPosition.prototype.reposition = function(element, popupCorner, opt_margin, opt_preferredSize) { 
  goog.positioning.positionAtAnchor(goog.style.getClientViewportElement(element), goog.positioning.Corner.TOP_LEFT, element, popupCorner, this.coordinate, opt_margin, null, opt_preferredSize); 
}; 
