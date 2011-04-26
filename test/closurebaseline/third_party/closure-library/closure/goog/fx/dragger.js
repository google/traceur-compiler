
goog.provide('goog.fx.DragEvent'); 
goog.provide('goog.fx.Dragger'); 
goog.provide('goog.fx.Dragger.EventType'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent.MouseButton'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Rect'); 
goog.require('goog.userAgent'); 
goog.fx.Dragger = function(target, opt_handle, opt_limits) { 
  goog.events.EventTarget.call(this); 
  this.target = target; 
  this.handle = opt_handle || target; 
  this.limits = opt_limits || new goog.math.Rect(NaN, NaN, NaN, NaN); 
  this.document_ = goog.dom.getOwnerDocument(target); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  goog.events.listen(this.handle,[goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN], this.startDrag, false, this); 
}; 
goog.inherits(goog.fx.Dragger, goog.events.EventTarget); 
goog.fx.Dragger.HAS_SET_CAPTURE_ = goog.userAgent.IE || goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.3'); 
goog.fx.Dragger.EventType = { 
  START: 'start', 
  BEFOREDRAG: 'beforedrag', 
  DRAG: 'drag', 
  END: 'end' 
}; 
goog.fx.Dragger.prototype.target; 
goog.fx.Dragger.prototype.handle; 
goog.fx.Dragger.prototype.limits; 
goog.fx.Dragger.prototype.clientX = 0; 
goog.fx.Dragger.prototype.clientY = 0; 
goog.fx.Dragger.prototype.screenX = 0; 
goog.fx.Dragger.prototype.screenY = 0; 
goog.fx.Dragger.prototype.startX = 0; 
goog.fx.Dragger.prototype.startY = 0; 
goog.fx.Dragger.prototype.deltaX = 0; 
goog.fx.Dragger.prototype.deltaY = 0; 
goog.fx.Dragger.prototype.pageScroll; 
goog.fx.Dragger.prototype.enabled_ = true; 
goog.fx.Dragger.prototype.dragging_ = false; 
goog.fx.Dragger.prototype.hysteresisDistanceSquared_ = 0; 
goog.fx.Dragger.prototype.mouseDownTime_ = 0; 
goog.fx.Dragger.prototype.document_; 
goog.fx.Dragger.prototype.eventHandler_; 
goog.fx.Dragger.prototype.scrollTarget_; 
goog.fx.Dragger.prototype.ieDragStartCancellingOn_ = false; 
goog.fx.Dragger.prototype.getHandler = function() { 
  return this.eventHandler_; 
}; 
goog.fx.Dragger.prototype.setLimits = function(limits) { 
  this.limits = limits || new goog.math.Rect(NaN, NaN, NaN, NaN); 
}; 
goog.fx.Dragger.prototype.setHysteresis = function(distance) { 
  this.hysteresisDistanceSquared_ = Math.pow(distance, 2); 
}; 
goog.fx.Dragger.prototype.getHysteresis = function() { 
  return Math.sqrt(this.hysteresisDistanceSquared_); 
}; 
goog.fx.Dragger.prototype.setScrollTarget = function(scrollTarget) { 
  this.scrollTarget_ = scrollTarget; 
}; 
goog.fx.Dragger.prototype.setCancelIeDragStart = function(cancelIeDragStart) { 
  this.ieDragStartCancellingOn_ = cancelIeDragStart; 
}; 
goog.fx.Dragger.prototype.getEnabled = function() { 
  return this.enabled_; 
}; 
goog.fx.Dragger.prototype.setEnabled = function(enabled) { 
  this.enabled_ = enabled; 
}; 
goog.fx.Dragger.prototype.disposeInternal = function() { 
  goog.fx.Dragger.superClass_.disposeInternal.call(this); 
  goog.events.unlisten(this.handle,[goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN], this.startDrag, false, this); 
  this.eventHandler_.dispose(); 
  delete this.target; 
  delete this.handle; 
  delete this.eventHandler_; 
}; 
goog.fx.Dragger.prototype.startDrag = function(e) { 
  var isMouseDown = e.type == goog.events.EventType.MOUSEDOWN; 
  if(this.enabled_ && ! this.dragging_ &&(! isMouseDown || e.isMouseActionButton())) { 
    this.maybeReinitTouchEvent_(e); 
    if(this.hysteresisDistanceSquared_ == 0) { 
      this.initializeDrag_(e); 
      if(this.dragging_) { 
        e.preventDefault(); 
      } else { 
        return; 
      } 
    } else { 
      e.preventDefault(); 
    } 
    this.setupDragHandlers(); 
    this.clientX = this.startX = e.clientX; 
    this.clientY = this.startY = e.clientY; 
    this.screenX = e.screenX; 
    this.screenY = e.screenY; 
    this.deltaX = this.target.offsetLeft; 
    this.deltaY = this.target.offsetTop; 
    this.pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll(); 
    this.mouseDownTime_ = goog.now(); 
  } 
}; 
goog.fx.Dragger.prototype.setupDragHandlers = function() { 
  var doc = this.document_; 
  var docEl = doc.documentElement; 
  var useCapture = ! goog.fx.Dragger.HAS_SET_CAPTURE_; 
  this.eventHandler_.listen(doc,[goog.events.EventType.TOUCHMOVE, goog.events.EventType.MOUSEMOVE], this.handleMove_, useCapture); 
  this.eventHandler_.listen(doc,[goog.events.EventType.TOUCHEND, goog.events.EventType.MOUSEUP], this.endDrag, useCapture); 
  if(goog.fx.Dragger.HAS_SET_CAPTURE_) { 
    docEl.setCapture(false); 
    this.eventHandler_.listen(docEl, goog.events.EventType.LOSECAPTURE, this.endDrag); 
  } else { 
    this.eventHandler_.listen(goog.dom.getWindow(doc), goog.events.EventType.BLUR, this.endDrag); 
  } 
  if(goog.userAgent.IE && this.ieDragStartCancellingOn_) { 
    this.eventHandler_.listen(doc, goog.events.EventType.DRAGSTART, goog.events.Event.preventDefault); 
  } 
  if(this.scrollTarget_) { 
    this.eventHandler_.listen(this.scrollTarget_, goog.events.EventType.SCROLL, this.onScroll_, useCapture); 
  } 
}; 
goog.fx.Dragger.prototype.initializeDrag_ = function(e) { 
  var rv = this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.START, this, e.clientX, e.clientY,(e))); 
  if(rv !== false) { 
    this.dragging_ = true; 
  } 
}; 
goog.fx.Dragger.prototype.endDrag = function(e, opt_dragCanceled) { 
  this.eventHandler_.removeAll(); 
  if(goog.fx.Dragger.HAS_SET_CAPTURE_) { 
    this.document_.releaseCapture(); 
  } 
  if(this.dragging_) { 
    this.maybeReinitTouchEvent_(e); 
    this.dragging_ = false; 
    var x = this.limitX(this.deltaX); 
    var y = this.limitY(this.deltaY); 
    var dragCancelled = opt_dragCanceled || e.type == goog.events.EventType.TOUCHCANCEL; 
    this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.END, this, e.clientX, e.clientY, e, x, y, dragCancelled)); 
  } 
  if(e.type == goog.events.EventType.TOUCHEND || e.type == goog.events.EventType.TOUCHCANCEL) { 
    e.preventDefault(); 
  } 
}; 
goog.fx.Dragger.prototype.endDragCancel = function(e) { 
  this.endDrag(e, true); 
}; 
goog.fx.Dragger.prototype.maybeReinitTouchEvent_ = function(e) { 
  var type = e.type; 
  if(type == goog.events.EventType.TOUCHSTART || type == goog.events.EventType.TOUCHMOVE) { 
    e.init(e.getBrowserEvent().targetTouches[0], e.currentTarget); 
  } else if(type == goog.events.EventType.TOUCHEND || type == goog.events.EventType.TOUCHCANCEL) { 
    e.init(e.getBrowserEvent().changedTouches[0], e.currentTarget); 
  } 
}; 
goog.fx.Dragger.prototype.handleMove_ = function(e) { 
  if(this.enabled_) { 
    this.maybeReinitTouchEvent_(e); 
    var dx = e.clientX - this.clientX; 
    var dy = e.clientY - this.clientY; 
    this.clientX = e.clientX; 
    this.clientY = e.clientY; 
    this.screenX = e.screenX; 
    this.screenY = e.screenY; 
    if(! this.dragging_) { 
      var diffX = this.startX - this.clientX; 
      var diffY = this.startY - this.clientY; 
      var distance = diffX * diffX + diffY * diffY; 
      if(distance > this.hysteresisDistanceSquared_) { 
        this.initializeDrag_(e); 
        if(! this.dragging_) { 
          this.endDrag(e); 
          return; 
        } 
      } 
    } 
    var pos = this.calculatePosition_(dx, dy); 
    var x = pos.x; 
    var y = pos.y; 
    if(this.dragging_) { 
      var rv = this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.BEFOREDRAG, this, e.clientX, e.clientY, e, x, y)); 
      if(rv !== false) { 
        this.doDrag(e, x, y, false); 
        e.preventDefault(); 
      } 
    } 
  } 
}; 
goog.fx.Dragger.prototype.calculatePosition_ = function(dx, dy) { 
  var pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll(); 
  dx += pageScroll.x - this.pageScroll.x; 
  dy += pageScroll.y - this.pageScroll.y; 
  this.pageScroll = pageScroll; 
  this.deltaX += dx; 
  this.deltaY += dy; 
  var x = this.limitX(this.deltaX); 
  var y = this.limitY(this.deltaY); 
  return new goog.math.Coordinate(x, y); 
}; 
goog.fx.Dragger.prototype.onScroll_ = function(e) { 
  var pos = this.calculatePosition_(0, 0); 
  e.clientX = this.pageScroll.x - this.clientX; 
  e.clientY = this.pageScroll.y - this.clientY; 
  this.doDrag(e, pos.x, pos.y, true); 
}; 
goog.fx.Dragger.prototype.doDrag = function(e, x, y, dragFromScroll) { 
  this.defaultAction(x, y); 
  this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.DRAG, this, e.clientX, e.clientY, e, x, y)); 
}; 
goog.fx.Dragger.prototype.limitX = function(x) { 
  var rect = this.limits; 
  var left = ! isNaN(rect.left) ? rect.left: null; 
  var width = ! isNaN(rect.width) ? rect.width: 0; 
  var maxX = left != null ? left + width: Infinity; 
  var minX = left != null ? left: - Infinity; 
  return Math.min(maxX, Math.max(minX, x)); 
}; 
goog.fx.Dragger.prototype.limitY = function(y) { 
  var rect = this.limits; 
  var top = ! isNaN(rect.top) ? rect.top: null; 
  var height = ! isNaN(rect.height) ? rect.height: 0; 
  var maxY = top != null ? top + height: Infinity; 
  var minY = top != null ? top: - Infinity; 
  return Math.min(maxY, Math.max(minY, y)); 
}; 
goog.fx.Dragger.prototype.defaultAction = function(x, y) { 
  this.target.style.left = x + 'px'; 
  this.target.style.top = y + 'px'; 
}; 
goog.fx.DragEvent = function(type, dragobj, clientX, clientY, browserEvent, opt_actX, opt_actY, opt_dragCanceled) { 
  goog.events.Event.call(this, type); 
  this.clientX = clientX; 
  this.clientY = clientY; 
  this.browserEvent = browserEvent; 
  this.left = goog.isDef(opt_actX) ? opt_actX: dragobj.deltaX; 
  this.top = goog.isDef(opt_actY) ? opt_actY: dragobj.deltaY; 
  this.dragger = dragobj; 
  this.dragCanceled = ! ! opt_dragCanceled; 
}; 
goog.inherits(goog.fx.DragEvent, goog.events.Event); 
