
goog.provide('goog.events.InputHandler'); 
goog.provide('goog.events.InputHandler.EventType'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.userAgent'); 
goog.events.InputHandler = function(element) { 
  goog.events.EventTarget.call(this); 
  this.element_ = element; 
  this.inputEventEmulation_ = goog.userAgent.IE ||(goog.userAgent.WEBKIT && ! goog.userAgent.isVersion('531') && element.tagName == 'TEXTAREA'); 
  this.eventHandler_ = new goog.events.EventHandler(); 
  this.eventHandler_.listen(this.element_, this.inputEventEmulation_ ?['keydown', 'paste', 'cut', 'drop']: 'input', this); 
}; 
goog.inherits(goog.events.InputHandler, goog.events.EventTarget); 
goog.events.InputHandler.EventType = { INPUT: 'input' }; 
goog.events.InputHandler.prototype.timer_ = null; 
goog.events.InputHandler.prototype.handleEvent = function(e) { 
  if(this.inputEventEmulation_) { 
    if(e.type == 'keydown' && ! goog.events.KeyCodes.isTextModifyingKeyEvent(e)) { 
      return; 
    } 
    var valueBeforeKey = e.type == 'keydown' ? this.element_.value: null; 
    if(goog.userAgent.IE && e.keyCode == goog.events.KeyCodes.WIN_IME) { 
      valueBeforeKey = null; 
    } 
    var inputEvent = this.createInputEvent_(e); 
    this.cancelTimerIfSet_(); 
    this.timer_ = goog.Timer.callOnce(function() { 
      this.timer_ = null; 
      if(this.element_.value != valueBeforeKey) { 
        this.dispatchAndDisposeEvent_(inputEvent); 
      } 
    }, 0, this); 
  } else { 
    if(! goog.userAgent.OPERA || this.element_ == goog.dom.getOwnerDocument(this.element_).activeElement) { 
      this.dispatchAndDisposeEvent_(this.createInputEvent_(e)); 
    } 
  } 
}; 
goog.events.InputHandler.prototype.cancelTimerIfSet_ = function() { 
  if(this.timer_ != null) { 
    goog.Timer.clear(this.timer_); 
    this.timer_ = null; 
  } 
}; 
goog.events.InputHandler.prototype.createInputEvent_ = function(be) { 
  var e = new goog.events.BrowserEvent(be.getBrowserEvent()); 
  e.type = goog.events.InputHandler.EventType.INPUT; 
  return e; 
}; 
goog.events.InputHandler.prototype.dispatchAndDisposeEvent_ = function(event) { 
  try { 
    this.dispatchEvent(event); 
  } finally { 
    event.dispose(); 
  } 
}; 
goog.events.InputHandler.prototype.disposeInternal = function() { 
  goog.events.InputHandler.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.cancelTimerIfSet_(); 
  delete this.element_; 
}; 
