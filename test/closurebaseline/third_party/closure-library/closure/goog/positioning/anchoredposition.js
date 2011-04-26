
goog.provide('goog.positioning.AnchoredPosition'); 
goog.require('goog.math.Box'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AbstractPosition'); 
goog.positioning.AnchoredPosition = function(anchorElement, corner) { 
  this.element = anchorElement; 
  this.corner = corner; 
}; 
goog.inherits(goog.positioning.AnchoredPosition, goog.positioning.AbstractPosition); 
goog.positioning.AnchoredPosition.prototype.reposition = function(movableElement, movableCorner, opt_margin, opt_preferredSize) { 
  goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, undefined, opt_margin); 
}; 
