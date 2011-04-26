
goog.provide('goog.testing.events'); 
goog.provide('goog.testing.events.Event'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.BrowserEvent.MouseButton'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.object'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.testing.events.Event = function(type, opt_target) { 
  this.type = type; 
  this.target = opt_target; 
  this.currentTarget = this.target; 
}; 
goog.object.extend(goog.testing.events.Event.prototype, goog.events.Event.prototype); 
goog.testing.events.setEventClientXY_ = function(event, opt_coords) { 
  if(! opt_coords && event.target && event.target.nodeType == goog.dom.NodeType.ELEMENT) { 
    try { 
      opt_coords = goog.style.getClientPosition((event.target)); 
    } catch(ex) { } 
  } 
  event.clientX = opt_coords ? opt_coords.x: 0; 
  event.clientY = opt_coords ? opt_coords.y: 0; 
  event.screenX = event.clientX; 
  event.screenY = event.clientY; 
}; 
goog.testing.events.fireClickSequence = function(target, opt_button, opt_coords, opt_eventProperties) { 
  return ! !(goog.testing.events.fireMouseDownEvent(target, opt_button, opt_coords, opt_eventProperties) & goog.testing.events.fireMouseUpEvent(target, opt_button, opt_coords, opt_eventProperties) & goog.testing.events.fireClickEvent(target, opt_button, opt_coords, opt_eventProperties)); 
}; 
goog.testing.events.fireDoubleClickSequence = function(target, opt_coords, opt_eventProperties) { 
  var btn = goog.events.BrowserEvent.MouseButton.LEFT; 
  return ! !(goog.testing.events.fireMouseDownEvent(target, btn, opt_coords, opt_eventProperties) & goog.testing.events.fireMouseUpEvent(target, btn, opt_coords, opt_eventProperties) & goog.testing.events.fireClickEvent(target, btn, opt_coords, opt_eventProperties) &(goog.userAgent.IE || goog.testing.events.fireMouseDownEvent(target, btn, opt_coords, opt_eventProperties)) & goog.testing.events.fireMouseUpEvent(target, btn, opt_coords, opt_eventProperties) &(goog.userAgent.IE || goog.testing.events.fireClickEvent(target, btn, opt_coords, opt_eventProperties)) & goog.testing.events.fireDoubleClickEvent(target, opt_coords, opt_eventProperties)); 
}; 
goog.testing.events.fireKeySequence = function(target, keyCode, opt_eventProperties) { 
  return goog.testing.events.fireNonAsciiKeySequence(target, keyCode, keyCode, opt_eventProperties); 
}; 
goog.testing.events.fireNonAsciiKeySequence = function(target, keyCode, keyPressKeyCode, opt_eventProperties) { 
  var keydown = new goog.testing.events.Event(goog.events.EventType.KEYDOWN, target); 
  var keyup = new goog.testing.events.Event(goog.events.EventType.KEYUP, target); 
  var keypress = new goog.testing.events.Event(goog.events.EventType.KEYPRESS, target); 
  keydown.keyCode = keyup.keyCode = keyCode; 
  keypress.keyCode = keyPressKeyCode; 
  if(opt_eventProperties) { 
    goog.object.extend(keydown, opt_eventProperties); 
    goog.object.extend(keyup, opt_eventProperties); 
    goog.object.extend(keypress, opt_eventProperties); 
  } 
  var result = true; 
  if(! goog.testing.events.isBrokenGeckoMacActionKey_(keydown)) { 
    result = goog.testing.events.fireBrowserEvent(keydown); 
  } 
  if(goog.events.KeyCodes.firesKeyPressEvent(keyCode, undefined, keydown.shiftKey, keydown.ctrlKey, keydown.altKey) && !(goog.userAgent.IE && ! result)) { 
    result &= goog.testing.events.fireBrowserEvent(keypress); 
  } 
  return ! !(result & goog.testing.events.fireBrowserEvent(keyup)); 
}; 
goog.testing.events.isBrokenGeckoMacActionKey_ = function(e) { 
  return goog.userAgent.MAC && goog.userAgent.GECKO &&(e.keyCode == goog.events.KeyCodes.C || e.keyCode == goog.events.KeyCodes.X || e.keyCode == goog.events.KeyCodes.V) && e.metaKey; 
}; 
goog.testing.events.fireMouseOverEvent = function(target, relatedTarget, opt_coords) { 
  var mouseover = new goog.testing.events.Event(goog.events.EventType.MOUSEOVER, target); 
  mouseover.relatedTarget = relatedTarget; 
  goog.testing.events.setEventClientXY_(mouseover, opt_coords); 
  return goog.testing.events.fireBrowserEvent(mouseover); 
}; 
goog.testing.events.fireMouseMoveEvent = function(target, opt_coords) { 
  var mousemove = new goog.testing.events.Event(goog.events.EventType.MOUSEMOVE, target); 
  goog.testing.events.setEventClientXY_(mousemove, opt_coords); 
  return goog.testing.events.fireBrowserEvent(mousemove); 
}; 
goog.testing.events.fireMouseOutEvent = function(target, relatedTarget, opt_coords) { 
  var mouseout = new goog.testing.events.Event(goog.events.EventType.MOUSEOUT, target); 
  mouseout.relatedTarget = relatedTarget; 
  goog.testing.events.setEventClientXY_(mouseout, opt_coords); 
  return goog.testing.events.fireBrowserEvent(mouseout); 
}; 
goog.testing.events.fireMouseDownEvent = function(target, opt_button, opt_coords, opt_eventProperties) { 
  var button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT; 
  button = goog.userAgent.IE ? goog.events.BrowserEvent.IEButtonMap[button]: button; 
  return goog.testing.events.fireMouseButtonEvent_(goog.events.EventType.MOUSEDOWN, target, button, opt_coords, opt_eventProperties); 
}; 
goog.testing.events.fireMouseUpEvent = function(target, opt_button, opt_coords, opt_eventProperties) { 
  var button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT; 
  button = goog.userAgent.IE ? goog.events.BrowserEvent.IEButtonMap[button]: button; 
  return goog.testing.events.fireMouseButtonEvent_(goog.events.EventType.MOUSEUP, target, button, opt_coords, opt_eventProperties); 
}; 
goog.testing.events.fireClickEvent = function(target, opt_button, opt_coords, opt_eventProperties) { 
  return goog.testing.events.fireMouseButtonEvent_(goog.events.EventType.CLICK, target, opt_button, opt_coords, opt_eventProperties); 
}; 
goog.testing.events.fireDoubleClickEvent = function(target, opt_coords, opt_eventProperties) { 
  return goog.testing.events.fireMouseButtonEvent_(goog.events.EventType.DBLCLICK, target, goog.events.BrowserEvent.MouseButton.LEFT, opt_coords, opt_eventProperties); 
}; 
goog.testing.events.fireMouseButtonEvent_ = function(type, target, opt_button, opt_coords, opt_eventProperties) { 
  var e = new goog.testing.events.Event(type, target); 
  e.button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT; 
  goog.testing.events.setEventClientXY_(e, opt_coords); 
  if(opt_eventProperties) { 
    goog.object.extend(e, opt_eventProperties); 
  } 
  return goog.testing.events.fireBrowserEvent(e); 
}; 
goog.testing.events.fireContextMenuEvent = function(target, opt_coords) { 
  var button =(goog.userAgent.MAC && goog.userAgent.WEBKIT) ? goog.events.BrowserEvent.MouseButton.LEFT: goog.events.BrowserEvent.MouseButton.RIGHT; 
  var contextmenu = new goog.testing.events.Event(goog.events.EventType.CONTEXTMENU, target); 
  contextmenu.button = goog.userAgent.IE ? goog.events.BrowserEvent.IEButtonMap[button]: button; 
  contextmenu.ctrlKey = goog.userAgent.MAC; 
  goog.testing.events.setEventClientXY_(contextmenu, opt_coords); 
  return goog.testing.events.fireBrowserEvent(contextmenu); 
}; 
goog.testing.events.fireContextMenuSequence = function(target, opt_coords) { 
  var props = goog.userAgent.MAC ? { ctrlKey: true }: { }; 
  var button =(goog.userAgent.MAC && goog.userAgent.WEBKIT) ? goog.events.BrowserEvent.MouseButton.LEFT: goog.events.BrowserEvent.MouseButton.RIGHT; 
  var result = goog.testing.events.fireMouseDownEvent(target, button, opt_coords, props); 
  if(goog.userAgent.WINDOWS) { 
    result &= goog.testing.events.fireMouseUpEvent(target, button, opt_coords) & goog.testing.events.fireContextMenuEvent(target, opt_coords); 
  } else { 
    result &= goog.testing.events.fireContextMenuEvent(target, opt_coords); 
    result &= goog.testing.events.fireMouseUpEvent(target, button, opt_coords, props); 
    if(goog.userAgent.WEBKIT && goog.userAgent.MAC) { 
      result &= goog.testing.events.fireClickEvent(target, button, opt_coords, props); 
    } 
  } 
  return ! ! result; 
}; 
goog.testing.events.firePopStateEvent = function(target, state) { 
  var e = new goog.testing.events.Event(goog.events.EventType.POPSTATE, target); 
  e.state = state; 
  return goog.testing.events.fireBrowserEvent(e); 
}; 
goog.testing.events.fireFocusEvent = function(target) { 
  var e = new goog.testing.events.Event(goog.events.EventType.FOCUS, target); 
  return goog.testing.events.fireBrowserEvent(e); 
}; 
goog.testing.events.fireBrowserEvent = function(event) { 
  event.returnValue_ = true; 
  var ancestors =[]; 
  for(var current = event.target; current; current = current.parentNode) { 
    ancestors.push(current); 
  } 
  for(var j = ancestors.length - 1; j >= 0 && ! event.propagationStopped_; j --) { 
    goog.events.fireListeners(ancestors[j], event.type, true, new goog.events.BrowserEvent(event, ancestors[j])); 
  } 
  for(var j = 0; j < ancestors.length && ! event.propagationStopped_; j ++) { 
    goog.events.fireListeners(ancestors[j], event.type, false, new goog.events.BrowserEvent(event, ancestors[j])); 
  } 
  return event.returnValue_; 
}; 
