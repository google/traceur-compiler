
goog.provide('goog.ui.SliderBase'); 
goog.provide('goog.ui.SliderBase.Orientation'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.events.MouseWheelHandler'); 
goog.require('goog.events.MouseWheelHandler.EventType'); 
goog.require('goog.fx.Animation.EventType'); 
goog.require('goog.fx.Dragger'); 
goog.require('goog.fx.Dragger.EventType'); 
goog.require('goog.fx.dom.SlideFrom'); 
goog.require('goog.math'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.RangeModel'); 
goog.ui.SliderBase = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.rangeModel = new goog.ui.RangeModel; 
  goog.events.listen(this.rangeModel, goog.ui.Component.EventType.CHANGE, this.handleRangeModelChange, false, this); 
}; 
goog.inherits(goog.ui.SliderBase, goog.ui.Component); 
goog.ui.SliderBase.Orientation = { 
  VERTICAL: 'vertical', 
  HORIZONTAL: 'horizontal' 
}; 
goog.ui.SliderBase.prototype.orientation_ = goog.ui.SliderBase.Orientation.HORIZONTAL; 
goog.ui.SliderBase.MOUSE_DOWN_INCREMENT_INTERVAL_ = 200; 
goog.ui.SliderBase.ANIMATION_INTERVAL_ = 100; 
goog.ui.SliderBase.prototype.rangeModel; 
goog.ui.SliderBase.prototype.valueThumb; 
goog.ui.SliderBase.prototype.extentThumb; 
goog.ui.SliderBase.prototype.thumbToMove_; 
goog.ui.SliderBase.prototype.keyHandler_; 
goog.ui.SliderBase.prototype.mouseWheelHandler_; 
goog.ui.SliderBase.prototype.valueDragger_; 
goog.ui.SliderBase.prototype.extentDragger_; 
goog.ui.SliderBase.prototype.isAnimating_ = false; 
goog.ui.SliderBase.prototype.moveToPointEnabled_ = false; 
goog.ui.SliderBase.prototype.blockIncrement_ = 10; 
goog.ui.SliderBase.prototype.minExtent_ = 0; 
goog.ui.SliderBase.prototype.getCssClass = goog.abstractMethod; 
goog.ui.SliderBase.prototype.createDom = function() { 
  goog.ui.SliderBase.superClass_.createDom.call(this); 
  var element = this.getDomHelper().createDom('div', this.getCssClass(this.orientation_)); 
  this.decorateInternal(element); 
}; 
goog.ui.SliderBase.prototype.createThumbs = goog.abstractMethod; 
goog.ui.SliderBase.prototype.decorateInternal = function(element) { 
  goog.ui.SliderBase.superClass_.decorateInternal.call(this, element); 
  goog.dom.classes.add(element, this.getCssClass(this.orientation_)); 
  this.createThumbs(); 
  this.setAriaRoles(); 
}; 
goog.ui.SliderBase.prototype.enterDocument = function() { 
  goog.ui.SliderBase.superClass_.enterDocument.call(this); 
  this.valueDragger_ = new goog.fx.Dragger(this.valueThumb); 
  this.extentDragger_ = new goog.fx.Dragger(this.extentThumb); 
  this.valueDragger_.defaultAction = this.extentDragger_.defaultAction = goog.nullFunction; 
  this.keyHandler_ = new goog.events.KeyHandler(this.getElement()); 
  this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(this.getElement()); 
  this.getHandler().listen(this.valueDragger_, goog.fx.Dragger.EventType.BEFOREDRAG, this.handleBeforeDrag_).listen(this.extentDragger_, goog.fx.Dragger.EventType.BEFOREDRAG, this.handleBeforeDrag_).listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.handleKeyDown_).listen(this.getElement(), goog.events.EventType.MOUSEDOWN, this.handleMouseDown_).listen(this.mouseWheelHandler_, goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_); 
  this.getElement().tabIndex = 0; 
  this.updateUi_(); 
}; 
goog.ui.SliderBase.prototype.handleBeforeDrag_ = function(e) { 
  var thumbToDrag = e.dragger == this.valueDragger_ ? this.valueThumb: this.extentThumb; 
  var value; 
  if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
    var availHeight = this.getElement().clientHeight - thumbToDrag.offsetHeight; 
    value =(availHeight - e.top) / availHeight *(this.getMaximum() - this.getMinimum()) + this.getMinimum(); 
  } else { 
    var availWidth = this.getElement().clientWidth - thumbToDrag.offsetWidth; 
    value =(e.left / availWidth) *(this.getMaximum() - this.getMinimum()) + this.getMinimum(); 
  } 
  if(e.dragger == this.valueDragger_) { 
    value = Math.min(Math.max(value, this.getMinimum()), this.getValue() + this.getExtent()); 
  } else { 
    value = Math.min(Math.max(value, this.getValue()), this.getMaximum()); 
  } 
  this.setThumbPosition_(thumbToDrag, value); 
}; 
goog.ui.SliderBase.prototype.handleKeyDown_ = function(e) { 
  var handled = true; 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.HOME: 
      this.animatedSetValue(this.getMinimum()); 
      break; 

    case goog.events.KeyCodes.END: 
      this.animatedSetValue(this.getMaximum()); 
      break; 

    case goog.events.KeyCodes.PAGE_UP: 
      this.moveThumbs(this.getBlockIncrement()); 
      break; 

    case goog.events.KeyCodes.PAGE_DOWN: 
      this.moveThumbs(- this.getBlockIncrement()); 
      break; 

    case goog.events.KeyCodes.LEFT: 
    case goog.events.KeyCodes.DOWN: 
      this.moveThumbs(e.shiftKey ? - this.getBlockIncrement(): - this.getUnitIncrement()); 
      break; 

    case goog.events.KeyCodes.RIGHT: 
    case goog.events.KeyCodes.UP: 
      this.moveThumbs(e.shiftKey ? this.getBlockIncrement(): this.getUnitIncrement()); 
      break; 

    default: 
      handled = false; 

  } 
  if(handled) { 
    e.preventDefault(); 
  } 
}; 
goog.ui.SliderBase.prototype.handleMouseDown_ = function(e) { 
  if(this.getElement().focus) { 
    this.getElement().focus(); 
  } 
  var target =(e.target); 
  if(! goog.dom.contains(this.valueThumb, target) && ! goog.dom.contains(this.extentThumb, target)) { 
    if(this.moveToPointEnabled_) { 
      this.animatedSetValue(this.getValueFromMousePosition_(e)); 
    } else { 
      this.startBlockIncrementing_(e); 
    } 
  } 
}; 
goog.ui.SliderBase.prototype.handleMouseWheel_ = function(e) { 
  var direction = e.detail > 0 ? - 1: 1; 
  this.moveThumbs(direction * this.getUnitIncrement()); 
  e.preventDefault(); 
}; 
goog.ui.SliderBase.prototype.startBlockIncrementing_ = function(e) { 
  this.storeMousePos_(e); 
  this.thumbToMove_ = this.getClosestThumb_(this.getValueFromMousePosition_(e)); 
  if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
    this.incrementing_ = this.lastMousePosition_ < this.thumbToMove_.offsetTop; 
  } else { 
    this.incrementing_ = this.lastMousePosition_ > this.thumbToMove_.offsetLeft + this.thumbToMove_.offsetWidth; 
  } 
  var doc = goog.dom.getOwnerDocument(this.getElement()); 
  this.getHandler().listen(doc, goog.events.EventType.MOUSEUP, this.handleMouseUp_, true).listen(this.getElement(), goog.events.EventType.MOUSEMOVE, this.storeMousePos_); 
  if(! this.incTimer_) { 
    this.incTimer_ = new goog.Timer(goog.ui.SliderBase.MOUSE_DOWN_INCREMENT_INTERVAL_); 
    this.getHandler().listen(this.incTimer_, goog.Timer.TICK, this.handleTimerTick_); 
  } 
  this.handleTimerTick_(); 
  this.incTimer_.start(); 
}; 
goog.ui.SliderBase.prototype.handleTimerTick_ = function() { 
  var value; 
  if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
    var mouseY = this.lastMousePosition_; 
    var thumbY = this.thumbToMove_.offsetTop; 
    if(this.incrementing_) { 
      if(mouseY < thumbY) { 
        value = this.getThumbPosition_(this.thumbToMove_) + this.getBlockIncrement(); 
      } 
    } else { 
      var thumbH = this.thumbToMove_.offsetHeight; 
      if(mouseY > thumbY + thumbH) { 
        value = this.getThumbPosition_(this.thumbToMove_) - this.getBlockIncrement(); 
      } 
    } 
  } else { 
    var mouseX = this.lastMousePosition_; 
    var thumbX = this.thumbToMove_.offsetLeft; 
    if(this.incrementing_) { 
      var thumbW = this.thumbToMove_.offsetWidth; 
      if(mouseX > thumbX + thumbW) { 
        value = this.getThumbPosition_(this.thumbToMove_) + this.getBlockIncrement(); 
      } 
    } else { 
      if(mouseX < thumbX) { 
        value = this.getThumbPosition_(this.thumbToMove_) - this.getBlockIncrement(); 
      } 
    } 
  } 
  if(goog.isDef(value)) { 
    this.setThumbPosition_(this.thumbToMove_, value); 
  } 
}; 
goog.ui.SliderBase.prototype.handleMouseUp_ = function(e) { 
  if(this.incTimer_) { 
    this.incTimer_.stop(); 
  } 
  var doc = goog.dom.getOwnerDocument(this.getElement()); 
  this.getHandler().unlisten(doc, goog.events.EventType.MOUSEUP, this.handleMouseUp_, true).unlisten(this.getElement(), goog.events.EventType.MOUSEMOVE, this.storeMousePos_); 
}; 
goog.ui.SliderBase.prototype.getRelativeMousePos_ = function(e) { 
  var coord = goog.style.getRelativePosition(e, this.getElement()); 
  if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
    return coord.y; 
  } else { 
    return coord.x; 
  } 
}; 
goog.ui.SliderBase.prototype.storeMousePos_ = function(e) { 
  this.lastMousePosition_ = this.getRelativeMousePos_(e); 
}; 
goog.ui.SliderBase.prototype.getValueFromMousePosition_ = function(e) { 
  var min = this.getMinimum(); 
  var max = this.getMaximum(); 
  if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
    var thumbH = this.valueThumb.offsetHeight; 
    var availH = this.getElement().clientHeight - thumbH; 
    var y = this.getRelativeMousePos_(e) - thumbH / 2; 
    return(max - min) *(availH - y) / availH + min; 
  } else { 
    var thumbW = this.valueThumb.offsetWidth; 
    var availW = this.getElement().clientWidth - thumbW; 
    var x = this.getRelativeMousePos_(e) - thumbW / 2; 
    return(max - min) * x / availW + min; 
  } 
}; 
goog.ui.SliderBase.prototype.getThumbPosition_ = function(thumb) { 
  if(thumb == this.valueThumb) { 
    return this.rangeModel.getValue(); 
  } else if(thumb == this.extentThumb) { 
    return this.rangeModel.getValue() + this.rangeModel.getExtent(); 
  } else { 
    throw Error('Illegal thumb element. Neither minThumb nor maxThumb'); 
  } 
}; 
goog.ui.SliderBase.prototype.moveThumbs = function(delta) { 
  var newMinPos = this.getThumbPosition_(this.valueThumb) + delta; 
  var newMaxPos = this.getThumbPosition_(this.extentThumb) + delta; 
  newMinPos = goog.math.clamp(newMinPos, this.getMinimum(), this.getMaximum() - this.minExtent_); 
  newMaxPos = goog.math.clamp(newMaxPos, this.getMinimum() + this.minExtent_, this.getMaximum()); 
  this.setValueAndExtent(newMinPos, newMaxPos - newMinPos); 
}; 
goog.ui.SliderBase.prototype.setThumbPosition_ = function(thumb, position) { 
  var intermediateExtent = null; 
  if(thumb == this.extentThumb && position <= this.rangeModel.getMaximum() && position >= this.rangeModel.getValue() + this.minExtent_) { 
    intermediateExtent = position - this.rangeModel.getValue(); 
  } 
  var currentExtent = intermediateExtent || this.rangeModel.getExtent(); 
  if(thumb == this.valueThumb && position >= this.getMinimum() && position <= this.rangeModel.getValue() + currentExtent - this.minExtent_) { 
    var newExtent = currentExtent -(position - this.rangeModel.getValue()); 
    if(this.rangeModel.roundToStepWithMin(position) + this.rangeModel.roundToStepWithMin(newExtent) == this.rangeModel.roundToStepWithMin(position + newExtent)) { 
      this.setValueAndExtent(position, newExtent); 
      intermediateExtent = null; 
    } 
  } 
  if(intermediateExtent != null) { 
    this.rangeModel.setExtent(intermediateExtent); 
  } 
}; 
goog.ui.SliderBase.prototype.setValueAndExtent = function(value, extent) { 
  if(this.getMinimum() <= value && value <= this.getMaximum() - extent && this.minExtent_ <= extent && extent <= this.getMaximum() - value) { 
    if(value == this.getValue() && extent == this.getExtent()) { 
      return; 
    } 
    this.rangeModel.setMute(true); 
    this.rangeModel.setExtent(0); 
    this.rangeModel.setValue(value); 
    this.rangeModel.setExtent(extent); 
    this.rangeModel.setMute(false); 
    this.updateUi_(); 
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
  } 
}; 
goog.ui.SliderBase.prototype.getMinimum = function() { 
  return this.rangeModel.getMinimum(); 
}; 
goog.ui.SliderBase.prototype.setMinimum = function(min) { 
  this.rangeModel.setMinimum(min); 
}; 
goog.ui.SliderBase.prototype.getMaximum = function() { 
  return this.rangeModel.getMaximum(); 
}; 
goog.ui.SliderBase.prototype.setMaximum = function(max) { 
  this.rangeModel.setMaximum(max); 
}; 
goog.ui.SliderBase.prototype.getValueThumb = function() { 
  return this.valueThumb; 
}; 
goog.ui.SliderBase.prototype.getExtentThumb = function() { 
  return this.extentThumb; 
}; 
goog.ui.SliderBase.prototype.getClosestThumb_ = function(position) { 
  if(position <=(this.rangeModel.getValue() + this.rangeModel.getExtent() / 2)) { 
    return this.valueThumb; 
  } else { 
    return this.extentThumb; 
  } 
}; 
goog.ui.SliderBase.prototype.handleRangeModelChange = function(e) { 
  this.updateUi_(); 
  this.updateAriaStates(); 
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
}; 
goog.ui.SliderBase.prototype.updateUi_ = function() { 
  if(this.valueThumb && ! this.isAnimating_) { 
    var minCoord = this.getThumbCoordinateForValue_(this.getThumbPosition_(this.valueThumb)); 
    var maxCoord = this.getThumbCoordinateForValue_(this.getThumbPosition_(this.extentThumb)); 
    if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
      this.valueThumb.style.top = minCoord.y + 'px'; 
      this.extentThumb.style.top = maxCoord.y + 'px'; 
    } else { 
      this.valueThumb.style.left = minCoord.x + 'px'; 
      this.extentThumb.style.left = maxCoord.x + 'px'; 
    } 
  } 
}; 
goog.ui.SliderBase.prototype.getThumbCoordinateForValue_ = function(val) { 
  var coord = new goog.math.Coordinate; 
  if(this.valueThumb) { 
    var min = this.getMinimum(); 
    var max = this.getMaximum(); 
    var ratio =(val == min && min == max) ? 0:(val - min) /(max - min); 
    if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
      var thumbHeight = this.valueThumb.offsetHeight; 
      var h = this.getElement().clientHeight - thumbHeight; 
      var bottom = Math.round(ratio * h); 
      coord.y = h - bottom; 
    } else { 
      var w = this.getElement().clientWidth - this.valueThumb.offsetWidth; 
      var left = Math.round(ratio * w); 
      coord.x = left; 
    } 
  } 
  return coord; 
}; 
goog.ui.SliderBase.prototype.animatedSetValue = function(v) { 
  v = Math.min(this.getMaximum(), Math.max(v, this.getMinimum())); 
  if(this.currentAnimation_) { 
    this.currentAnimation_.stop(true); 
  } 
  var end; 
  var thumb = this.getClosestThumb_(v); 
  var coord = this.getThumbCoordinateForValue_(v); 
  if(this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) { 
    end =[thumb.offsetLeft, coord.y]; 
  } else { 
    end =[coord.x, thumb.offsetTop]; 
  } 
  var animation = new goog.fx.dom.SlideFrom(thumb, end, goog.ui.SliderBase.ANIMATION_INTERVAL_); 
  this.currentAnimation_ = animation; 
  this.getHandler().listen(animation, goog.fx.Animation.EventType.END, this.endAnimation_); 
  this.isAnimating_ = true; 
  this.setThumbPosition_(thumb, v); 
  animation.play(false); 
}; 
goog.ui.SliderBase.prototype.endAnimation_ = function(e) { 
  this.isAnimating_ = false; 
}; 
goog.ui.SliderBase.prototype.setOrientation = function(orient) { 
  if(this.orientation_ != orient) { 
    var oldCss = this.getCssClass(this.orientation_); 
    var newCss = this.getCssClass(orient); 
    this.orientation_ = orient; 
    if(this.getElement()) { 
      goog.dom.classes.swap(this.getElement(), oldCss, newCss); 
      this.valueThumb.style.left = this.valueThumb.style.top = ''; 
      this.extentThumb.style.left = this.extentThumb.style.top = ''; 
      this.updateUi_(); 
    } 
  } 
}; 
goog.ui.SliderBase.prototype.getOrientation = function() { 
  return this.orientation_; 
}; 
goog.ui.SliderBase.prototype.disposeInternal = function() { 
  goog.ui.SliderBase.superClass_.disposeInternal.call(this); 
  if(this.incTimer_) { 
    this.incTimer_.dispose(); 
  } 
  delete this.incTimer_; 
  if(this.currentAnimation_) { 
    this.currentAnimation_.dispose(); 
  } 
  delete this.currentAnimation_; 
  delete this.valueThumb; 
  delete this.extentThumb; 
  this.rangeModel.dispose(); 
  delete this.rangeModel; 
  if(this.keyHandler_) { 
    this.keyHandler_.dispose(); 
    delete this.keyHandler_; 
  } 
  if(this.mouseWheelHandler_) { 
    this.mouseWheelHandler_.dispose(); 
    delete this.mouseWheelHandler_; 
  } 
  if(this.valueDragger_) { 
    this.valueDragger_.dispose(); 
    delete this.valueDragger_; 
  } 
  if(this.extentDragger_) { 
    this.extentDragger_.dispose(); 
    delete this.extentDragger_; 
  } 
}; 
goog.ui.SliderBase.prototype.getBlockIncrement = function() { 
  return this.blockIncrement_; 
}; 
goog.ui.SliderBase.prototype.setBlockIncrement = function(value) { 
  this.blockIncrement_ = value; 
}; 
goog.ui.SliderBase.prototype.setMinExtent = function(value) { 
  this.minExtent_ = value; 
}; 
goog.ui.SliderBase.prototype.unitIncrement_ = 1; 
goog.ui.SliderBase.prototype.getUnitIncrement = function() { 
  return this.unitIncrement_; 
}; 
goog.ui.SliderBase.prototype.setUnitIncrement = function(value) { 
  this.unitIncrement_ = value; 
}; 
goog.ui.SliderBase.prototype.getStep = function() { 
  return this.rangeModel.getStep(); 
}; 
goog.ui.SliderBase.prototype.setStep = function(step) { 
  this.rangeModel.setStep(step); 
}; 
goog.ui.SliderBase.prototype.getMoveToPointEnabled = function() { 
  return this.moveToPointEnabled_; 
}; 
goog.ui.SliderBase.prototype.setMoveToPointEnabled = function(val) { 
  this.moveToPointEnabled_ = val; 
}; 
goog.ui.SliderBase.prototype.getValue = function() { 
  return this.rangeModel.getValue(); 
}; 
goog.ui.SliderBase.prototype.setValue = function(value) { 
  this.setThumbPosition_(this.valueThumb, value); 
}; 
goog.ui.SliderBase.prototype.getExtent = function() { 
  return this.rangeModel.getExtent(); 
}; 
goog.ui.SliderBase.prototype.setExtent = function(extent) { 
  this.setThumbPosition_(this.extentThumb,(this.rangeModel.getValue() + extent)); 
}; 
goog.ui.SliderBase.prototype.setVisible = function(visible) { 
  goog.style.showElement(this.getElement(), visible); 
  if(visible) { 
    this.updateUi_(); 
  } 
}; 
goog.ui.SliderBase.prototype.setAriaRoles = function() { 
  goog.dom.a11y.setRole(this.getElement(), goog.dom.a11y.Role.SLIDER); 
  this.updateAriaStates(); 
}; 
goog.ui.SliderBase.prototype.updateAriaStates = function() { 
  var element = this.getElement(); 
  if(element) { 
    goog.dom.a11y.setState(element, goog.dom.a11y.State.VALUEMIN, this.getMinimum()); 
    goog.dom.a11y.setState(element, goog.dom.a11y.State.VALUEMAX, this.getMaximum()); 
    goog.dom.a11y.setState(element, goog.dom.a11y.State.VALUENOW, this.getValue()); 
  } 
}; 
