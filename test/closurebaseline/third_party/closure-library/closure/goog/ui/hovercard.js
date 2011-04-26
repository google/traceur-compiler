
goog.provide('goog.ui.HoverCard'); 
goog.provide('goog.ui.HoverCard.EventType'); 
goog.provide('goog.ui.HoverCard.TriggerEvent'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.AdvancedTooltip'); 
goog.ui.HoverCard = function(isAnchor, opt_checkDescendants, opt_domHelper) { 
  goog.ui.AdvancedTooltip.call(this, null, null, opt_domHelper); 
  if(goog.isFunction(isAnchor)) { 
    this.isAnchor_ = isAnchor; 
  } else { 
    this.anchors_ = isAnchor; 
  } 
  this.checkDescendants_ = opt_checkDescendants != false; 
  this.tempAttachedAnchors_ =[]; 
  this.document_ = opt_domHelper ? opt_domHelper.getDocument(): goog.dom.getDocument(); 
  goog.events.listen(this.document_, goog.events.EventType.MOUSEOVER, this.handleTriggerMouseOver_, false, this); 
}; 
goog.inherits(goog.ui.HoverCard, goog.ui.AdvancedTooltip); 
goog.ui.HoverCard.EventType = { 
  TRIGGER: 'trigger', 
  CANCEL_TRIGGER: 'canceltrigger', 
  BEFORE_SHOW: goog.ui.PopupBase.EventType.BEFORE_SHOW, 
  SHOW: goog.ui.PopupBase.EventType.SHOW, 
  BEFORE_HIDE: goog.ui.PopupBase.EventType.BEFORE_HIDE, 
  HIDE: goog.ui.PopupBase.EventType.HIDE 
}; 
goog.ui.HoverCard.prototype.disposeInternal = function() { 
  goog.ui.HoverCard.superClass_.disposeInternal.call(this); 
  goog.events.unlisten(this.document_, goog.events.EventType.MOUSEOVER, this.handleTriggerMouseOver_, false, this); 
}; 
goog.ui.HoverCard.prototype.currentAnchor_; 
goog.ui.HoverCard.prototype.maxSearchSteps_; 
goog.ui.HoverCard.prototype.isAnchor_ = function(element) { 
  return element.tagName in this.anchors_ && ! ! element.getAttribute(this.anchors_[element.tagName]); 
}; 
goog.ui.HoverCard.prototype.handleTriggerMouseOver_ = function(e) { 
  var target =(e.target); 
  if(! target) { 
    return; 
  } 
  if(this.isAnchor_(target)) { 
    this.setPosition(null); 
    this.triggerForElement(target); 
  } else if(this.checkDescendants_) { 
    var trigger = goog.dom.getAncestor(target, goog.bind(this.isAnchor_, this), false, this.maxSearchSteps_); 
    if(trigger) { 
      this.triggerForElement((trigger)); 
    } 
  } 
}; 
goog.ui.HoverCard.prototype.triggerForElement = function(anchorElement, opt_pos, opt_data) { 
  if(anchorElement == this.currentAnchor_) { 
    this.clearHideTimer(); 
    return; 
  } 
  if(anchorElement == this.anchor) { 
    return; 
  } 
  this.maybeCancelTrigger_(); 
  var triggerEvent = new goog.ui.HoverCard.TriggerEvent(goog.ui.HoverCard.EventType.TRIGGER, this, anchorElement, opt_data); 
  if(! this.getElements().contains(anchorElement)) { 
    this.attach(anchorElement); 
    this.tempAttachedAnchors_.push(anchorElement); 
  } 
  this.anchor = anchorElement; 
  if(! this.onTrigger(triggerEvent)) { 
    this.onCancelTrigger(); 
    return; 
  } 
  var pos = opt_pos || this.position_; 
  this.startShowTimer(anchorElement,(pos)); 
}; 
goog.ui.HoverCard.prototype.setCurrentAnchor_ = function(anchor) { 
  if(anchor != this.currentAnchor_) { 
    this.detachTempAnchor_(this.currentAnchor_); 
  } 
  this.currentAnchor_ = anchor; 
}; 
goog.ui.HoverCard.prototype.detachTempAnchor_ = function(anchor) { 
  var pos = goog.array.indexOf(this.tempAttachedAnchors_, anchor); 
  if(pos != - 1) { 
    this.detach(anchor); 
    this.tempAttachedAnchors_.splice(pos, 1); 
  } 
}; 
goog.ui.HoverCard.prototype.onTrigger = function(triggerEvent) { 
  return this.dispatchEvent(triggerEvent); 
}; 
goog.ui.HoverCard.prototype.cancelTrigger = function() { 
  this.clearShowTimer(); 
  this.onCancelTrigger(); 
}; 
goog.ui.HoverCard.prototype.maybeCancelTrigger_ = function() { 
  if(this.getState() == goog.ui.Tooltip.State.WAITING_TO_SHOW || this.getState() == goog.ui.Tooltip.State.UPDATING) { 
    this.cancelTrigger(); 
  } 
}; 
goog.ui.HoverCard.prototype.onCancelTrigger = function() { 
  var event = new goog.ui.HoverCard.TriggerEvent(goog.ui.HoverCard.EventType.CANCEL_TRIGGER, this, this.anchor || null); 
  this.dispatchEvent(event); 
  this.detachTempAnchor_(this.anchor); 
  delete this.anchor; 
}; 
goog.ui.HoverCard.prototype.getAnchorElement = function() { 
  return(this.currentAnchor_ || this.anchor); 
}; 
goog.ui.HoverCard.prototype.onHide_ = function() { 
  goog.ui.HoverCard.superClass_.onHide_.call(this); 
  this.setCurrentAnchor_(null); 
}; 
goog.ui.HoverCard.prototype.handleMouseOver = function(event) { 
  var trigger = this.getAnchorFromElement((event.target)); 
  if(trigger && trigger != this.anchor) { 
    this.triggerForElement(trigger); 
    return; 
  } 
  goog.ui.HoverCard.superClass_.handleMouseOver.call(this, event); 
}; 
goog.ui.HoverCard.prototype.handleMouseOutAndBlur = function(event) { 
  var anchor = this.anchor; 
  var state = this.getState(); 
  goog.ui.HoverCard.superClass_.handleMouseOutAndBlur.call(this, event); 
  if(state != this.getState() &&(state == goog.ui.Tooltip.State.WAITING_TO_SHOW || state == goog.ui.Tooltip.State.UPDATING)) { 
    this.anchor = anchor; 
    this.onCancelTrigger(); 
  } 
}; 
goog.ui.HoverCard.prototype.maybeShow = function(el, opt_pos) { 
  goog.ui.HoverCard.superClass_.maybeShow.call(this, el, opt_pos); 
  if(! this.isVisible()) { 
    this.cancelTrigger(); 
  } else { 
    this.setCurrentAnchor_(el); 
  } 
}; 
goog.ui.HoverCard.prototype.setMaxSearchSteps = function(maxSearchSteps) { 
  if(! maxSearchSteps) { 
    this.checkDescendants_ = false; 
  } else if(this.checkDescendants_) { 
    this.maxSearchSteps_ = maxSearchSteps; 
  } 
}; 
goog.ui.HoverCard.TriggerEvent = function(type, target, anchor, opt_data) { 
  goog.events.Event.call(this, type, target); 
  this.anchor = anchor; 
  this.data = opt_data; 
}; 
goog.inherits(goog.ui.HoverCard.TriggerEvent, goog.events.Event); 
