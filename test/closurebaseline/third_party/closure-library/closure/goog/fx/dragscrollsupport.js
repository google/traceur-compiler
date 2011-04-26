
goog.provide('goog.fx.DragScrollSupport'); 
goog.require('goog.Disposable'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.style'); 
goog.fx.DragScrollSupport = function(containerNode, opt_margin, opt_externalMouseMoveTracking) { 
  goog.Disposable.call(this); 
  this.containerNode_ = containerNode; 
  this.scrollTimer_ = new goog.Timer(goog.fx.DragScrollSupport.TIMER_STEP_); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.scrollDelta_ = new goog.math.Coordinate(); 
  this.containerBounds_ = goog.style.getBounds(containerNode); 
  this.margin_ = opt_margin || 0; 
  this.scrollBounds_ = opt_margin ? this.constrainBounds_(this.containerBounds_.clone()): this.containerBounds_; 
  this.setupListeners_(! ! opt_externalMouseMoveTracking); 
}; 
goog.inherits(goog.fx.DragScrollSupport, goog.Disposable); 
goog.fx.DragScrollSupport.TIMER_STEP_ = 50; 
goog.fx.DragScrollSupport.SCROLL_STEP_ = 8; 
goog.fx.DragScrollSupport.MARGIN = 32; 
goog.fx.DragScrollSupport.prototype.constrainScroll_ = false; 
goog.fx.DragScrollSupport.prototype.setConstrainScroll = function(constrain) { 
  this.constrainScroll_ = ! ! this.margin_ && constrain; 
}; 
goog.fx.DragScrollSupport.prototype.constrainBounds_ = function(bounds) { 
  var margin = this.margin_; 
  if(margin) { 
    var quarterHeight = bounds.height * 0.25; 
    var yMargin = Math.min(margin, quarterHeight); 
    bounds.top += yMargin; 
    bounds.height -= 2 * yMargin; 
    var quarterWidth = bounds.width * 0.25; 
    var xMargin = Math.min(margin, quarterWidth); 
    bounds.top += xMargin; 
    bounds.height -= 2 * xMargin; 
  } 
  return bounds; 
}; 
goog.fx.DragScrollSupport.prototype.setupListeners_ = function(externalMouseMoveTracking) { 
  if(! externalMouseMoveTracking) { 
    this.eventHandler_.listen(goog.dom.getOwnerDocument(this.containerNode_), goog.events.EventType.MOUSEMOVE, this.onMouseMove); 
  } 
  this.eventHandler_.listen(this.scrollTimer_, goog.Timer.TICK, this.onTick_); 
}; 
goog.fx.DragScrollSupport.prototype.onTick_ = function(event) { 
  this.containerNode_.scrollTop += this.scrollDelta_.y; 
  this.containerNode_.scrollLeft += this.scrollDelta_.x; 
}; 
goog.fx.DragScrollSupport.prototype.onMouseMove = function(event) { 
  var deltaX = this.calculateScrollDelta(event.clientX, this.scrollBounds_.left, this.scrollBounds_.width); 
  var deltaY = this.calculateScrollDelta(event.clientY, this.scrollBounds_.top, this.scrollBounds_.height); 
  this.scrollDelta_.x = deltaX; 
  this.scrollDelta_.y = deltaY; 
  if((! deltaX && ! deltaY) ||(this.constrainScroll_ && ! this.isInContainerBounds_(event.clientX, event.clientY))) { 
    this.scrollTimer_.stop(); 
  } else if(! this.scrollTimer_.enabled) { 
    this.scrollTimer_.start(); 
  } 
}; 
goog.fx.DragScrollSupport.prototype.isInContainerBounds_ = function(x, y) { 
  var containerBounds = this.containerBounds_; 
  return containerBounds.left <= x && containerBounds.left + containerBounds.width >= x && containerBounds.top <= y && containerBounds.top + containerBounds.height >= y; 
}; 
goog.fx.DragScrollSupport.prototype.calculateScrollDelta = function(coordinate, min, rangeLength) { 
  var delta = 0; 
  if(coordinate < min) { 
    delta = - goog.fx.DragScrollSupport.SCROLL_STEP_; 
  } else if(coordinate > min + rangeLength) { 
    delta = goog.fx.DragScrollSupport.SCROLL_STEP_; 
  } 
  return delta; 
}; 
goog.fx.DragScrollSupport.prototype.disposeInternal = function() { 
  goog.fx.DragScrollSupport.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.scrollTimer_.dispose(); 
}; 
