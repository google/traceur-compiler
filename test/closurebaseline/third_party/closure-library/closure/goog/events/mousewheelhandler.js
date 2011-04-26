
goog.provide('goog.events.MouseWheelEvent'); 
goog.provide('goog.events.MouseWheelHandler'); 
goog.provide('goog.events.MouseWheelHandler.EventType'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.math'); 
goog.require('goog.userAgent'); 
goog.events.MouseWheelHandler = function(element) { 
  goog.events.EventTarget.call(this); 
  this.element_ = element; 
  var type = goog.userAgent.GECKO ? 'DOMMouseScroll': 'mousewheel'; 
  this.listenKey_ = goog.events.listen(this.element_, type, this); 
}; 
goog.inherits(goog.events.MouseWheelHandler, goog.events.EventTarget); 
goog.events.MouseWheelHandler.EventType = { MOUSEWHEEL: 'mousewheel' }; 
goog.events.MouseWheelHandler.prototype.maxDeltaX_; 
goog.events.MouseWheelHandler.prototype.maxDeltaY_; 
goog.events.MouseWheelHandler.prototype.setMaxDeltaX = function(maxDeltaX) { 
  this.maxDeltaX_ = maxDeltaX; 
}; 
goog.events.MouseWheelHandler.prototype.setMaxDeltaY = function(maxDeltaY) { 
  this.maxDeltaY_ = maxDeltaY; 
}; 
goog.events.MouseWheelHandler.prototype.handleEvent = function(e) { 
  var deltaX = 0; 
  var deltaY = 0; 
  var detail = 0; 
  var be = e.getBrowserEvent(); 
  if(be.type == 'mousewheel') { 
    var wheelDeltaScaleFactor = 1; 
    if(goog.userAgent.IE || goog.userAgent.WEBKIT &&(goog.userAgent.WINDOWS || goog.userAgent.isVersion('532.0'))) { 
      wheelDeltaScaleFactor = 40; 
    } 
    detail = goog.events.MouseWheelHandler.smartScale_(- be.wheelDelta, wheelDeltaScaleFactor); 
    if(goog.isDef(be.wheelDeltaX)) { 
      deltaX = goog.events.MouseWheelHandler.smartScale_(- be.wheelDeltaX, wheelDeltaScaleFactor); 
      deltaY = goog.events.MouseWheelHandler.smartScale_(- be.wheelDeltaY, wheelDeltaScaleFactor); 
    } else { 
      deltaY = detail; 
    } 
  } else { 
    detail = be.detail; 
    if(detail > 100) { 
      detail = 3; 
    } else if(detail < - 100) { 
      detail = - 3; 
    } 
    if(goog.isDef(be.axis) && be.axis === be.HORIZONTAL_AXIS) { 
      deltaX = detail; 
    } else { 
      deltaY = detail; 
    } 
  } 
  if(goog.isNumber(this.maxDeltaX_)) { 
    deltaX = goog.math.clamp(deltaX, - this.maxDeltaX_, this.maxDeltaX_); 
  } 
  if(goog.isNumber(this.maxDeltaY_)) { 
    deltaY = goog.math.clamp(deltaY, - this.maxDeltaY_, this.maxDeltaY_); 
  } 
  var newEvent = new goog.events.MouseWheelEvent(detail, be, deltaX, deltaY); 
  try { 
    this.dispatchEvent(newEvent); 
  } finally { 
    newEvent.dispose(); 
  } 
}; 
goog.events.MouseWheelHandler.smartScale_ = function(mouseWheelDelta, scaleFactor) { 
  if(goog.userAgent.WEBKIT && goog.userAgent.MAC &&(mouseWheelDelta % scaleFactor) != 0) { 
    return mouseWheelDelta; 
  } else { 
    return mouseWheelDelta / scaleFactor; 
  } 
}; 
goog.events.MouseWheelHandler.prototype.disposeInternal = function() { 
  goog.events.MouseWheelHandler.superClass_.disposeInternal.call(this); 
  goog.events.unlistenByKey(this.listenKey_); 
  delete this.listenKey_; 
}; 
goog.events.MouseWheelEvent = function(detail, browserEvent, deltaX, deltaY) { 
  goog.events.BrowserEvent.call(this, browserEvent); 
  this.type = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL; 
  this.detail = detail; 
  this.deltaX = deltaX; 
  this.deltaY = deltaY; 
}; 
goog.inherits(goog.events.MouseWheelEvent, goog.events.BrowserEvent); 
