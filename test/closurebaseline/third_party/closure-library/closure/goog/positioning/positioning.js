
goog.provide('goog.positioning'); 
goog.provide('goog.positioning.Corner'); 
goog.provide('goog.positioning.CornerBit'); 
goog.provide('goog.positioning.Overflow'); 
goog.provide('goog.positioning.OverflowStatus'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Size'); 
goog.require('goog.style'); 
goog.positioning.Corner = { 
  TOP_LEFT: 0, 
  TOP_RIGHT: 2, 
  BOTTOM_LEFT: 1, 
  BOTTOM_RIGHT: 3, 
  TOP_START: 4, 
  TOP_END: 6, 
  BOTTOM_START: 5, 
  BOTTOM_END: 7 
}; 
goog.positioning.CornerBit = { 
  BOTTOM: 1, 
  RIGHT: 2, 
  FLIP_RTL: 4 
}; 
goog.positioning.Overflow = { 
  IGNORE: 0, 
  ADJUST_X: 1, 
  FAIL_X: 2, 
  ADJUST_Y: 4, 
  FAIL_Y: 8, 
  RESIZE_WIDTH: 16, 
  RESIZE_HEIGHT: 32, 
  ADJUST_X_EXCEPT_OFFSCREEN: 64 | 1, 
  ADJUST_Y_EXCEPT_OFFSCREEN: 128 | 4 
}; 
goog.positioning.OverflowStatus = { 
  NONE: 0, 
  ADJUSTED_X: 1, 
  ADJUSTED_Y: 2, 
  WIDTH_ADJUSTED: 4, 
  HEIGHT_ADJUSTED: 8, 
  FAILED_LEFT: 16, 
  FAILED_RIGHT: 32, 
  FAILED_TOP: 64, 
  FAILED_BOTTOM: 128, 
  FAILED_OUTSIDE_VIEWPORT: 256 
}; 
goog.positioning.OverflowStatus.FAILED = goog.positioning.OverflowStatus.FAILED_LEFT | goog.positioning.OverflowStatus.FAILED_RIGHT | goog.positioning.OverflowStatus.FAILED_TOP | goog.positioning.OverflowStatus.FAILED_BOTTOM | goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT; 
goog.positioning.OverflowStatus.FAILED_HORIZONTAL = goog.positioning.OverflowStatus.FAILED_LEFT | goog.positioning.OverflowStatus.FAILED_RIGHT; 
goog.positioning.OverflowStatus.FAILED_VERTICAL = goog.positioning.OverflowStatus.FAILED_TOP | goog.positioning.OverflowStatus.FAILED_BOTTOM; 
goog.positioning.positionAtAnchor = function(anchorElement, anchorElementCorner, movableElement, movableElementCorner, opt_offset, opt_margin, opt_overflow, opt_preferredSize) { 
  var moveableParentTopLeft; 
  var parent = movableElement.offsetParent; 
  if(parent) { 
    var isBody = parent.tagName == goog.dom.TagName.HTML || parent.tagName == goog.dom.TagName.BODY; 
    if(! isBody || goog.style.getComputedPosition(parent) != 'static') { 
      moveableParentTopLeft = goog.style.getPageOffset(parent); 
      if(! isBody) { 
        moveableParentTopLeft = goog.math.Coordinate.difference(moveableParentTopLeft, new goog.math.Coordinate(parent.scrollLeft, parent.scrollTop)); 
      } 
    } 
  } 
  var anchorRect = goog.positioning.getVisiblePart_(anchorElement); 
  goog.style.translateRectForAnotherFrame(anchorRect, goog.dom.getDomHelper(anchorElement), goog.dom.getDomHelper(movableElement)); 
  var corner = goog.positioning.getEffectiveCorner(anchorElement, anchorElementCorner); 
  var absolutePos = new goog.math.Coordinate(corner & goog.positioning.CornerBit.RIGHT ? anchorRect.left + anchorRect.width: anchorRect.left, corner & goog.positioning.CornerBit.BOTTOM ? anchorRect.top + anchorRect.height: anchorRect.top); 
  if(moveableParentTopLeft) { 
    absolutePos = goog.math.Coordinate.difference(absolutePos, moveableParentTopLeft); 
  } 
  if(opt_offset) { 
    absolutePos.x +=(corner & goog.positioning.CornerBit.RIGHT ? - 1: 1) * opt_offset.x; 
    absolutePos.y +=(corner & goog.positioning.CornerBit.BOTTOM ? - 1: 1) * opt_offset.y; 
  } 
  var viewport; 
  if(opt_overflow) { 
    viewport = goog.style.getVisibleRectForElement(movableElement); 
    if(viewport && moveableParentTopLeft) { 
      viewport.top = Math.max(0, viewport.top - moveableParentTopLeft.y); 
      viewport.right -= moveableParentTopLeft.x; 
      viewport.bottom -= moveableParentTopLeft.y; 
      viewport.left = Math.max(0, viewport.left - moveableParentTopLeft.x); 
    } 
  } 
  return goog.positioning.positionAtCoordinate(absolutePos, movableElement, movableElementCorner, opt_margin, viewport, opt_overflow, opt_preferredSize); 
}; 
goog.positioning.getVisiblePart_ = function(el) { 
  var rect = goog.style.getBounds(el); 
  var visibleBox = goog.style.getVisibleRectForElement(el); 
  if(visibleBox) { 
    rect.intersection(goog.math.Rect.createFromBox(visibleBox)); 
  } 
  return rect; 
}; 
goog.positioning.positionAtCoordinate = function(absolutePos, movableElement, movableElementCorner, opt_margin, opt_viewport, opt_overflow, opt_preferredSize) { 
  absolutePos = absolutePos.clone(); 
  var status = goog.positioning.OverflowStatus.NONE; 
  var corner = goog.positioning.getEffectiveCorner(movableElement, movableElementCorner); 
  var elementSize = goog.style.getSize(movableElement); 
  var size = opt_preferredSize ? opt_preferredSize.clone(): elementSize.clone(); 
  if(opt_margin || corner != goog.positioning.Corner.TOP_LEFT) { 
    if(corner & goog.positioning.CornerBit.RIGHT) { 
      absolutePos.x -= size.width +(opt_margin ? opt_margin.right: 0); 
    } else if(opt_margin) { 
      absolutePos.x += opt_margin.left; 
    } 
    if(corner & goog.positioning.CornerBit.BOTTOM) { 
      absolutePos.y -= size.height +(opt_margin ? opt_margin.bottom: 0); 
    } else if(opt_margin) { 
      absolutePos.y += opt_margin.top; 
    } 
  } 
  if(opt_overflow) { 
    status = opt_viewport ? goog.positioning.adjustForViewport(absolutePos, size, opt_viewport, opt_overflow): goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT; 
    if(status & goog.positioning.OverflowStatus.FAILED) { 
      return status; 
    } 
  } 
  goog.style.setPosition(movableElement, absolutePos); 
  if(! goog.math.Size.equals(elementSize, size)) { 
    goog.style.setSize(movableElement, size); 
  } 
  return status; 
}; 
goog.positioning.adjustForViewport = function(pos, size, viewport, overflow) { 
  var status = goog.positioning.OverflowStatus.NONE; 
  var ADJUST_X_EXCEPT_OFFSCREEN = goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN; 
  var ADJUST_Y_EXCEPT_OFFSCREEN = goog.positioning.Overflow.ADJUST_Y_EXCEPT_OFFSCREEN; 
  if((overflow & ADJUST_X_EXCEPT_OFFSCREEN) == ADJUST_X_EXCEPT_OFFSCREEN &&(pos.x < viewport.left || pos.x + size.width > viewport.right)) { 
    overflow &= ~ goog.positioning.Overflow.ADJUST_X; 
  } 
  if((overflow & ADJUST_Y_EXCEPT_OFFSCREEN) == ADJUST_Y_EXCEPT_OFFSCREEN &&(pos.y < viewport.top || pos.y + size.height > viewport.bottom)) { 
    overflow &= ~ goog.positioning.Overflow.ADJUST_Y; 
  } 
  if(pos.x < viewport.left && overflow & goog.positioning.Overflow.ADJUST_X) { 
    pos.x = viewport.left; 
    status |= goog.positioning.OverflowStatus.ADJUSTED_X; 
  } 
  if(pos.x < viewport.left && pos.x + size.width > viewport.right && overflow & goog.positioning.Overflow.RESIZE_WIDTH) { 
    size.width -=(pos.x + size.width) - viewport.right; 
    status |= goog.positioning.OverflowStatus.WIDTH_ADJUSTED; 
  } 
  if(pos.x + size.width > viewport.right && overflow & goog.positioning.Overflow.ADJUST_X) { 
    pos.x = Math.max(viewport.right - size.width, viewport.left); 
    status |= goog.positioning.OverflowStatus.ADJUSTED_X; 
  } 
  if(overflow & goog.positioning.Overflow.FAIL_X) { 
    status |=(pos.x < viewport.left ? goog.positioning.OverflowStatus.FAILED_LEFT: 0) |(pos.x + size.width > viewport.right ? goog.positioning.OverflowStatus.FAILED_RIGHT: 0); 
  } 
  if(pos.y < viewport.top && overflow & goog.positioning.Overflow.ADJUST_Y) { 
    pos.y = viewport.top; 
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y; 
  } 
  if(pos.y >= viewport.top && pos.y + size.height > viewport.bottom && overflow & goog.positioning.Overflow.RESIZE_HEIGHT) { 
    size.height -=(pos.y + size.height) - viewport.bottom; 
    status |= goog.positioning.OverflowStatus.HEIGHT_ADJUSTED; 
  } 
  if(pos.y + size.height > viewport.bottom && overflow & goog.positioning.Overflow.ADJUST_Y) { 
    pos.y = Math.max(viewport.bottom - size.height, viewport.top); 
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y; 
  } 
  if(overflow & goog.positioning.Overflow.FAIL_Y) { 
    status |=(pos.y < viewport.top ? goog.positioning.OverflowStatus.FAILED_TOP: 0) |(pos.y + size.height > viewport.bottom ? goog.positioning.OverflowStatus.FAILED_BOTTOM: 0); 
  } 
  return status; 
}; 
goog.positioning.getEffectiveCorner = function(element, corner) { 
  return((corner & goog.positioning.CornerBit.FLIP_RTL && goog.style.isRightToLeft(element) ? corner ^ goog.positioning.CornerBit.RIGHT: corner) & ~ goog.positioning.CornerBit.FLIP_RTL); 
}; 
goog.positioning.flipCornerHorizontal = function(corner) { 
  return(corner ^ goog.positioning.CornerBit.RIGHT); 
}; 
goog.positioning.flipCornerVertical = function(corner) { 
  return(corner ^ goog.positioning.CornerBit.BOTTOM); 
}; 
goog.positioning.flipCorner = function(corner) { 
  return(corner ^ goog.positioning.CornerBit.BOTTOM ^ goog.positioning.CornerBit.RIGHT); 
}; 
