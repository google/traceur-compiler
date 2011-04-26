
goog.provide('goog.events.BrowserEvent'); 
goog.provide('goog.events.BrowserEvent.MouseButton'); 
goog.require('goog.events.BrowserFeature'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.reflect'); 
goog.require('goog.userAgent'); 
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) { 
  if(opt_e) { 
    this.init(opt_e, opt_currentTarget); 
  } 
}; 
goog.inherits(goog.events.BrowserEvent, goog.events.Event); 
goog.events.BrowserEvent.MouseButton = { 
  LEFT: 0, 
  MIDDLE: 1, 
  RIGHT: 2 
}; 
goog.events.BrowserEvent.IEButtonMap =[1, 4, 2]; 
goog.events.BrowserEvent.prototype.target = null; 
goog.events.BrowserEvent.prototype.currentTarget; 
goog.events.BrowserEvent.prototype.relatedTarget = null; 
goog.events.BrowserEvent.prototype.offsetX = 0; 
goog.events.BrowserEvent.prototype.offsetY = 0; 
goog.events.BrowserEvent.prototype.clientX = 0; 
goog.events.BrowserEvent.prototype.clientY = 0; 
goog.events.BrowserEvent.prototype.screenX = 0; 
goog.events.BrowserEvent.prototype.screenY = 0; 
goog.events.BrowserEvent.prototype.button = 0; 
goog.events.BrowserEvent.prototype.keyCode = 0; 
goog.events.BrowserEvent.prototype.charCode = 0; 
goog.events.BrowserEvent.prototype.ctrlKey = false; 
goog.events.BrowserEvent.prototype.altKey = false; 
goog.events.BrowserEvent.prototype.shiftKey = false; 
goog.events.BrowserEvent.prototype.metaKey = false; 
goog.events.BrowserEvent.prototype.state; 
goog.events.BrowserEvent.prototype.platformModifierKey = false; 
goog.events.BrowserEvent.prototype.event_ = null; 
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) { 
  var type = this.type = e.type; 
  goog.events.Event.call(this, type); 
  this.target =(e.target) || e.srcElement; 
  this.currentTarget = opt_currentTarget; 
  var relatedTarget =(e.relatedTarget); 
  if(relatedTarget) { 
    if(goog.userAgent.GECKO) { 
      if(! goog.reflect.canAccessProperty(relatedTarget, 'nodeName')) { 
        relatedTarget = null; 
      } 
    } 
  } else if(type == goog.events.EventType.MOUSEOVER) { 
    relatedTarget = e.fromElement; 
  } else if(type == goog.events.EventType.MOUSEOUT) { 
    relatedTarget = e.toElement; 
  } 
  this.relatedTarget = relatedTarget; 
  this.offsetX = e.offsetX !== undefined ? e.offsetX: e.layerX; 
  this.offsetY = e.offsetY !== undefined ? e.offsetY: e.layerY; 
  this.clientX = e.clientX !== undefined ? e.clientX: e.pageX; 
  this.clientY = e.clientY !== undefined ? e.clientY: e.pageY; 
  this.screenX = e.screenX || 0; 
  this.screenY = e.screenY || 0; 
  this.button = e.button; 
  this.keyCode = e.keyCode || 0; 
  this.charCode = e.charCode ||(type == 'keypress' ? e.keyCode: 0); 
  this.ctrlKey = e.ctrlKey; 
  this.altKey = e.altKey; 
  this.shiftKey = e.shiftKey; 
  this.metaKey = e.metaKey; 
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey: e.ctrlKey; 
  this.state = e.state; 
  this.event_ = e; 
  delete this.returnValue_; 
  delete this.propagationStopped_; 
}; 
goog.events.BrowserEvent.prototype.isButton = function(button) { 
  if(! goog.events.BrowserFeature.HAS_W3C_BUTTON) { 
    if(this.type == 'click') { 
      return button == goog.events.BrowserEvent.MouseButton.LEFT; 
    } else { 
      return ! !(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button]); 
    } 
  } else { 
    return this.event_.button == button; 
  } 
}; 
goog.events.BrowserEvent.prototype.isMouseActionButton = function() { 
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey); 
}; 
goog.events.BrowserEvent.prototype.stopPropagation = function() { 
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this); 
  if(this.event_.stopPropagation) { 
    this.event_.stopPropagation(); 
  } else { 
    this.event_.cancelBubble = true; 
  } 
}; 
goog.events.BrowserEvent.prototype.preventDefault = function() { 
  goog.events.BrowserEvent.superClass_.preventDefault.call(this); 
  var be = this.event_; 
  if(! be.preventDefault) { 
    be.returnValue = false; 
    if(goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) { 
      try { 
        var VK_F1 = 112; 
        var VK_F12 = 123; 
        if(be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) { 
          be.keyCode = - 1; 
        } 
      } catch(ex) { } 
    } 
  } else { 
    be.preventDefault(); 
  } 
}; 
goog.events.BrowserEvent.prototype.getBrowserEvent = function() { 
  return this.event_; 
}; 
goog.events.BrowserEvent.prototype.disposeInternal = function() { 
  goog.events.BrowserEvent.superClass_.disposeInternal.call(this); 
  this.event_ = null; 
  this.target = null; 
  this.currentTarget = null; 
  this.relatedTarget = null; 
}; 
