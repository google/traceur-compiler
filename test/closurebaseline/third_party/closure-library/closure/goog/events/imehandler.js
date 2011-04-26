
goog.provide('goog.events.ImeHandler'); 
goog.provide('goog.events.ImeHandler.Event'); 
goog.provide('goog.events.ImeHandler.EventType'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.userAgent'); 
goog.require('goog.userAgent.product'); 
goog.events.ImeHandler = function(el) { 
  goog.base(this); 
  this.el_ = el; 
  this.keyUpHandler_ = new goog.events.EventHandler(this); 
  this.handler_ = new goog.events.EventHandler(this); 
  if(goog.events.ImeHandler.USES_COMPOSITION_EVENTS) { 
    this.handler_.listen(el, 'compositionstart', this.handleCompositionStart_).listen(el, 'compositionend', this.handleCompositionEnd_).listen(el, 'compositionupdate', this.handleTextModifyingInput_); 
  } 
  this.handler_.listen(el, 'textInput', this.handleTextInput_).listen(el, 'text', this.handleTextModifyingInput_).listen(el, goog.events.EventType.KEYDOWN, this.handleKeyDown_); 
}; 
goog.inherits(goog.events.ImeHandler, goog.events.EventTarget); 
goog.events.ImeHandler.EventType = { 
  START: 'startIme', 
  UPDATE: 'updateIme', 
  END: 'endIme' 
}; 
goog.events.ImeHandler.Event = function(type, reason) { 
  goog.base(this, type); 
  this.reason = reason; 
}; 
goog.inherits(goog.events.ImeHandler.Event, goog.events.Event); 
goog.events.ImeHandler.USES_COMPOSITION_EVENTS = goog.userAgent.GECKO || goog.userAgent.product.CHROME; 
goog.events.ImeHandler.prototype.imeMode_ = false; 
goog.events.ImeHandler.prototype.lastKeyCode_ = 0; 
goog.events.ImeHandler.prototype.isImeMode = function() { 
  return this.imeMode_; 
}; 
goog.events.ImeHandler.prototype.handleCompositionStart_ = function(e) { 
  this.handleImeActivate_(e); 
}; 
goog.events.ImeHandler.prototype.handleCompositionEnd_ = function(e) { 
  this.handleImeDeactivate_(e); 
}; 
goog.events.ImeHandler.prototype.handleTextModifyingInput_ = function(e) { 
  if(this.isImeMode()) { 
    this.processImeComposition_(e); 
  } 
}; 
goog.events.ImeHandler.prototype.handleImeActivate_ = function(e) { 
  if(this.imeMode_) { 
    return; 
  } 
  if(goog.userAgent.product.SAFARI) { 
    this.keyUpHandler_.listen(this.el_, goog.events.EventType.KEYUP, this.handleKeyUpSafari4_); 
  } 
  this.imeMode_ = true; 
  this.dispatchEvent(new goog.events.ImeHandler.Event(goog.events.ImeHandler.EventType.START, e)); 
}; 
goog.events.ImeHandler.prototype.processImeComposition_ = function(e) { 
  this.dispatchEvent(new goog.events.ImeHandler.Event(goog.events.ImeHandler.EventType.UPDATE, e)); 
}; 
goog.events.ImeHandler.prototype.handleImeDeactivate_ = function(e) { 
  this.imeMode_ = false; 
  this.keyUpHandler_.removeAll(); 
  this.dispatchEvent(new goog.events.ImeHandler.Event(goog.events.ImeHandler.EventType.END, e)); 
}; 
goog.events.ImeHandler.prototype.handleKeyDown_ = function(e) { 
  if(! goog.events.ImeHandler.USES_COMPOSITION_EVENTS) { 
    var imeMode = this.isImeMode(); 
    if(! imeMode && e.keyCode == goog.events.KeyCodes.WIN_IME) { 
      this.handleImeActivate_(e); 
    } else if(imeMode && e.keyCode != goog.events.KeyCodes.WIN_IME) { 
      if(goog.events.ImeHandler.isImeDeactivateKeyEvent_(e)) { 
        this.handleImeDeactivate_(e); 
      } 
    } else if(imeMode) { 
      this.processImeComposition_(e); 
    } 
  } 
  if(goog.events.ImeHandler.isImeDeactivateKeyEvent_(e)) { 
    this.lastKeyCode_ = e.keyCode; 
  } 
}; 
goog.events.ImeHandler.prototype.handleTextInput_ = function(e) { 
  if(! goog.events.ImeHandler.USES_COMPOSITION_EVENTS && goog.userAgent.WEBKIT && this.lastKeyCode_ == goog.events.KeyCodes.WIN_IME && this.isImeMode()) { 
    this.handleImeDeactivate_(e); 
  } 
}; 
goog.events.ImeHandler.prototype.handleKeyUpSafari4_ = function(e) { 
  if(this.isImeMode()) { 
    switch(e.keyCode) { 
      case goog.events.KeyCodes.ENTER: 
      case goog.events.KeyCodes.TAB: 
      case goog.events.KeyCodes.ESC: 
        this.handleImeDeactivate_(e); 
        break; 

    } 
  } 
}; 
goog.events.ImeHandler.isImeDeactivateKeyEvent_ = function(e) { 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.SHIFT: 
    case goog.events.KeyCodes.CTRL: 
      return false; 

    default: 
      return true; 

  } 
}; 
goog.events.ImeHandler.prototype.disposeInternal = function() { 
  this.handler_.dispose(); 
  this.keyUpHandler_.dispose(); 
  this.el_ = null; 
  goog.base(this, 'disposeInternal'); 
}; 
