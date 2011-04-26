
goog.provide('goog.ui.KeyboardShortcutEvent'); 
goog.provide('goog.ui.KeyboardShortcutHandler'); 
goog.provide('goog.ui.KeyboardShortcutHandler.EventType'); 
goog.require('goog.Timer'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyNames'); 
goog.require('goog.object'); 
goog.ui.KeyboardShortcutHandler = function(keyTarget) { 
  goog.events.EventTarget.call(this); 
  this.shortcuts_ = { }; 
  this.lastKeys_ = { 
    strokes:[], 
    time: 0 
  }; 
  this.globalKeys_ = goog.object.createSet(goog.ui.KeyboardShortcutHandler.DEFAULT_GLOBAL_KEYS_); 
  this.alwaysPreventDefault_ = true; 
  this.alwaysStopPropagation_ = false; 
  this.allShortcutsAreGlobal_ = false; 
  this.modifierShortcutsAreGlobal_ = true; 
  this.initializeKeyListener(keyTarget); 
}; 
goog.inherits(goog.ui.KeyboardShortcutHandler, goog.events.EventTarget); 
goog.ui.KeyboardShortcutHandler.MAX_KEY_SEQUENCE_DELAY = 1500; 
goog.ui.KeyboardShortcutHandler.Modifiers = { 
  NONE: 0, 
  SHIFT: 1, 
  CTRL: 2, 
  ALT: 4, 
  META: 8 
}; 
goog.ui.KeyboardShortcutHandler.DEFAULT_GLOBAL_KEYS_ =[goog.events.KeyCodes.ESC, goog.events.KeyCodes.F1, goog.events.KeyCodes.F2, goog.events.KeyCodes.F3, goog.events.KeyCodes.F4, goog.events.KeyCodes.F5, goog.events.KeyCodes.F6, goog.events.KeyCodes.F7, goog.events.KeyCodes.F8, goog.events.KeyCodes.F9, goog.events.KeyCodes.F10, goog.events.KeyCodes.F11, goog.events.KeyCodes.F12, goog.events.KeyCodes.PAUSE]; 
goog.ui.KeyboardShortcutHandler.EventType = { 
  SHORTCUT_TRIGGERED: 'shortcut', 
  SHORTCUT_PREFIX: 'shortcut_' 
}; 
goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_; 
goog.ui.KeyboardShortcutHandler.prototype.keyTarget_; 
goog.ui.KeyboardShortcutHandler.prototype.metaKeyRecentlyReleased_; 
goog.ui.KeyboardShortcutHandler.prototype.isPrintableKey_; 
goog.ui.KeyboardShortcutHandler.getKeyCode = function(name) { 
  if(! goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_) { 
    var map = { }; 
    for(var key in goog.events.KeyNames) { 
      map[goog.events.KeyNames[key]]= key; 
    } 
    goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_ = map; 
  } 
  return goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_[name]; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.setAlwaysPreventDefault = function(alwaysPreventDefault) { 
  this.alwaysPreventDefault_ = alwaysPreventDefault; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getAlwaysPreventDefault = function() { 
  return this.alwaysPreventDefault_; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.setAlwaysStopPropagation = function(alwaysStopPropagation) { 
  this.alwaysStopPropagation_ = alwaysStopPropagation; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getAlwaysStopPropagation = function() { 
  return this.alwaysStopPropagation_; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.setAllShortcutsAreGlobal = function(allShortcutsGlobal) { 
  this.allShortcutsAreGlobal_ = allShortcutsGlobal; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getAllShortcutsAreGlobal = function() { 
  return this.allShortcutsAreGlobal_; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.setModifierShortcutsAreGlobal = function(modifierShortcutsGlobal) { 
  this.modifierShortcutsAreGlobal_ = modifierShortcutsGlobal; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getModifierShortcutsAreGlobal = function() { 
  return this.modifierShortcutsAreGlobal_; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.registerShortcut = function(identifier, var_args) { 
  goog.ui.KeyboardShortcutHandler.setShortcut_(this.shortcuts_, this.interpretStrokes_(1, arguments), identifier); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.unregisterShortcut = function(var_args) { 
  goog.ui.KeyboardShortcutHandler.setShortcut_(this.shortcuts_, this.interpretStrokes_(0, arguments), null); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.isShortcutRegistered = function(var_args) { 
  return this.checkShortcut_(this.interpretStrokes_(0, arguments)); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.interpretStrokes_ = function(initialIndex, args) { 
  var strokes; 
  if(goog.isString(args[initialIndex])) { 
    strokes = goog.ui.KeyboardShortcutHandler.parseStringShortcut(args[initialIndex]); 
  } else { 
    var strokesArgs = args, i = initialIndex; 
    if(goog.isArray(args[initialIndex])) { 
      strokesArgs = args[initialIndex]; 
      i = 0; 
    } 
    strokes =[]; 
    for(; i < strokesArgs.length; i += 2) { 
      strokes.push({ 
        keyCode: strokesArgs[i], 
        modifiers: strokesArgs[i + 1]
      }); 
    } 
  } 
  return strokes; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.unregisterAll = function() { 
  this.shortcuts_ = { }; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.setGlobalKeys = function(keys) { 
  this.globalKeys_ = goog.object.createSet(keys); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getGlobalKeys = function() { 
  return goog.object.getKeys(this.globalKeys_); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.disposeInternal = function() { 
  goog.ui.KeyboardShortcutHandler.superClass_.disposeInternal.call(this); 
  this.unregisterAll(); 
  this.clearKeyListener(); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getEventType = function(identifier) { 
  return goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_PREFIX + identifier; 
}; 
goog.ui.KeyboardShortcutHandler.parseStringShortcut = function(s) { 
  s = s.replace(/[ +]*\+[ +]*/g, '+').replace(/[ ]+/g, ' ').toLowerCase(); 
  var groups = s.split(' '); 
  var strokes =[]; 
  for(var group, i = 0; group = groups[i]; i ++) { 
    var keys = group.split('+'); 
    var keyCode, modifiers = goog.ui.KeyboardShortcutHandler.Modifiers.NONE; 
    for(var key, j = 0; key = keys[j]; j ++) { 
      switch(key) { 
        case 'shift': 
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT; 
          continue; 

        case 'ctrl': 
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.CTRL; 
          continue; 

        case 'alt': 
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.ALT; 
          continue; 

        case 'meta': 
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.META; 
          continue; 

      } 
      keyCode = goog.ui.KeyboardShortcutHandler.getKeyCode(key); 
      break; 
    } 
    strokes.push({ 
      keyCode: keyCode, 
      modifiers: modifiers 
    }); 
  } 
  return strokes; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.initializeKeyListener = function(keyTarget) { 
  this.keyTarget_ = keyTarget; 
  goog.events.listen(this.keyTarget_, goog.events.EventType.KEYDOWN, this.handleKeyDown_, false, this); 
  if(goog.userAgent.MAC && goog.userAgent.GECKO && goog.userAgent.isVersion('1.8')) { 
    goog.events.listen(this.keyTarget_, goog.events.EventType.KEYUP, this.handleMacGeckoKeyUp_, false, this); 
  } 
  if(goog.userAgent.WINDOWS && ! goog.userAgent.GECKO) { 
    goog.events.listen(this.keyTarget_, goog.events.EventType.KEYPRESS, this.handleWindowsKeyPress_, false, this); 
    goog.events.listen(this.keyTarget_, goog.events.EventType.KEYUP, this.handleWindowsKeyUp_, false, this); 
  } 
}; 
goog.ui.KeyboardShortcutHandler.prototype.handleMacGeckoKeyUp_ = function(e) { 
  if(e.keyCode == goog.events.KeyCodes.MAC_FF_META) { 
    this.metaKeyRecentlyReleased_ = true; 
    goog.Timer.callOnce(function() { 
      this.metaKeyRecentlyReleased_ = false; 
    }, 400, this); 
    return; 
  } 
  var metaKey = e.metaKey || this.metaKeyRecentlyReleased_; 
  if((e.keyCode == goog.events.KeyCodes.C || e.keyCode == goog.events.KeyCodes.X || e.keyCode == goog.events.KeyCodes.V) && metaKey) { 
    e.metaKey = metaKey; 
    this.handleKeyDown_(e); 
  } 
}; 
goog.ui.KeyboardShortcutHandler.prototype.isPossiblePrintableKey_ = function(e) { 
  return goog.userAgent.WINDOWS && ! goog.userAgent.GECKO && e.ctrlKey && e.altKey && ! e.shiftKey; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.handleWindowsKeyPress_ = function(e) { 
  if(e.keyCode > 0x20 && this.isPossiblePrintableKey_(e)) { 
    this.isPrintableKey_ = true; 
  } 
}; 
goog.ui.KeyboardShortcutHandler.prototype.handleWindowsKeyUp_ = function(e) { 
  if(! this.isPrintableKey_ && this.isPossiblePrintableKey_(e)) { 
    this.handleKeyDown_(e); 
  } 
}; 
goog.ui.KeyboardShortcutHandler.prototype.clearKeyListener = function() { 
  goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYDOWN, this.handleKeyDown_, false, this); 
  if(goog.userAgent.MAC && goog.userAgent.GECKO && goog.userAgent.isVersion('1.8')) { 
    goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYUP, this.handleMacGeckoKeyUp_, false, this); 
  } 
  if(goog.userAgent.WINDOWS && ! goog.userAgent.GECKO) { 
    goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYPRESS, this.handleWindowsKeyPress_, false, this); 
    goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYUP, this.handleWindowsKeyUp_, false, this); 
  } 
  this.keyTarget_ = null; 
}; 
goog.ui.KeyboardShortcutHandler.setShortcut_ = function(parent, strokes, identifier) { 
  var stroke = strokes.shift(); 
  var key = goog.ui.KeyboardShortcutHandler.makeKey_(stroke.keyCode, stroke.modifiers); 
  var node = parent[key]; 
  if(node && identifier &&(strokes.length == 0 || goog.isString(node))) { 
    throw Error('Keyboard shortcut conflicts with existing shortcut'); 
  } 
  if(strokes.length) { 
    if(! node) { 
      node = parent[key]= { }; 
    } 
    goog.ui.KeyboardShortcutHandler.setShortcut_(node, strokes, identifier); 
  } else { 
    parent[key]= identifier; 
  } 
}; 
goog.ui.KeyboardShortcutHandler.prototype.getShortcut_ = function(strokes, opt_index, opt_list) { 
  var list = opt_list || this.shortcuts_; 
  var index = opt_index || 0; 
  var stroke = strokes[index]; 
  var node = list[stroke]; 
  if(node && ! goog.isString(node) && strokes.length - index > 1) { 
    return this.getShortcut_(strokes, index + 1, node); 
  } 
  return node; 
}; 
goog.ui.KeyboardShortcutHandler.prototype.checkShortcut_ = function(strokes) { 
  var node = this.shortcuts_; 
  while(strokes.length > 0 && node) { 
    var stroke = strokes.shift(); 
    var key = goog.ui.KeyboardShortcutHandler.makeKey_(stroke.keyCode, stroke.modifiers); 
    node = node[key]; 
    if(goog.isString(node)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.ui.KeyboardShortcutHandler.makeKey_ = function(keyCode, modifiers) { 
  return(keyCode & 255) |(modifiers << 8); 
}; 
goog.ui.KeyboardShortcutHandler.prototype.handleKeyDown_ = function(event) { 
  if(! this.isValidShortcut_(event)) { 
    return; 
  } 
  if(event.type == 'keydown' && this.isPossiblePrintableKey_(event)) { 
    this.isPrintableKey_ = false; 
    return; 
  } 
  var modifiers =(event.shiftKey ? goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT: 0) |(event.ctrlKey ? goog.ui.KeyboardShortcutHandler.Modifiers.CTRL: 0) |(event.altKey ? goog.ui.KeyboardShortcutHandler.Modifiers.ALT: 0) |(event.metaKey ? goog.ui.KeyboardShortcutHandler.Modifiers.META: 0); 
  var stroke = goog.ui.KeyboardShortcutHandler.makeKey_(event.keyCode, modifiers); 
  var node, shortcut; 
  var now = goog.now(); 
  if(this.lastKeys_.strokes.length && now - this.lastKeys_.time <= goog.ui.KeyboardShortcutHandler.MAX_KEY_SEQUENCE_DELAY) { 
    node = this.getShortcut_(this.lastKeys_.strokes); 
  } else { 
    this.lastKeys_.strokes.length = 0; 
  } 
  node = node ? node[stroke]: this.shortcuts_[stroke]; 
  if(! node) { 
    node = this.shortcuts_[stroke]; 
    this.lastKeys_.strokes =[]; 
  } 
  if(node && goog.isString(node)) { 
    shortcut = node; 
  } else if(node) { 
    this.lastKeys_.strokes.push(stroke); 
    this.lastKeys_.time = now; 
    if(goog.userAgent.GECKO) { 
      event.preventDefault(); 
    } 
  } else { 
    this.lastKeys_.strokes.length = 0; 
  } 
  if(shortcut) { 
    if(this.alwaysPreventDefault_) { 
      event.preventDefault(); 
    } 
    if(this.alwaysStopPropagation_) { 
      event.stopPropagation(); 
    } 
    var types = goog.ui.KeyboardShortcutHandler.EventType; 
    var target =(event.target); 
    var triggerEvent = new goog.ui.KeyboardShortcutEvent(types.SHORTCUT_TRIGGERED, shortcut, target); 
    var retVal = this.dispatchEvent(triggerEvent); 
    var prefixEvent = new goog.ui.KeyboardShortcutEvent(types.SHORTCUT_PREFIX + shortcut, shortcut, target); 
    retVal &= this.dispatchEvent(prefixEvent); 
    if(! retVal) { 
      event.preventDefault(); 
    } 
    this.lastKeys_.strokes.length = 0; 
  } 
}; 
goog.ui.KeyboardShortcutHandler.prototype.isValidShortcut_ = function(event) { 
  var keyCode = event.keyCode; 
  if(keyCode == goog.events.KeyCodes.SHIFT || keyCode == goog.events.KeyCodes.CTRL || keyCode == goog.events.KeyCodes.ALT) { 
    return false; 
  } 
  var el =(event.target); 
  var isFormElement = el.tagName == 'TEXTAREA' || el.tagName == 'INPUT' || el.tagName == 'BUTTON' || el.tagName == 'SELECT'; 
  var isContentEditable = ! isFormElement &&(el.isContentEditable ||(el.ownerDocument && el.ownerDocument.designMode == 'on')); 
  if(! isFormElement && ! isContentEditable) { 
    return true; 
  } 
  if(this.globalKeys_[keyCode]|| this.allShortcutsAreGlobal_) { 
    return true; 
  } 
  if(isContentEditable) { 
    return false; 
  } 
  if(this.modifierShortcutsAreGlobal_ &&(event.altKey || event.ctrlKey || event.metaKey)) { 
    return true; 
  } 
  if(el.tagName == 'INPUT' &&(el.type == 'text' || el.type == 'password')) { 
    return keyCode == goog.events.KeyCodes.ENTER; 
  } 
  if(el.tagName == 'INPUT' || el.tagName == 'BUTTON') { 
    return keyCode != goog.events.KeyCodes.SPACE; 
  } 
  return false; 
}; 
goog.ui.KeyboardShortcutEvent = function(type, identifier, target) { 
  goog.events.Event.call(this, type, target); 
  this.identifier = identifier; 
}; 
goog.inherits(goog.ui.KeyboardShortcutEvent, goog.events.Event); 
