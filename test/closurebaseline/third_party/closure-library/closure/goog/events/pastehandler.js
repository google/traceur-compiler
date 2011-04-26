
goog.provide('goog.events.PasteHandler'); 
goog.provide('goog.events.PasteHandler.EventType'); 
goog.provide('goog.events.PasteHandler.State'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.events.PasteHandler = function(element) { 
  goog.events.EventTarget.call(this); 
  this.element_ = element; 
  this.oldValue_ = this.element_.value; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.lastTime_ = goog.now(); 
  if(goog.userAgent.WEBKIT || goog.userAgent.IE || goog.userAgent.GECKO && goog.userAgent.isVersion('1.9')) { 
    this.eventHandler_.listen(element, goog.events.EventType.PASTE, this.dispatch_); 
  } else { 
    var events =[goog.events.EventType.KEYDOWN, goog.events.EventType.BLUR, goog.events.EventType.FOCUS, goog.events.EventType.MOUSEOVER, 'input']; 
    this.eventHandler_.listen(element, events, this.handleEvent_); 
  } 
}; 
goog.inherits(goog.events.PasteHandler, goog.events.EventTarget); 
goog.events.PasteHandler.EventType = { PASTE: 'paste' }; 
goog.events.PasteHandler.MANDATORY_MS_BETWEEN_INPUT_EVENTS_TIE_BREAKER = 400; 
goog.events.PasteHandler.State = { 
  INIT: 'init', 
  FOCUSED: 'focused', 
  TYPING: 'typing' 
}; 
goog.events.PasteHandler.prototype.state_ = goog.events.PasteHandler.State.INIT; 
goog.events.PasteHandler.prototype.previousEvent_; 
goog.events.PasteHandler.prototype.logger_ = goog.debug.Logger.getLogger('goog.events.PasteHandler'); 
goog.events.PasteHandler.prototype.disposeInternal = function() { 
  goog.events.PasteHandler.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
}; 
goog.events.PasteHandler.prototype.getState = function() { 
  return this.state_; 
}; 
goog.events.PasteHandler.prototype.getEventHandler = function() { 
  return this.eventHandler_; 
}; 
goog.events.PasteHandler.prototype.dispatch_ = function(e) { 
  var event = new goog.events.BrowserEvent(e.getBrowserEvent()); 
  event.type = goog.events.PasteHandler.EventType.PASTE; 
  try { 
    this.dispatchEvent(event); 
  } finally { 
    event.dispose(); 
  } 
}; 
goog.events.PasteHandler.prototype.handleEvent_ = function(e) { 
  switch(this.state_) { 
    case goog.events.PasteHandler.State.INIT: 
      { 
        this.handleUnderInit_(e); 
        break; 
      } 

    case goog.events.PasteHandler.State.FOCUSED: 
      { 
        this.handleUnderFocused_(e); 
        break; 
      } 

    case goog.events.PasteHandler.State.TYPING: 
      { 
        this.handleUnderTyping_(e); 
        break; 
      } 

    default: 
      { 
        this.logger_.severe('invalid ' + this.state_ + ' state'); 
      } 

  } 
  this.lastTime_ = goog.now(); 
  this.oldValue_ = this.element_.value; 
  this.logger_.info(e.type + ' -> ' + this.state_); 
  this.previousEvent_ = e.type; 
}; 
goog.events.PasteHandler.prototype.handleUnderInit_ = function(e) { 
  switch(e.type) { 
    case goog.events.EventType.BLUR: 
      { 
        this.state_ = goog.events.PasteHandler.State.INIT; 
        break; 
      } 

    case goog.events.EventType.FOCUS: 
      { 
        this.state_ = goog.events.PasteHandler.State.FOCUSED; 
        break; 
      } 

    case goog.events.EventType.MOUSEOVER: 
      { 
        this.state_ = goog.events.PasteHandler.State.INIT; 
        if(this.element_.value != this.oldValue_) { 
          this.logger_.info('paste by dragdrop while on init!'); 
          this.dispatch_(e); 
        } 
        break; 
      } 

    default: 
      { 
        this.logger_.severe('unexpected event ' + e.type + 'during init'); 
      } 

  } 
}; 
goog.events.PasteHandler.prototype.handleUnderFocused_ = function(e) { 
  switch(e.type) { 
    case 'input': 
      { 
        var minimumMilisecondsBetweenInputEvents = this.lastTime_ + goog.events.PasteHandler.MANDATORY_MS_BETWEEN_INPUT_EVENTS_TIE_BREAKER; 
        if(goog.now() > minimumMilisecondsBetweenInputEvents || this.previousEvent_ == goog.events.EventType.FOCUS) { 
          this.logger_.info('paste by textchange while focused!'); 
          this.dispatch_(e); 
        } 
        break; 
      } 

    case goog.events.EventType.BLUR: 
      { 
        this.state_ = goog.events.PasteHandler.State.INIT; 
        break; 
      } 

    case goog.events.EventType.KEYDOWN: 
      { 
        this.logger_.info('key down ... looking for ctrl+v'); 
        if(goog.userAgent.MAC && goog.userAgent.OPERA && e.keyCode == 0 || goog.userAgent.MAC && goog.userAgent.OPERA && e.keyCode == 17) { 
          break; 
        } 
        this.state_ = goog.events.PasteHandler.State.TYPING; 
        break; 
      } 

    case goog.events.EventType.MOUSEOVER: 
      { 
        if(this.element_.value != this.oldValue_) { 
          this.logger_.info('paste by dragdrop while focused!'); 
          this.dispatch_(e); 
        } 
        break; 
      } 

    default: 
      { 
        this.logger_.severe('unexpected event ' + e.type + ' during focused'); 
      } 

  } 
}; 
goog.events.PasteHandler.prototype.handleUnderTyping_ = function(e) { 
  switch(e.type) { 
    case 'input': 
      { 
        this.state_ = goog.events.PasteHandler.State.FOCUSED; 
        break; 
      } 

    case goog.events.EventType.BLUR: 
      { 
        this.state_ = goog.events.PasteHandler.State.INIT; 
        break; 
      } 

    case goog.events.EventType.KEYDOWN: 
      { 
        if(e.ctrlKey && e.keyCode == goog.events.KeyCodes.V || e.shiftKey && e.keyCode == goog.events.KeyCodes.INSERT || e.metaKey && e.keyCode == goog.events.KeyCodes.V) { 
          this.logger_.info('paste by ctrl+v while keypressed!'); 
          this.dispatch_(e); 
        } 
        break; 
      } 

    case goog.events.EventType.MOUSEOVER: 
      { 
        if(this.element_.value != this.oldValue_) { 
          this.logger_.info('paste by dragdrop while keypressed!'); 
          this.dispatch_(e); 
        } 
        break; 
      } 

    default: 
      { 
        this.logger_.severe('unexpected event ' + e.type + ' during keypressed'); 
      } 

  } 
}; 
