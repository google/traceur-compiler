
goog.provide('goog.positioning.AbsolutePosition'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Size'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AbstractPosition'); 
goog.positioning.AbsolutePosition = function(arg1, opt_arg2) { 
  this.coordinate = arg1 instanceof goog.math.Coordinate ? arg1: new goog.math.Coordinate((arg1), opt_arg2); 
}; 
goog.inherits(goog.positioning.AbsolutePosition, goog.positioning.AbstractPosition); 
goog.positioning.AbsolutePosition.prototype.reposition = function(movableElement, movableCorner, opt_margin, opt_preferredSize) { 
  goog.positioning.positionAtCoordinate(this.coordinate, movableElement, movableCorner, opt_margin, null, null, opt_preferredSize); 
}; 
