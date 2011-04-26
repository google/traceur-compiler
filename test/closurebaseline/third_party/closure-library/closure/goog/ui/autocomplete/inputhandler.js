
goog.provide('goog.ui.AutoComplete.InputHandler'); 
goog.require('goog.Disposable'); 
goog.require('goog.Timer'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.selection'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.string'); 
goog.require('goog.ui.AutoComplete'); 
goog.ui.AutoComplete.InputHandler = function(opt_separators, opt_literals, opt_multi, opt_throttleTime) { 
  goog.Disposable.call(this); 
  var throttleTime = opt_throttleTime || 150; 
  this.setSeparators(goog.isDefAndNotNull(opt_separators) ? opt_separators: goog.ui.AutoComplete.InputHandler.STANDARD_LIST_SEPARATORS); 
  this.literals_ = opt_literals || ''; 
  this.multi_ = opt_multi != null ? opt_multi: true; 
  this.preventDefaultOnTab_ = this.multi_; 
  this.timer_ = throttleTime > 0 ? new goog.Timer(throttleTime): null; 
  this.eh_ = new goog.events.EventHandler(this); 
  this.activateHandler_ = new goog.events.EventHandler(this); 
  this.keyHandler_ = new goog.events.KeyHandler(); 
  this.lastKeyCode_ = - 1; 
}; 
goog.inherits(goog.ui.AutoComplete.InputHandler, goog.Disposable); 
goog.ui.AutoComplete.InputHandler.STANDARD_LIST_SEPARATORS = ',;'; 
goog.ui.AutoComplete.InputHandler.QUOTE_LITERALS = '"'; 
goog.ui.AutoComplete.InputHandler.prototype.ac_; 
goog.ui.AutoComplete.InputHandler.prototype.separators_; 
goog.ui.AutoComplete.InputHandler.prototype.defaultSeparator_; 
goog.ui.AutoComplete.InputHandler.prototype.trimmer_; 
goog.ui.AutoComplete.InputHandler.prototype.separatorCheck_; 
goog.ui.AutoComplete.InputHandler.prototype.whitespaceWrapEntries_ = true; 
goog.ui.AutoComplete.InputHandler.prototype.generateNewTokenOnLiteral_ = true; 
goog.ui.AutoComplete.InputHandler.prototype.upsideDown_ = false; 
goog.ui.AutoComplete.InputHandler.prototype.separatorUpdates_ = true; 
goog.ui.AutoComplete.InputHandler.prototype.separatorSelects_ = true; 
goog.ui.AutoComplete.InputHandler.prototype.activeElement_ = null; 
goog.ui.AutoComplete.InputHandler.prototype.lastValue_ = ''; 
goog.ui.AutoComplete.InputHandler.prototype.waitingForIme_ = false; 
goog.ui.AutoComplete.InputHandler.prototype.rowJustSelected_ = false; 
goog.ui.AutoComplete.InputHandler.prototype.updateDuringTyping_ = true; 
goog.ui.AutoComplete.InputHandler.prototype.attachAutoComplete = function(ac) { 
  this.ac_ = ac; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getAutoComplete = function() { 
  return this.ac_; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getActiveElement = function() { 
  return this.activeElement_; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getValue = function() { 
  return this.activeElement_.value; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setValue = function(value) { 
  this.activeElement_.value = value; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getCursorPosition = function() { 
  return goog.dom.selection.getStart(this.activeElement_); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setCursorPosition = function(pos) { 
  goog.dom.selection.setStart(this.activeElement_, pos); 
  goog.dom.selection.setEnd(this.activeElement_, pos); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.attachInput = function(el) { 
  goog.dom.a11y.setState(el, 'haspopup', true); 
  this.eh_.listen(el, goog.events.EventType.FOCUS, this.handleFocus); 
  this.eh_.listen(el, goog.events.EventType.BLUR, this.handleBlur); 
  if(! this.activeElement_) { 
    this.activateHandler_.listen(el, goog.events.EventType.KEYDOWN, this.onKeyDownOnInactiveElement_); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.detachInput = function(el) { 
  if(el == this.activeElement_) { 
    this.handleBlur(); 
  } 
  this.eh_.unlisten(el, goog.events.EventType.FOCUS, this.handleFocus); 
  this.eh_.unlisten(el, goog.events.EventType.BLUR, this.handleBlur); 
  if(! this.activeElement_) { 
    this.activateHandler_.unlisten(el, goog.events.EventType.KEYDOWN, this.onKeyDownOnInactiveElement_); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.attachInputs = function(var_args) { 
  for(var i = 0; i < arguments.length; i ++) { 
    this.attachInput(arguments[i]); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.detachInputs = function(var_args) { 
  for(var i = 0; i < arguments.length; i ++) { 
    this.detachInput(arguments[i]); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.selectRow = function(row, opt_multi) { 
  this.setTokenText(row.toString(), opt_multi); 
  return false; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setTokenText = function(tokenText, opt_multi) { 
  if(goog.isDef(opt_multi) ? opt_multi: this.multi_) { 
    var index = this.getTokenIndex_(this.getValue(), this.getCursorPosition()); 
    var entries = this.splitInput_(this.getValue()); 
    var replaceValue = tokenText; 
    if(! this.separatorCheck_.test(replaceValue)) { 
      replaceValue = goog.string.trimRight(replaceValue) + this.defaultSeparator_; 
    } 
    if(this.whitespaceWrapEntries_) { 
      if(index != 0 && ! goog.string.isEmpty(entries[index - 1])) { 
        replaceValue = ' ' + replaceValue; 
      } 
      if(index == entries.length - 1) { 
        replaceValue = replaceValue + ' '; 
      } 
    } 
    if(replaceValue != entries[index]) { 
      entries[index]= replaceValue; 
      var el = this.activeElement_; 
      if(goog.userAgent.GECKO) { 
        el.blur(); 
      } 
      el.value = entries.join(''); 
      var pos = 0; 
      for(var i = 0; i <= index; i ++) { 
        pos += entries[i].length; 
      } 
      el.focus(); 
      this.setCursorPosition(pos); 
    } 
  } else { 
    this.setValue(tokenText); 
  } 
  this.rowJustSelected_ = true; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.disposeInternal = function() { 
  goog.ui.AutoComplete.InputHandler.superClass_.disposeInternal.call(this); 
  this.eh_.dispose(); 
  delete this.eh_; 
  this.activateHandler_.dispose(); 
  this.keyHandler_.dispose(); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setSeparators = function(separators) { 
  this.separators_ = separators; 
  this.defaultSeparator_ = this.separators_.substring(0, 1); 
  var wspaceExp = this.multi_ ? '[\\s' + this.separators_ + ']+': '[\\s]+'; 
  this.trimmer_ = new RegExp('^' + wspaceExp + '|' + wspaceExp + '$', 'g'); 
  this.separatorCheck_ = new RegExp('\\s*[' + this.separators_ + ']$'); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setUpsideDown = function(upsideDown) { 
  this.upsideDown_ = upsideDown; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setWhitespaceWrapEntries = function(newValue) { 
  this.whitespaceWrapEntries_ = newValue; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setGenerateNewTokenOnLiteral = function(newValue) { 
  this.generateNewTokenOnLiteral_ = newValue; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setTrimmingRegExp = function(trimmer) { 
  this.trimmer_ = trimmer; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setPreventDefaultOnTab = function(newValue) { 
  this.preventDefaultOnTab_ = newValue; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setSeparatorCompletes = function(newValue) { 
  this.separatorUpdates_ = newValue; 
  this.separatorSelects_ = newValue; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setSeparatorSelects = function(newValue) { 
  this.separatorSelects_ = newValue; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getThrottleTime = function() { 
  return this.timer_ ? this.timer_.getInterval(): - 1; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setRowJustSelected = function(justSelected) { 
  this.rowJustSelected_ = justSelected; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setThrottleTime = function(time) { 
  if(time < 0) { 
    this.timer_.dispose(); 
    this.timer_ = null; 
    return; 
  } 
  if(this.timer_) { 
    this.timer_.setInterval(time); 
  } else { 
    this.timer_ = new goog.Timer(time); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getUpdateDuringTyping = function() { 
  return this.updateDuringTyping_; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.setUpdateDuringTyping = function(value) { 
  this.updateDuringTyping_ = value; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.handleKeyEvent = function(e) { 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.DOWN: 
      if(this.ac_.isOpen()) { 
        this.moveDown_(); 
        e.preventDefault(); 
        return true; 
      } else if(! this.multi_) { 
        this.update(true); 
        e.preventDefault(); 
        return true; 
      } 
      break; 

    case goog.events.KeyCodes.UP: 
      if(this.ac_.isOpen()) { 
        this.moveUp_(); 
        e.preventDefault(); 
        return true; 
      } 
      break; 

    case goog.events.KeyCodes.TAB: 
      if(this.ac_.isOpen() && ! e.shiftKey) { 
        this.update(); 
        if(this.ac_.selectHilited() && this.preventDefaultOnTab_) { 
          e.preventDefault(); 
          return true; 
        } 
      } else { 
        this.ac_.dismiss(); 
      } 
      break; 

    case goog.events.KeyCodes.ENTER: 
      if(this.ac_.isOpen()) { 
        this.update(); 
        if(this.ac_.selectHilited()) { 
          e.preventDefault(); 
          e.stopPropagation(); 
          return true; 
        } 
      } else { 
        this.ac_.dismiss(); 
      } 
      break; 

    case goog.events.KeyCodes.ESC: 
      if(this.ac_.isOpen()) { 
        this.ac_.dismiss(); 
        e.preventDefault(); 
        e.stopPropagation(); 
        return true; 
      } 
      break; 

    case goog.events.KeyCodes.WIN_IME: 
      if(! this.waitingForIme_) { 
        this.startWaitingForIme_(); 
        return true; 
      } 
      break; 

    default: 
      if(this.timer_ && ! this.updateDuringTyping_) { 
        this.timer_.stop(); 
        this.timer_.start(); 
      } 

  } 
  return this.handleSeparator_(e); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.handleSeparator_ = function(e) { 
  var isSeparatorKey = this.multi_ && e.charCode && this.separators_.indexOf(String.fromCharCode(e.charCode)) != - 1; 
  if(this.separatorUpdates_ && isSeparatorKey) { 
    this.update(); 
  } 
  if(this.separatorSelects_ && isSeparatorKey) { 
    if(this.ac_.selectHilited()) { 
      e.preventDefault(); 
      return true; 
    } 
  } 
  return false; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.needKeyUpListener = function() { 
  return false; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.handleKeyUp = function(e) { 
  return false; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.addKeyEvents_ = function() { 
  this.keyHandler_.attach(this.activeElement_); 
  this.eh_.listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKey_); 
  if(this.needKeyUpListener()) { 
    this.eh_.listen(this.activeElement_, goog.events.EventType.KEYUP, this.handleKeyUp); 
  } 
  if(goog.userAgent.IE) { 
    this.eh_.listen(this.activeElement_, goog.events.EventType.KEYPRESS, this.onIeKeyPress_); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.removeKeyEvents_ = function() { 
  this.eh_.unlisten(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKey_); 
  this.keyHandler_.detach(); 
  this.eh_.unlisten(this.activeElement_, goog.events.EventType.KEYUP, this.handleKeyUp); 
  if(goog.userAgent.IE) { 
    this.eh_.unlisten(this.activeElement_, goog.events.EventType.KEYPRESS, this.onIeKeyPress_); 
  } 
  if(this.waitingForIme_) { 
    this.stopWaitingForIme_(); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.handleFocus = function(e) { 
  this.activateHandler_.removeAll(); 
  if(this.ac_) { 
    this.ac_.cancelDelayedDismiss(); 
  } 
  if(e.target != this.activeElement_) { 
    this.activeElement_ =(e.target) || null; 
    if(this.timer_) { 
      this.timer_.start(); 
      this.eh_.listen(this.timer_, goog.Timer.TICK, this.onTick_); 
    } 
    this.lastValue_ = this.getValue(); 
    this.addKeyEvents_(); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.handleBlur = function(opt_e) { 
  if(this.activeElement_) { 
    this.removeKeyEvents_(); 
    this.activeElement_ = null; 
    if(this.timer_) { 
      this.timer_.stop(); 
      this.eh_.unlisten(this.timer_, goog.Timer.TICK, this.onTick_); 
    } 
    if(this.ac_) { 
      this.ac_.dismissOnDelay(); 
    } 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.onTick_ = function(e) { 
  this.update(); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.onKeyDownOnInactiveElement_ = function(e) { 
  this.handleFocus(e); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.onKey_ = function(e) { 
  this.lastKeyCode_ = e.keyCode; 
  if(this.ac_) { 
    this.handleKeyEvent(e); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.onKeyPress_ = function(e) { 
  if(this.waitingForIme_ && this.lastKeyCode_ != goog.events.KeyCodes.WIN_IME) { 
    this.stopWaitingForIme_(); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.onKeyUp_ = function(e) { 
  if(this.waitingForIme_ &&(e.keyCode == goog.events.KeyCodes.ENTER ||(e.keyCode == goog.events.KeyCodes.M && e.ctrlKey))) { 
    this.stopWaitingForIme_(); 
  } 
}; 
goog.ui.AutoComplete.InputHandler.prototype.startWaitingForIme_ = function() { 
  if(this.waitingForIme_) { 
    return; 
  } 
  this.eh_.listen(this.activeElement_, goog.events.EventType.KEYUP, this.onKeyUp_); 
  this.eh_.listen(this.activeElement_, goog.events.EventType.KEYPRESS, this.onKeyPress_); 
  this.waitingForIme_ = true; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.stopWaitingForIme_ = function() { 
  if(! this.waitingForIme_) { 
    return; 
  } 
  this.waitingForIme_ = false; 
  this.eh_.unlisten(this.activeElement_, goog.events.EventType.KEYPRESS, this.onKeyPress_); 
  this.eh_.unlisten(this.activeElement_, goog.events.EventType.KEYUP, this.onKeyUp_); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.onIeKeyPress_ = function(e) { 
  this.handleSeparator_(e); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.update = function(opt_force) { 
  if(opt_force || this.activeElement_ && this.getValue() != this.lastValue_) { 
    if(opt_force || ! this.rowJustSelected_) { 
      var token = this.parseToken(); 
      if(this.ac_) { 
        this.ac_.setTarget(this.activeElement_); 
        this.ac_.setToken(token, this.getValue()); 
      } 
    } 
    this.lastValue_ = this.getValue(); 
  } 
  this.rowJustSelected_ = false; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.parseToken = function() { 
  return this.parseToken_(); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.moveUp_ = function() { 
  return this.upsideDown_ ? this.ac_.hiliteNext(): this.ac_.hilitePrev(); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.moveDown_ = function() { 
  return this.upsideDown_ ? this.ac_.hilitePrev(): this.ac_.hiliteNext(); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.parseToken_ = function() { 
  var caret = this.getCursorPosition(); 
  var text = this.getValue(); 
  return this.trim_(this.splitInput_(text)[this.getTokenIndex_(text, caret)]); 
}; 
goog.ui.AutoComplete.InputHandler.prototype.trim_ = function(text) { 
  return this.trimmer_ ? String(text).replace(this.trimmer_, ''): text; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.getTokenIndex_ = function(text, caret) { 
  var entries = this.splitInput_(text); 
  if(caret == text.length) return entries.length - 1; 
  var current = 0; 
  for(var i = 0, pos = 0; i < entries.length && pos < caret; i ++) { 
    pos += entries[i].length; 
    current = i; 
  } 
  return current; 
}; 
goog.ui.AutoComplete.InputHandler.prototype.splitInput_ = function(text) { 
  if(! this.multi_) { 
    return[text]; 
  } 
  var arr = String(text).split(''); 
  var parts =[]; 
  var cache =[]; 
  for(var i = 0, inLiteral = false; i < arr.length; i ++) { 
    if(this.literals_ && this.literals_.indexOf(arr[i]) != - 1) { 
      if(this.generateNewTokenOnLiteral_ && ! inLiteral) { 
        parts.push(cache.join('')); 
        cache.length = 0; 
      } 
      cache.push(arr[i]); 
      inLiteral = ! inLiteral; 
    } else if(! inLiteral && this.separators_.indexOf(arr[i]) != - 1) { 
      cache.push(arr[i]); 
      parts.push(cache.join('')); 
      cache.length = 0; 
    } else { 
      cache.push(arr[i]); 
    } 
  } 
  parts.push(cache.join('')); 
  return parts; 
}; 
