
goog.provide('goog.positioning.ClientPosition'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Size'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AbstractPosition'); 
goog.positioning.ClientPosition = function(arg1, opt_arg2) { 
  this.coordinate = arg1 instanceof goog.math.Coordinate ? arg1: new goog.math.Coordinate((arg1), opt_arg2); 
}; 
goog.inherits(goog.positioning.ClientPosition, goog.positioning.AbstractPosition); 
goog.positioning.ClientPosition.prototype.reposition = function(element, popupCorner, opt_margin, opt_preferredSize) { 
  var viewportElt = goog.style.getClientViewportElement(element); 
  var clientPos = new goog.math.Coordinate(this.coordinate.x + viewportElt.scrollLeft, this.coordinate.y + viewportElt.scrollTop); 
  goog.positioning.positionAtAnchor(viewportElt, goog.positioning.Corner.TOP_LEFT, element, popupCorner, clientPos, opt_margin, null, opt_preferredSize); 
}; 
