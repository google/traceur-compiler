
goog.provide('goog.ui.Popup'); 
goog.provide('goog.ui.Popup.AbsolutePosition'); 
goog.provide('goog.ui.Popup.AnchoredPosition'); 
goog.provide('goog.ui.Popup.AnchoredViewPortPosition'); 
goog.provide('goog.ui.Popup.ClientPosition'); 
goog.provide('goog.ui.Popup.Corner'); 
goog.provide('goog.ui.Popup.Overflow'); 
goog.provide('goog.ui.Popup.ViewPortClientPosition'); 
goog.provide('goog.ui.Popup.ViewPortPosition'); 
goog.require('goog.math.Box'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AbsolutePosition'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.AnchoredViewportPosition'); 
goog.require('goog.positioning.ClientPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.positioning.Overflow'); 
goog.require('goog.positioning.OverflowStatus'); 
goog.require('goog.positioning.ViewportClientPosition'); 
goog.require('goog.positioning.ViewportPosition'); 
goog.require('goog.style'); 
goog.require('goog.ui.PopupBase'); 
goog.ui.Popup = function(opt_element, opt_position) { 
  this.popupCorner_ = goog.positioning.Corner.TOP_START; 
  this.position_ = opt_position || undefined; 
  goog.ui.PopupBase.call(this, opt_element); 
}; 
goog.inherits(goog.ui.Popup, goog.ui.PopupBase); 
goog.ui.Popup.Corner = goog.positioning.Corner; 
goog.ui.Popup.Overflow = goog.positioning.Overflow; 
goog.ui.Popup.prototype.margin_; 
goog.ui.Popup.prototype.getPinnedCorner = function() { 
  return this.popupCorner_; 
}; 
goog.ui.Popup.prototype.setPinnedCorner = function(corner) { 
  this.popupCorner_ = corner; 
  if(this.isVisible()) { 
    this.reposition(); 
  } 
}; 
goog.ui.Popup.prototype.getPosition = function() { 
  return this.position_ || null; 
}; 
goog.ui.Popup.prototype.setPosition = function(position) { 
  this.position_ = position || undefined; 
  if(this.isVisible()) { 
    this.reposition(); 
  } 
}; 
goog.ui.Popup.prototype.getMargin = function() { 
  return this.margin_ || null; 
}; 
goog.ui.Popup.prototype.setMargin = function(arg1, opt_arg2, opt_arg3, opt_arg4) { 
  if(arg1 == null || arg1 instanceof goog.math.Box) { 
    this.margin_ = arg1; 
  } else { 
    this.margin_ = new goog.math.Box(arg1,(opt_arg2),(opt_arg3),(opt_arg4)); 
  } 
  if(this.isVisible()) { 
    this.reposition(); 
  } 
}; 
goog.ui.Popup.prototype.reposition = function() { 
  if(! this.position_) { 
    return; 
  } 
  var hideForPositioning = ! this.isVisible() && this.getType() != goog.ui.PopupBase.Type.MOVE_OFFSCREEN; 
  var el = this.getElement(); 
  if(hideForPositioning) { 
    el.style.visibility = 'hidden'; 
    goog.style.showElement(el, true); 
  } 
  this.position_.reposition(el, this.popupCorner_, this.margin_); 
  if(hideForPositioning) { 
    goog.style.showElement(el, false); 
  } 
}; 
goog.ui.Popup.positionPopup = function(anchorElement, anchorElementCorner, movableElement, movableElementCorner, opt_offset, opt_margin, opt_overflow) { 
  return(goog.positioning.positionAtAnchor(anchorElement, anchorElementCorner, movableElement, movableElementCorner, opt_offset, opt_margin, opt_overflow) & goog.positioning.OverflowStatus.FAILED) == 0; 
}; 
goog.ui.Popup.positionAtCoordinate = function(absolutePos, movableElement, movableElementCorner, opt_margin) { 
  goog.positioning.positionAtCoordinate(absolutePos, movableElement, movableElementCorner, opt_margin); 
  return true; 
}; 
goog.ui.Popup.AnchoredPosition = goog.positioning.AnchoredPosition; 
goog.ui.Popup.AnchoredViewPortPosition = goog.positioning.AnchoredViewportPosition; 
goog.ui.Popup.AbsolutePosition = goog.positioning.AbsolutePosition; 
goog.ui.Popup.ViewPortPosition = goog.positioning.ViewportPosition; 
goog.ui.Popup.ClientPosition = goog.positioning.ClientPosition; 
goog.ui.Popup.ViewPortClientPosition = goog.positioning.ViewportClientPosition; 
