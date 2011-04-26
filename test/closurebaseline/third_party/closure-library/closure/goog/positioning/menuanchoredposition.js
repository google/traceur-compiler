
goog.provide('goog.positioning.MenuAnchoredPosition'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Size'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AnchoredViewportPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.positioning.Overflow'); 
goog.positioning.MenuAnchoredPosition = function(anchorElement, corner, opt_adjust, opt_resize) { 
  goog.positioning.AnchoredViewportPosition.call(this, anchorElement, corner, opt_adjust); 
  this.resize_ = opt_resize; 
}; 
goog.inherits(goog.positioning.MenuAnchoredPosition, goog.positioning.AnchoredViewportPosition); 
goog.positioning.MenuAnchoredPosition.prototype.canAdjustOffscreen = goog.functions.TRUE; 
goog.positioning.MenuAnchoredPosition.prototype.reposition = function(movableElement, movableCorner, opt_margin, opt_preferredSize) { 
  if(this.resize_) { 
    goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, null, opt_margin, goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN | goog.positioning.Overflow.RESIZE_HEIGHT, opt_preferredSize); 
  } else { 
    goog.positioning.MenuAnchoredPosition.superClass_.reposition.call(this, movableElement, movableCorner, opt_margin, opt_preferredSize); 
  } 
}; 
