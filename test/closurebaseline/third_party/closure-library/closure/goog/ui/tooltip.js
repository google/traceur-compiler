
goog.provide('goog.ui.Tooltip'); 
goog.provide('goog.ui.Tooltip.CursorTooltipPosition'); 
goog.provide('goog.ui.Tooltip.ElementTooltipPosition'); 
goog.provide('goog.ui.Tooltip.State'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.positioning.Overflow'); 
goog.require('goog.positioning.OverflowStatus'); 
goog.require('goog.positioning.ViewportPosition'); 
goog.require('goog.structs.Set'); 
goog.require('goog.style'); 
goog.require('goog.ui.Popup'); 
goog.require('goog.ui.PopupBase'); 
goog.ui.Tooltip = function(opt_el, opt_str, opt_domHelper) { 
  this.dom_ = opt_domHelper ||(opt_el ? goog.dom.getDomHelper(goog.dom.getElement(opt_el)): goog.dom.getDomHelper()); 
  goog.ui.Popup.call(this, this.dom_.createDom('div', { 'style': 'position:absolute;display:none;' })); 
  this.cursorPosition = new goog.math.Coordinate(1, 1); 
  this.elements_ = new goog.structs.Set(); 
  if(opt_el) { 
    this.attach(opt_el); 
  } 
  if(opt_str != null) { 
    this.setText(opt_str); 
  } 
}; 
goog.inherits(goog.ui.Tooltip, goog.ui.Popup); 
goog.ui.Tooltip.activeInstances_ =[]; 
goog.ui.Tooltip.prototype.activeEl_ = null; 
goog.ui.Tooltip.prototype.className = goog.getCssName('goog-tooltip'); 
goog.ui.Tooltip.prototype.showDelayMs_ = 500; 
goog.ui.Tooltip.prototype.showTimer; 
goog.ui.Tooltip.prototype.hideDelayMs_ = 0; 
goog.ui.Tooltip.prototype.hideTimer; 
goog.ui.Tooltip.prototype.anchor; 
goog.ui.Tooltip.State = { 
  INACTIVE: 0, 
  WAITING_TO_SHOW: 1, 
  SHOWING: 2, 
  WAITING_TO_HIDE: 3, 
  UPDATING: 4 
}; 
goog.ui.Tooltip.prototype.seenInteraction_; 
goog.ui.Tooltip.prototype.requireInteraction_; 
goog.ui.Tooltip.prototype.childTooltip_; 
goog.ui.Tooltip.prototype.parentTooltip_; 
goog.ui.Tooltip.prototype.getDomHelper = function() { 
  return this.dom_; 
}; 
goog.ui.Tooltip.prototype.getChildTooltip = function() { 
  return this.childTooltip_; 
}; 
goog.ui.Tooltip.prototype.attach = function(el) { 
  el = goog.dom.getElement(el); 
  this.elements_.add(el); 
  goog.events.listen(el, goog.events.EventType.MOUSEOVER, this.handleMouseOver, false, this); 
  goog.events.listen(el, goog.events.EventType.MOUSEOUT, this.handleMouseOutAndBlur, false, this); 
  goog.events.listen(el, goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this); 
  goog.events.listen(el, goog.events.EventType.FOCUS, this.handleFocus, false, this); 
  goog.events.listen(el, goog.events.EventType.BLUR, this.handleMouseOutAndBlur, false, this); 
}; 
goog.ui.Tooltip.prototype.detach = function(opt_el) { 
  if(opt_el) { 
    var el = goog.dom.getElement(opt_el); 
    this.detachElement_(el); 
    this.elements_.remove(el); 
  } else { 
    var a = this.elements_.getValues(); 
    for(var el, i = 0; el = a[i]; i ++) { 
      this.detachElement_(el); 
    } 
    this.elements_.clear(); 
  } 
}; 
goog.ui.Tooltip.prototype.detachElement_ = function(el) { 
  goog.events.unlisten(el, goog.events.EventType.MOUSEOVER, this.handleMouseOver, false, this); 
  goog.events.unlisten(el, goog.events.EventType.MOUSEOUT, this.handleMouseOutAndBlur, false, this); 
  goog.events.unlisten(el, goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this); 
  goog.events.unlisten(el, goog.events.EventType.FOCUS, this.handleFocus, false, this); 
  goog.events.unlisten(el, goog.events.EventType.BLUR, this.handleMouseOutAndBlur, false, this); 
}; 
goog.ui.Tooltip.prototype.setShowDelayMs = function(delay) { 
  this.showDelayMs_ = delay; 
}; 
goog.ui.Tooltip.prototype.getShowDelayMs = function() { 
  return this.showDelayMs_; 
}; 
goog.ui.Tooltip.prototype.setHideDelayMs = function(delay) { 
  this.hideDelayMs_ = delay; 
}; 
goog.ui.Tooltip.prototype.getHideDelayMs = function() { 
  return this.hideDelayMs_; 
}; 
goog.ui.Tooltip.prototype.setText = function(str) { 
  goog.dom.setTextContent(this.getElement(), str); 
}; 
goog.ui.Tooltip.prototype.setHtml = function(str) { 
  this.getElement().innerHTML = str; 
}; 
goog.ui.Tooltip.prototype.setElement = function(el) { 
  var oldElement = this.getElement(); 
  if(oldElement) { 
    goog.dom.removeNode(oldElement); 
  } 
  goog.ui.Tooltip.superClass_.setElement.call(this, el); 
  if(el) { 
    var body = this.dom_.getDocument().body; 
    body.insertBefore(el, body.lastChild); 
  } 
}; 
goog.ui.Tooltip.prototype.getText = function() { 
  return goog.dom.getTextContent(this.getElement()); 
}; 
goog.ui.Tooltip.prototype.getHtml = function() { 
  return this.getElement().innerHTML; 
}; 
goog.ui.Tooltip.prototype.getState = function() { 
  return this.showTimer ?(this.isVisible() ? goog.ui.Tooltip.State.UPDATING: goog.ui.Tooltip.State.WAITING_TO_SHOW): this.hideTimer ? goog.ui.Tooltip.State.WAITING_TO_HIDE: this.isVisible() ? goog.ui.Tooltip.State.SHOWING: goog.ui.Tooltip.State.INACTIVE; 
}; 
goog.ui.Tooltip.prototype.setRequireInteraction = function(requireInteraction) { 
  this.requireInteraction_ = requireInteraction; 
}; 
goog.ui.Tooltip.prototype.isCoordinateInTooltip = function(coord) { 
  if(! this.isVisible()) { 
    return false; 
  } 
  var offset = goog.style.getPageOffset(this.getElement()); 
  var size = goog.style.getSize(this.getElement()); 
  return offset.x <= coord.x && coord.x <= offset.x + size.width && offset.y <= coord.y && coord.y <= offset.y + size.height; 
}; 
goog.ui.Tooltip.prototype.onBeforeShow = function() { 
  if(! goog.ui.PopupBase.prototype.onBeforeShow.call(this)) { 
    return false; 
  } 
  if(this.anchor) { 
    for(var tt, i = 0; tt = goog.ui.Tooltip.activeInstances_[i]; i ++) { 
      if(! goog.dom.contains(tt.getElement(), this.anchor)) { 
        tt.setVisible(false); 
      } 
    } 
  } 
  goog.array.insert(goog.ui.Tooltip.activeInstances_, this); 
  var element = this.getElement(); 
  element.className = this.className; 
  this.clearHideTimer(); 
  goog.events.listen(element, goog.events.EventType.MOUSEOVER, this.handleTooltipMouseOver, false, this); 
  goog.events.listen(element, goog.events.EventType.MOUSEOUT, this.handleTooltipMouseOut, false, this); 
  this.clearShowTimer(); 
  return true; 
}; 
goog.ui.Tooltip.prototype.onHide_ = function() { 
  goog.array.remove(goog.ui.Tooltip.activeInstances_, this); 
  var element = this.getElement(); 
  for(var tt, i = 0; tt = goog.ui.Tooltip.activeInstances_[i]; i ++) { 
    if(tt.anchor && goog.dom.contains(element, tt.anchor)) { 
      tt.setVisible(false); 
    } 
  } 
  if(this.parentTooltip_) { 
    this.parentTooltip_.startHideTimer_(); 
  } 
  goog.events.unlisten(element, goog.events.EventType.MOUSEOVER, this.handleTooltipMouseOver, false, this); 
  goog.events.unlisten(element, goog.events.EventType.MOUSEOUT, this.handleTooltipMouseOut, false, this); 
  this.anchor = undefined; 
  if(this.getState() == goog.ui.Tooltip.State.INACTIVE) { 
    this.seenInteraction_ = false; 
  } 
  goog.ui.PopupBase.prototype.onHide_.call(this); 
}; 
goog.ui.Tooltip.prototype.maybeShow = function(el, opt_pos) { 
  if(this.anchor == el && this.elements_.contains(this.anchor)) { 
    if(this.seenInteraction_ || ! this.requireInteraction_) { 
      this.setVisible(false); 
      if(! this.isVisible()) { 
        this.positionAndShow_(el, opt_pos); 
      } 
    } else { 
      this.anchor = undefined; 
    } 
  } 
  this.showTimer = undefined; 
}; 
goog.ui.Tooltip.prototype.getElements = function() { 
  return this.elements_; 
}; 
goog.ui.Tooltip.prototype.getActiveElement = function() { 
  return this.activeEl_; 
}; 
goog.ui.Tooltip.prototype.setActiveElement = function(activeEl) { 
  this.activeEl_ = activeEl; 
}; 
goog.ui.Tooltip.prototype.showForElement = function(el, opt_pos) { 
  this.attach(el); 
  this.activeEl_ = el; 
  this.positionAndShow_(el, opt_pos); 
}; 
goog.ui.Tooltip.prototype.positionAndShow_ = function(el, opt_pos) { 
  var pos; 
  if(opt_pos) { 
    pos = opt_pos; 
  } else { 
    var coord = this.cursorPosition.clone(); 
    pos = new goog.ui.Tooltip.CursorTooltipPosition(coord); 
  } 
  this.anchor = el; 
  this.setPosition(pos); 
  this.setVisible(true); 
}; 
goog.ui.Tooltip.prototype.maybeHide = function(el) { 
  this.hideTimer = undefined; 
  if(el == this.anchor) { 
    if((this.activeEl_ == null ||(this.activeEl_ != this.getElement() && ! this.elements_.contains(this.activeEl_))) && ! this.hasActiveChild()) { 
      this.setVisible(false); 
    } 
  } 
}; 
goog.ui.Tooltip.prototype.hasActiveChild = function() { 
  return ! !(this.childTooltip_ && this.childTooltip_.activeEl_); 
}; 
goog.ui.Tooltip.prototype.saveCursorPosition_ = function(event) { 
  var scroll = this.dom_.getDocumentScroll(); 
  this.cursorPosition.x = event.clientX + scroll.x; 
  this.cursorPosition.y = event.clientY + scroll.y; 
}; 
goog.ui.Tooltip.prototype.handleMouseOver = function(event) { 
  var el = this.getAnchorFromElement((event.target)); 
  this.activeEl_ =(el); 
  this.clearHideTimer(); 
  if(el != this.anchor) { 
    this.anchor = el; 
    this.startShowTimer((el)); 
    this.checkForParentTooltip_(); 
    this.saveCursorPosition_(event); 
  } 
}; 
goog.ui.Tooltip.prototype.getAnchorFromElement = function(el) { 
  try { 
    while(el && ! this.elements_.contains(el)) { 
      el =(el.parentNode); 
    } 
    return el; 
  } catch(e) { 
    return null; 
  } 
}; 
goog.ui.Tooltip.prototype.handleMouseMove = function(event) { 
  this.saveCursorPosition_(event); 
  this.seenInteraction_ = true; 
}; 
goog.ui.Tooltip.prototype.handleFocus = function(event) { 
  var el = this.getAnchorFromElement((event.target)); 
  this.activeEl_ = el; 
  this.seenInteraction_ = true; 
  if(this.anchor != el) { 
    this.anchor = el; 
    var pos = new goog.ui.Tooltip.ElementTooltipPosition(this.activeEl_); 
    this.clearHideTimer(); 
    this.startShowTimer((el), pos); 
    this.checkForParentTooltip_(); 
  } 
}; 
goog.ui.Tooltip.prototype.checkForParentTooltip_ = function() { 
  if(this.anchor) { 
    for(var tt, i = 0; tt = goog.ui.Tooltip.activeInstances_[i]; i ++) { 
      if(goog.dom.contains(tt.getElement(), this.anchor)) { 
        tt.childTooltip_ = this; 
        this.parentTooltip_ = tt; 
      } 
    } 
  } 
}; 
goog.ui.Tooltip.prototype.handleMouseOutAndBlur = function(event) { 
  var el = this.getAnchorFromElement((event.target)); 
  var elTo = this.getAnchorFromElement((event.relatedTarget)); 
  if(el == elTo) { 
    return; 
  } 
  if(el == this.activeEl_) { 
    this.activeEl_ = null; 
  } 
  this.clearShowTimer(); 
  this.seenInteraction_ = false; 
  if(this.isVisible() &&(! event.relatedTarget || ! goog.dom.contains(this.getElement(), event.relatedTarget))) { 
    this.startHideTimer_(); 
  } else { 
    this.anchor = undefined; 
  } 
}; 
goog.ui.Tooltip.prototype.handleTooltipMouseOver = function(event) { 
  var element = this.getElement(); 
  if(this.activeEl_ != element) { 
    this.clearHideTimer(); 
    this.activeEl_ = element; 
  } 
}; 
goog.ui.Tooltip.prototype.handleTooltipMouseOut = function(event) { 
  var element = this.getElement(); 
  if(this.activeEl_ == element &&(! event.relatedTarget || ! goog.dom.contains(element, event.relatedTarget))) { 
    this.activeEl_ = null; 
    this.startHideTimer_(); 
  } 
}; 
goog.ui.Tooltip.prototype.startShowTimer = function(el, opt_pos) { 
  if(! this.showTimer) { 
    this.showTimer = goog.Timer.callOnce(goog.bind(this.maybeShow, this, el, opt_pos), this.showDelayMs_); 
  } 
}; 
goog.ui.Tooltip.prototype.clearShowTimer = function() { 
  if(this.showTimer) { 
    goog.Timer.clear(this.showTimer); 
    this.showTimer = undefined; 
  } 
}; 
goog.ui.Tooltip.prototype.startHideTimer_ = function() { 
  if(this.getState() == goog.ui.Tooltip.State.SHOWING) { 
    this.hideTimer = goog.Timer.callOnce(goog.bind(this.maybeHide, this, this.anchor), this.getHideDelayMs()); 
  } 
}; 
goog.ui.Tooltip.prototype.clearHideTimer = function() { 
  if(this.hideTimer) { 
    goog.Timer.clear(this.hideTimer); 
    this.hideTimer = undefined; 
  } 
}; 
goog.ui.Tooltip.prototype.disposeInternal = function() { 
  this.setVisible(false); 
  this.clearShowTimer(); 
  this.detach(); 
  if(this.getElement()) { 
    goog.dom.removeNode(this.getElement()); 
  } 
  this.activeEl_ = null; 
  delete this.dom_; 
  goog.ui.Tooltip.superClass_.disposeInternal.call(this); 
}; 
goog.ui.Tooltip.CursorTooltipPosition = function(arg1, opt_arg2) { 
  goog.positioning.ViewportPosition.call(this, arg1, opt_arg2); 
}; 
goog.inherits(goog.ui.Tooltip.CursorTooltipPosition, goog.positioning.ViewportPosition); 
goog.ui.Tooltip.CursorTooltipPosition.prototype.reposition = function(element, popupCorner, opt_margin) { 
  var viewportElt = goog.style.getClientViewportElement(element); 
  var viewport = goog.style.getVisibleRectForElement(viewportElt); 
  var margin = opt_margin ? new goog.math.Box(opt_margin.top + 10, opt_margin.right, opt_margin.bottom, opt_margin.left + 10): new goog.math.Box(10, 0, 0, 10); 
  if(goog.positioning.positionAtCoordinate(this.coordinate, element, goog.positioning.Corner.TOP_START, margin, viewport, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.FAIL_Y) & goog.positioning.OverflowStatus.FAILED) { 
    goog.positioning.positionAtCoordinate(this.coordinate, element, goog.positioning.Corner.TOP_START, margin, viewport, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.ADJUST_Y); 
  } 
}; 
goog.ui.Tooltip.ElementTooltipPosition = function(element) { 
  goog.positioning.AnchoredPosition.call(this, element, goog.positioning.Corner.BOTTOM_RIGHT); 
}; 
goog.inherits(goog.ui.Tooltip.ElementTooltipPosition, goog.positioning.AnchoredPosition); 
goog.ui.Tooltip.ElementTooltipPosition.prototype.reposition = function(element, popupCorner, opt_margin) { 
  var offset = new goog.math.Coordinate(10, 0); 
  if(goog.positioning.positionAtAnchor(this.element, this.corner, element, popupCorner, offset, opt_margin, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.FAIL_Y) & goog.positioning.OverflowStatus.FAILED) { 
    goog.positioning.positionAtAnchor(this.element, goog.positioning.Corner.TOP_RIGHT, element, goog.positioning.Corner.BOTTOM_LEFT, offset, opt_margin, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.ADJUST_Y); 
  } 
}; 
