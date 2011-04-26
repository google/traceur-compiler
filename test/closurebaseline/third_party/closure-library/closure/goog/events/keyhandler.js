
goog.provide('goog.events.KeyEvent'); 
goog.provide('goog.events.KeyHandler'); 
goog.provide('goog.events.KeyHandler.EventType'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.userAgent'); 
goog.events.KeyHandler = function(opt_element, opt_capture) { 
  goog.events.EventTarget.call(this); 
  if(opt_element) { 
    this.attach(opt_element, opt_capture); 
  } 
}; 
goog.inherits(goog.events.KeyHandler, goog.events.EventTarget); 
goog.events.KeyHandler.prototype.element_ = null; 
goog.events.KeyHandler.prototype.keyPressKey_ = null; 
goog.events.KeyHandler.prototype.keyDownKey_ = null; 
goog.events.KeyHandler.prototype.keyUpKey_ = null; 
goog.events.KeyHandler.prototype.lastKey_ = - 1; 
goog.events.KeyHandler.prototype.keyCode_ = - 1; 
goog.events.KeyHandler.EventType = { KEY: 'key' }; 
goog.events.KeyHandler.safariKey_ = { 
  '3': goog.events.KeyCodes.ENTER, 
  '12': goog.events.KeyCodes.NUMLOCK, 
  '63232': goog.events.KeyCodes.UP, 
  '63233': goog.events.KeyCodes.DOWN, 
  '63234': goog.events.KeyCodes.LEFT, 
  '63235': goog.events.KeyCodes.RIGHT, 
  '63236': goog.events.KeyCodes.F1, 
  '63237': goog.events.KeyCodes.F2, 
  '63238': goog.events.KeyCodes.F3, 
  '63239': goog.events.KeyCodes.F4, 
  '63240': goog.events.KeyCodes.F5, 
  '63241': goog.events.KeyCodes.F6, 
  '63242': goog.events.KeyCodes.F7, 
  '63243': goog.events.KeyCodes.F8, 
  '63244': goog.events.KeyCodes.F9, 
  '63245': goog.events.KeyCodes.F10, 
  '63246': goog.events.KeyCodes.F11, 
  '63247': goog.events.KeyCodes.F12, 
  '63248': goog.events.KeyCodes.PRINT_SCREEN, 
  '63272': goog.events.KeyCodes.DELETE, 
  '63273': goog.events.KeyCodes.HOME, 
  '63275': goog.events.KeyCodes.END, 
  '63276': goog.events.KeyCodes.PAGE_UP, 
  '63277': goog.events.KeyCodes.PAGE_DOWN, 
  '63289': goog.events.KeyCodes.NUMLOCK, 
  '63302': goog.events.KeyCodes.INSERT 
}; 
goog.events.KeyHandler.keyIdentifier_ = { 
  'Up': goog.events.KeyCodes.UP, 
  'Down': goog.events.KeyCodes.DOWN, 
  'Left': goog.events.KeyCodes.LEFT, 
  'Right': goog.events.KeyCodes.RIGHT, 
  'Enter': goog.events.KeyCodes.ENTER, 
  'F1': goog.events.KeyCodes.F1, 
  'F2': goog.events.KeyCodes.F2, 
  'F3': goog.events.KeyCodes.F3, 
  'F4': goog.events.KeyCodes.F4, 
  'F5': goog.events.KeyCodes.F5, 
  'F6': goog.events.KeyCodes.F6, 
  'F7': goog.events.KeyCodes.F7, 
  'F8': goog.events.KeyCodes.F8, 
  'F9': goog.events.KeyCodes.F9, 
  'F10': goog.events.KeyCodes.F10, 
  'F11': goog.events.KeyCodes.F11, 
  'F12': goog.events.KeyCodes.F12, 
  'U+007F': goog.events.KeyCodes.DELETE, 
  'Home': goog.events.KeyCodes.HOME, 
  'End': goog.events.KeyCodes.END, 
  'PageUp': goog.events.KeyCodes.PAGE_UP, 
  'PageDown': goog.events.KeyCodes.PAGE_DOWN, 
  'Insert': goog.events.KeyCodes.INSERT 
}; 
goog.events.KeyHandler.mozKeyCodeToKeyCodeMap_ = { 
  61: 187, 
  59: 186 
}; 
goog.events.KeyHandler.USES_KEYDOWN_ = goog.userAgent.IE || goog.userAgent.WEBKIT && goog.userAgent.isVersion('525'); 
goog.events.KeyHandler.prototype.handleKeyDown_ = function(e) { 
  if(goog.userAgent.WEBKIT &&(this.lastKey_ == goog.events.KeyCodes.CTRL && ! e.ctrlKey || this.lastKey_ == goog.events.KeyCodes.ALT && ! e.altKey)) { 
    this.lastKey_ = - 1; 
    this.keyCode_ = - 1; 
  } 
  if(goog.events.KeyHandler.USES_KEYDOWN_ && ! goog.events.KeyCodes.firesKeyPressEvent(e.keyCode, this.lastKey_, e.shiftKey, e.ctrlKey, e.altKey)) { 
    this.handleEvent(e); 
  } else { 
    if(goog.userAgent.GECKO && e.keyCode in goog.events.KeyHandler.mozKeyCodeToKeyCodeMap_) { 
      this.keyCode_ = goog.events.KeyHandler.mozKeyCodeToKeyCodeMap_[e.keyCode]; 
    } else { 
      this.keyCode_ = e.keyCode; 
    } 
  } 
}; 
goog.events.KeyHandler.prototype.handleKeyup_ = function(e) { 
  this.lastKey_ = - 1; 
  this.keyCode_ = - 1; 
}; 
goog.events.KeyHandler.prototype.handleEvent = function(e) { 
  var be = e.getBrowserEvent(); 
  var keyCode, charCode; 
  if(goog.userAgent.IE && e.type == goog.events.EventType.KEYPRESS) { 
    keyCode = this.keyCode_; 
    charCode = keyCode != goog.events.KeyCodes.ENTER && keyCode != goog.events.KeyCodes.ESC ? be.keyCode: 0; 
  } else if(goog.userAgent.WEBKIT && e.type == goog.events.EventType.KEYPRESS) { 
    keyCode = this.keyCode_; 
    charCode = be.charCode >= 0 && be.charCode < 63232 && goog.events.KeyCodes.isCharacterKey(keyCode) ? be.charCode: 0; 
  } else if(goog.userAgent.OPERA) { 
    keyCode = this.keyCode_; 
    charCode = goog.events.KeyCodes.isCharacterKey(keyCode) ? be.keyCode: 0; 
  } else { 
    keyCode = be.keyCode || this.keyCode_; 
    charCode = be.charCode || 0; 
    if(goog.userAgent.MAC && charCode == goog.events.KeyCodes.QUESTION_MARK && ! keyCode) { 
      keyCode = goog.events.KeyCodes.SLASH; 
    } 
  } 
  var key = keyCode; 
  var keyIdentifier = be.keyIdentifier; 
  if(keyCode) { 
    if(keyCode >= 63232 && keyCode in goog.events.KeyHandler.safariKey_) { 
      key = goog.events.KeyHandler.safariKey_[keyCode]; 
    } else { 
      if(keyCode == 25 && e.shiftKey) { 
        key = 9; 
      } 
    } 
  } else if(keyIdentifier && keyIdentifier in goog.events.KeyHandler.keyIdentifier_) { 
    key = goog.events.KeyHandler.keyIdentifier_[keyIdentifier]; 
  } 
  var repeat = key == this.lastKey_; 
  this.lastKey_ = key; 
  var event = new goog.events.KeyEvent(key, charCode, repeat, be); 
  try { 
    this.dispatchEvent(event); 
  } finally { 
    event.dispose(); 
  } 
}; 
goog.events.KeyHandler.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.events.KeyHandler.prototype.attach = function(element, opt_capture) { 
  if(this.keyUpKey_) { 
    this.detach(); 
  } 
  this.element_ = element; 
  this.keyPressKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYPRESS, this, opt_capture); 
  this.keyDownKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYDOWN, this.handleKeyDown_, opt_capture, this); 
  this.keyUpKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYUP, this.handleKeyup_, opt_capture, this); 
}; 
goog.events.KeyHandler.prototype.detach = function() { 
  if(this.keyPressKey_) { 
    goog.events.unlistenByKey(this.keyPressKey_); 
    goog.events.unlistenByKey(this.keyDownKey_); 
    goog.events.unlistenByKey(this.keyUpKey_); 
    this.keyPressKey_ = null; 
    this.keyDownKey_ = null; 
    this.keyUpKey_ = null; 
  } 
  this.element_ = null; 
  this.lastKey_ = - 1; 
  this.keyCode_ = - 1; 
}; 
goog.events.KeyHandler.prototype.disposeInternal = function() { 
  goog.events.KeyHandler.superClass_.disposeInternal.call(this); 
  this.detach(); 
}; 
goog.events.KeyEvent = function(keyCode, charCode, repeat, browserEvent) { 
  goog.events.BrowserEvent.call(this, browserEvent); 
  this.type = goog.events.KeyHandler.EventType.KEY; 
  this.keyCode = keyCode; 
  this.charCode = charCode; 
  this.repeat = repeat; 
}; 
goog.inherits(goog.events.KeyEvent, goog.events.BrowserEvent); 
