
goog.provide('goog.events.ActionEvent'); 
goog.provide('goog.events.ActionHandler'); 
goog.provide('goog.events.ActionHandler.EventType'); 
goog.provide('goog.events.BeforeActionEvent'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.userAgent'); 
goog.events.ActionHandler = function(element) { 
  goog.events.EventTarget.call(this); 
  this.element_ = element; 
  goog.events.listen(element, goog.events.ActionHandler.KEY_EVENT_TYPE_, this.handleKeyDown_, false, this); 
  goog.events.listen(element, goog.events.EventType.CLICK, this.handleClick_, false, this); 
}; 
goog.inherits(goog.events.ActionHandler, goog.events.EventTarget); 
goog.events.ActionHandler.EventType = { 
  ACTION: 'action', 
  BEFOREACTION: 'beforeaction' 
}; 
goog.events.ActionHandler.KEY_EVENT_TYPE_ = goog.userAgent.GECKO ? goog.events.EventType.KEYPRESS: goog.events.EventType.KEYDOWN; 
goog.events.ActionHandler.prototype.handleKeyDown_ = function(e) { 
  if(e.keyCode == goog.events.KeyCodes.ENTER || goog.userAgent.WEBKIT && e.keyCode == goog.events.KeyCodes.MAC_ENTER) { 
    this.dispatchEvents_(e); 
  } 
}; 
goog.events.ActionHandler.prototype.handleClick_ = function(e) { 
  this.dispatchEvents_(e); 
}; 
goog.events.ActionHandler.prototype.dispatchEvents_ = function(e) { 
  var beforeActionEvent = new goog.events.BeforeActionEvent(e); 
  try { 
    if(! this.dispatchEvent(beforeActionEvent)) { 
      return; 
    } 
  } finally { 
    beforeActionEvent.dispose(); 
  } 
  var actionEvent = new goog.events.ActionEvent(e); 
  try { 
    this.dispatchEvent(actionEvent); 
  } finally { 
    actionEvent.dispose(); 
    e.stopPropagation(); 
  } 
}; 
goog.events.ActionHandler.prototype.disposeInternal = function() { 
  goog.events.ActionHandler.superClass_.disposeInternal.call(this); 
  goog.events.unlisten(this.element_, goog.events.ActionHandler.KEY_EVENT_TYPE_, this.handleKeyDown_, false, this); 
  goog.events.unlisten(this.element_, goog.events.EventType.CLICK, this.handleClick_, false, this); 
  delete this.element_; 
}; 
goog.events.ActionEvent = function(browserEvent) { 
  goog.events.BrowserEvent.call(this, browserEvent.getBrowserEvent()); 
  this.type = goog.events.ActionHandler.EventType.ACTION; 
}; 
goog.inherits(goog.events.ActionEvent, goog.events.BrowserEvent); 
goog.events.BeforeActionEvent = function(browserEvent) { 
  goog.events.BrowserEvent.call(this, browserEvent.getBrowserEvent()); 
  this.type = goog.events.ActionHandler.EventType.BEFOREACTION; 
}; 
goog.inherits(goog.events.BeforeActionEvent, goog.events.BrowserEvent); 
