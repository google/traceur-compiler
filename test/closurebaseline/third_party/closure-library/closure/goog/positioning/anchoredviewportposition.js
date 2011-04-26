
goog.provide('goog.positioning.AnchoredViewportPosition'); 
goog.require('goog.functions'); 
goog.require('goog.math.Box'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.positioning.Overflow'); 
goog.require('goog.positioning.OverflowStatus'); 
goog.positioning.AnchoredViewportPosition = function(anchorElement, corner, opt_adjust) { 
  goog.positioning.AnchoredPosition.call(this, anchorElement, corner); 
  this.adjust_ = opt_adjust; 
}; 
goog.inherits(goog.positioning.AnchoredViewportPosition, goog.positioning.AnchoredPosition); 
goog.positioning.AnchoredViewportPosition.prototype.canAdjustOffscreen = goog.functions.FALSE; 
goog.positioning.AnchoredViewportPosition.prototype.reposition = function(movableElement, movableCorner, opt_margin, opt_preferredSize) { 
  var status = goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, null, opt_margin, goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y, opt_preferredSize); 
  if(status & goog.positioning.OverflowStatus.FAILED) { 
    var cornerFallback = this.corner; 
    var movableCornerFallback = movableCorner; 
    if(status & goog.positioning.OverflowStatus.FAILED_HORIZONTAL) { 
      cornerFallback = goog.positioning.flipCornerHorizontal(cornerFallback); 
      movableCornerFallback = goog.positioning.flipCornerHorizontal(movableCornerFallback); 
    } 
    if(status & goog.positioning.OverflowStatus.FAILED_VERTICAL) { 
      cornerFallback = goog.positioning.flipCornerVertical(cornerFallback); 
      movableCornerFallback = goog.positioning.flipCornerVertical(movableCornerFallback); 
    } 
    status = goog.positioning.positionAtAnchor(this.element, cornerFallback, movableElement, movableCornerFallback, null, opt_margin, goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y, opt_preferredSize); 
    if(status & goog.positioning.OverflowStatus.FAILED) { 
      if(this.adjust_) { 
        var overflow = this.canAdjustOffscreen() ?(goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN | goog.positioning.Overflow.ADJUST_Y_EXCEPT_OFFSCREEN):(goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.ADJUST_Y); 
        goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, null, opt_margin, overflow, opt_preferredSize); 
      } else { 
        goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, null, opt_margin, goog.positioning.Overflow.IGNORE, opt_preferredSize); 
      } 
    } 
  } 
}; 
