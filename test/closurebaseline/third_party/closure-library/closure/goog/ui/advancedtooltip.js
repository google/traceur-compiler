
goog.provide('goog.ui.AdvancedTooltip'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.ui.Tooltip'); 
goog.require('goog.userAgent'); 
goog.ui.AdvancedTooltip = function(opt_el, opt_str, opt_domHelper) { 
  goog.ui.Tooltip.call(this, opt_el, opt_str, opt_domHelper); 
}; 
goog.inherits(goog.ui.AdvancedTooltip, goog.ui.Tooltip); 
goog.ui.AdvancedTooltip.prototype.cursorTracking_ = false; 
goog.ui.AdvancedTooltip.prototype.cursorTrackingHideDelayMs_ = 100; 
goog.ui.AdvancedTooltip.prototype.hotSpotPadding_; 
goog.ui.AdvancedTooltip.prototype.boundingBox_; 
goog.ui.AdvancedTooltip.prototype.paddingBox_; 
goog.ui.AdvancedTooltip.prototype.anchorBox_; 
goog.ui.AdvancedTooltip.prototype.tracking_ = false; 
goog.ui.AdvancedTooltip.prototype.setHotSpotPadding = function(opt_box) { 
  this.hotSpotPadding_ = opt_box || null; 
}; 
goog.ui.AdvancedTooltip.prototype.getHotSpotPadding = function() { 
  return this.hotSpotPadding_; 
}; 
goog.ui.AdvancedTooltip.prototype.setCursorTracking = function(b) { 
  this.cursorTracking_ = b; 
}; 
goog.ui.AdvancedTooltip.prototype.getCursorTracking = function() { 
  return this.cursorTracking_; 
}; 
goog.ui.AdvancedTooltip.prototype.setCursorTrackingHideDelayMs = function(delay) { 
  this.cursorTrackingHideDelayMs_ = delay; 
}; 
goog.ui.AdvancedTooltip.prototype.getCursorTrackingHideDelayMs = function() { 
  return this.cursorTrackingHideDelayMs_; 
}; 
goog.ui.AdvancedTooltip.prototype.onShow_ = function() { 
  goog.ui.AdvancedTooltip.superClass_.onShow_.call(this); 
  this.boundingBox_ = goog.style.getBounds(this.getElement()).toBox(); 
  if(this.anchor) { 
    this.anchorBox_ = goog.style.getBounds(this.anchor).toBox(); 
  } 
  this.tracking_ = this.cursorTracking_; 
  goog.events.listen(this.getDomHelper().getDocument(), goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this); 
}; 
goog.ui.AdvancedTooltip.prototype.onHide_ = function() { 
  goog.events.unlisten(this.getDomHelper().getDocument(), goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this); 
  this.paddingBox_ = null; 
  this.boundingBox_ = null; 
  this.anchorBox_ = null; 
  this.tracking_ = false; 
  goog.ui.AdvancedTooltip.superClass_.onHide_.call(this); 
}; 
goog.ui.AdvancedTooltip.prototype.isMouseInTooltip = function() { 
  return this.isCoordinateInTooltip(this.cursorPosition); 
}; 
goog.ui.AdvancedTooltip.prototype.isCoordinateInTooltip = function(coord) { 
  if(this.paddingBox_) { 
    return this.paddingBox_.contains(coord); 
  } 
  return goog.ui.AdvancedTooltip.superClass_.isCoordinateInTooltip.call(this, coord); 
}; 
goog.ui.AdvancedTooltip.prototype.isCoordinateActive_ = function(coord) { 
  if((this.anchorBox_ && this.anchorBox_.contains(coord)) || this.isCoordinateInTooltip(coord)) { 
    return true; 
  } 
  var childTooltip = this.getChildTooltip(); 
  return ! ! childTooltip && childTooltip.isCoordinateInTooltip(coord); 
}; 
goog.ui.AdvancedTooltip.prototype.maybeHide = function(el) { 
  this.hideTimer = undefined; 
  if(el == this.anchor) { 
    if(! this.isCoordinateActive_(this.cursorPosition) && ! this.getActiveElement() && ! this.hasActiveChild()) { 
      if(goog.userAgent.GECKO && this.cursorPosition.x == 0 && this.cursorPosition.y == 0) { 
        return; 
      } 
      this.setVisible(false); 
    } 
  } 
}; 
goog.ui.AdvancedTooltip.prototype.handleMouseMove = function(event) { 
  var startTimer = this.isVisible(); 
  if(this.boundingBox_) { 
    var scroll = this.getDomHelper().getDocumentScroll(); 
    var c = new goog.math.Coordinate(event.clientX + scroll.x, event.clientY + scroll.y); 
    if(this.isCoordinateActive_(c)) { 
      startTimer = false; 
    } else if(this.tracking_) { 
      var prevDist = goog.math.Box.distance(this.boundingBox_, this.cursorPosition); 
      var currDist = goog.math.Box.distance(this.boundingBox_, c); 
      startTimer = currDist >= prevDist; 
    } 
  } 
  if(startTimer) { 
    this.startHideTimer_(); 
    this.setActiveElement(null); 
    var childTooltip = this.getChildTooltip(); 
    if(childTooltip) { 
      childTooltip.setActiveElement(null); 
    } 
  } else if(this.getState() == goog.ui.Tooltip.State.WAITING_TO_HIDE) { 
    this.clearHideTimer(); 
  } 
  goog.ui.AdvancedTooltip.superClass_.handleMouseMove.call(this, event); 
}; 
goog.ui.AdvancedTooltip.prototype.handleTooltipMouseOver = function(event) { 
  if(this.getActiveElement() != this.getElement()) { 
    this.tracking_ = false; 
    this.setActiveElement(this.getElement()); 
    if(! this.paddingBox_ && this.hotSpotPadding_) { 
      this.paddingBox_ = this.boundingBox_.clone().expand(this.hotSpotPadding_); 
    } 
  } 
}; 
goog.ui.AdvancedTooltip.prototype.getHideDelayMs = function() { 
  return this.tracking_ ? this.cursorTrackingHideDelayMs_: goog.base(this, 'getHideDelayMs'); 
}; 
goog.ui.AdvancedTooltip.prototype.resetHotSpot = function() { 
  this.paddingBox_ = null; 
}; 
