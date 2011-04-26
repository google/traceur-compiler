
goog.provide('goog.graphics.ext.Element'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.functions'); 
goog.require('goog.graphics'); 
goog.require('goog.graphics.ext.coordinates'); 
goog.graphics.ext.Element = function(group, wrapper) { 
  goog.events.EventTarget.call(this); 
  this.wrapper_ = wrapper; 
  this.graphics_ = group ? group.getGraphics(): this; 
  this.xPosition_ = new goog.graphics.ext.Element.Position_(this, true); 
  this.yPosition_ = new goog.graphics.ext.Element.Position_(this, false); 
  if(group) { 
    this.parent_ = group; 
    this.parent_.addChild(this); 
  } 
}; 
goog.inherits(goog.graphics.ext.Element, goog.events.EventTarget); 
goog.graphics.ext.Element.prototype.graphics_; 
goog.graphics.ext.Element.prototype.wrapper_; 
goog.graphics.ext.Element.prototype.parent_; 
goog.graphics.ext.Element.prototype.parentDependent_ = false; 
goog.graphics.ext.Element.prototype.needsTransform_ = false; 
goog.graphics.ext.Element.prototype.rotation_ = 0; 
goog.graphics.ext.Element.prototype.xPosition_; 
goog.graphics.ext.Element.prototype.yPosition_; 
goog.graphics.ext.Element.prototype.getWrapper = function() { 
  return this.wrapper_; 
}; 
goog.graphics.ext.Element.prototype.getGraphics = function() { 
  return this.graphics_; 
}; 
goog.graphics.ext.Element.prototype.getGraphicsImplementation = function() { 
  return this.graphics_.getImplementation(); 
}; 
goog.graphics.ext.Element.prototype.getParent = function() { 
  return this.parent_; 
}; 
goog.graphics.ext.Element.prototype.setPosition_ = function(position, value, type, opt_chain) { 
  position.setPosition(value, type); 
  this.computeIsParentDependent_(position); 
  this.needsTransform_ = true; 
  if(! opt_chain) { 
    this.transform(); 
  } 
}; 
goog.graphics.ext.Element.prototype.setSize_ = function(position, size, opt_chain) { 
  if(position.setSize(size)) { 
    this.needsTransform_ = true; 
    this.computeIsParentDependent_(position); 
    if(! opt_chain) { 
      this.reset(); 
    } 
  } else if(! opt_chain && this.isPendingTransform()) { 
    this.reset(); 
  } 
}; 
goog.graphics.ext.Element.prototype.setMinSize_ = function(position, minSize) { 
  position.setMinSize(minSize); 
  this.needsTransform_ = true; 
  this.computeIsParentDependent_(position); 
}; 
goog.graphics.ext.Element.prototype.getLeft = function() { 
  return this.xPosition_.getStart(); 
}; 
goog.graphics.ext.Element.prototype.setLeft = function(left, opt_chain) { 
  this.setPosition_(this.xPosition_, left, goog.graphics.ext.Element.PositionType_.START, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getRight = function() { 
  return this.xPosition_.getEnd(); 
}; 
goog.graphics.ext.Element.prototype.setRight = function(right, opt_chain) { 
  this.setPosition_(this.xPosition_, right, goog.graphics.ext.Element.PositionType_.END, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getCenter = function() { 
  return this.xPosition_.getMiddle(); 
}; 
goog.graphics.ext.Element.prototype.setCenter = function(center, opt_chain) { 
  this.setPosition_(this.xPosition_, center, goog.graphics.ext.Element.PositionType_.MIDDLE, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getTop = function() { 
  return this.yPosition_.getStart(); 
}; 
goog.graphics.ext.Element.prototype.setTop = function(top, opt_chain) { 
  this.setPosition_(this.yPosition_, top, goog.graphics.ext.Element.PositionType_.START, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getBottom = function() { 
  return this.yPosition_.getEnd(); 
}; 
goog.graphics.ext.Element.prototype.setBottom = function(bottom, opt_chain) { 
  this.setPosition_(this.yPosition_, bottom, goog.graphics.ext.Element.PositionType_.END, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getMiddle = function() { 
  return this.yPosition_.getMiddle(); 
}; 
goog.graphics.ext.Element.prototype.setMiddle = function(middle, opt_chain) { 
  this.setPosition_(this.yPosition_, middle, goog.graphics.ext.Element.PositionType_.MIDDLE, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getWidth = function() { 
  return this.xPosition_.getSize(); 
}; 
goog.graphics.ext.Element.prototype.setWidth = function(width, opt_chain) { 
  this.setSize_(this.xPosition_, width, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getMinWidth = function() { 
  return this.xPosition_.getMinSize(); 
}; 
goog.graphics.ext.Element.prototype.setMinWidth = function(minWidth) { 
  this.setMinSize_(this.xPosition_, minWidth); 
}; 
goog.graphics.ext.Element.prototype.getHeight = function() { 
  return this.yPosition_.getSize(); 
}; 
goog.graphics.ext.Element.prototype.setHeight = function(height, opt_chain) { 
  this.setSize_(this.yPosition_, height, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getMinHeight = function() { 
  return this.yPosition_.getMinSize(); 
}; 
goog.graphics.ext.Element.prototype.setMinHeight = function(minHeight) { 
  this.setMinSize_(this.yPosition_, minHeight); 
}; 
goog.graphics.ext.Element.prototype.setPosition = function(left, top, opt_chain) { 
  this.setLeft(left, true); 
  this.setTop(top, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.setSize = function(width, height, opt_chain) { 
  this.setWidth(width, true); 
  this.setHeight(height, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.setBounds = function(left, top, width, height, opt_chain) { 
  this.setLeft(left, true); 
  this.setTop(top, true); 
  this.setWidth(width, true); 
  this.setHeight(height, opt_chain); 
}; 
goog.graphics.ext.Element.prototype.getMaxX = function() { 
  return this.xPosition_.getMaxPosition(); 
}; 
goog.graphics.ext.Element.prototype.getMaxY = function() { 
  return this.yPosition_.getMaxPosition(); 
}; 
goog.graphics.ext.Element.prototype.reset = function() { 
  this.xPosition_.resetCache(); 
  this.yPosition_.resetCache(); 
  this.redraw(); 
  this.needsTransform_ = true; 
  this.transform(); 
}; 
goog.graphics.ext.Element.prototype.redraw = goog.nullFunction; 
goog.graphics.ext.Element.prototype.computeIsParentDependent_ = function(position) { 
  this.parentDependent_ = position.isParentDependent() || this.xPosition_.isParentDependent() || this.yPosition_.isParentDependent() || this.checkParentDependent(); 
}; 
goog.graphics.ext.Element.prototype.isParentDependent = function() { 
  return this.parentDependent_; 
}; 
goog.graphics.ext.Element.prototype.checkParentDependent = goog.functions.FALSE; 
goog.graphics.ext.Element.prototype.setRotation = function(angle) { 
  if(this.rotation_ != angle) { 
    this.rotation_ = angle; 
    this.needsTransform_ = true; 
    this.transform(); 
  } 
}; 
goog.graphics.ext.Element.prototype.getRotation = function() { 
  return this.rotation_; 
}; 
goog.graphics.ext.Element.prototype.parentTransform = function() { 
  this.needsTransform_ = this.needsTransform_ || this.parentDependent_; 
}; 
goog.graphics.ext.Element.prototype.isPendingTransform = function() { 
  return this.needsTransform_; 
}; 
goog.graphics.ext.Element.prototype.transform = function() { 
  if(this.isPendingTransform()) { 
    this.needsTransform_ = false; 
    this.wrapper_.setTransformation(this.getLeft(), this.getTop(), this.rotation_,(this.getWidth() || 1) / 2,(this.getHeight() || 1) / 2); 
  } 
}; 
goog.graphics.ext.Element.prototype.getPixelScaleX = function() { 
  return this.getGraphics().getPixelScaleX(); 
}; 
goog.graphics.ext.Element.prototype.getPixelScaleY = function() { 
  return this.getGraphics().getPixelScaleY(); 
}; 
goog.graphics.ext.Element.prototype.disposeInternal = function() { 
  goog.graphics.ext.Element.superClass_.disposeInternal.call(); 
  this.wrapper_.dispose(); 
}; 
goog.graphics.ext.Element.PositionType_ = { 
  START: 0, 
  MIDDLE: 1, 
  END: 2 
}; 
goog.graphics.ext.Element.Position_ = function(element, horizontal) { 
  this.element_ = element; 
  this.horizontal_ = horizontal; 
}; 
goog.graphics.ext.Element.Position_.prototype.getCoordinateCache_ = function() { 
  return this.coordinateCache_ ||(this.coordinateCache_ = { }); 
}; 
goog.graphics.ext.Element.Position_.prototype.getParentSize_ = function() { 
  var parent = this.element_.getParent(); 
  return this.horizontal_ ? parent.getCoordinateWidth(): parent.getCoordinateHeight(); 
}; 
goog.graphics.ext.Element.Position_.prototype.getMinSize = function() { 
  return this.getValue_(this.minSize_); 
}; 
goog.graphics.ext.Element.Position_.prototype.setMinSize = function(minSize) { 
  this.minSize_ = minSize; 
  this.resetCache(); 
}; 
goog.graphics.ext.Element.Position_.prototype.getSize = function() { 
  return Math.max(this.getValue_(this.size_), this.getMinSize()); 
}; 
goog.graphics.ext.Element.Position_.prototype.setSize = function(size) { 
  if(size != this.size_) { 
    this.size_ = size; 
    this.resetCache(); 
    return true; 
  } 
  return false; 
}; 
goog.graphics.ext.Element.Position_.prototype.getValue_ = function(v, opt_forMaximum) { 
  if(! goog.graphics.ext.coordinates.isSpecial(v)) { 
    return parseFloat(String(v)); 
  } 
  var cache = this.getCoordinateCache_(); 
  var scale = this.horizontal_ ? this.element_.getPixelScaleX(): this.element_.getPixelScaleY(); 
  var containerSize; 
  if(opt_forMaximum) { 
    containerSize = goog.graphics.ext.coordinates.computeValue(this.size_ || 0, 0, scale); 
  } else { 
    var parent = this.element_.getParent(); 
    containerSize = this.horizontal_ ? parent.getWidth(): parent.getHeight(); 
  } 
  return goog.graphics.ext.coordinates.getValue(v, opt_forMaximum, containerSize, scale, cache); 
}; 
goog.graphics.ext.Element.Position_.prototype.getStart = function() { 
  if(this.cachedValue_ == null) { 
    var value = this.getValue_(this.distance_); 
    if(this.distanceType_ == goog.graphics.ext.Element.PositionType_.START) { 
      this.cachedValue_ = value; 
    } else if(this.distanceType_ == goog.graphics.ext.Element.PositionType_.MIDDLE) { 
      this.cachedValue_ = value +(this.getParentSize_() - this.getSize()) / 2; 
    } else { 
      this.cachedValue_ = this.getParentSize_() - value - this.getSize(); 
    } 
  } 
  return this.cachedValue_; 
}; 
goog.graphics.ext.Element.Position_.prototype.getMiddle = function() { 
  return this.distanceType_ == goog.graphics.ext.Element.PositionType_.MIDDLE ? this.getValue_(this.distance_):(this.getParentSize_() - this.getSize()) / 2 - this.getStart(); 
}; 
goog.graphics.ext.Element.Position_.prototype.getEnd = function() { 
  return this.distanceType_ == goog.graphics.ext.Element.PositionType_.END ? this.getValue_(this.distance_): this.getParentSize_() - this.getStart() - this.getSize(); 
}; 
goog.graphics.ext.Element.Position_.prototype.setPosition = function(value, type) { 
  this.distance_ = value; 
  this.distanceType_ = type; 
  this.cachedValue_ = null; 
}; 
goog.graphics.ext.Element.Position_.prototype.getMaxPosition = function() { 
  return this.getValue_(this.distance_ || 0) +(goog.graphics.ext.coordinates.isSpecial(this.size_) ? 0: this.getSize()); 
}; 
goog.graphics.ext.Element.Position_.prototype.resetCache = function() { 
  this.coordinateCache_ = null; 
  this.cachedValue_ = null; 
}; 
goog.graphics.ext.Element.Position_.prototype.isParentDependent = function() { 
  return this.distanceType_ != goog.graphics.ext.Element.PositionType_.START || goog.graphics.ext.coordinates.isSpecial(this.size_) || goog.graphics.ext.coordinates.isSpecial(this.minSize_) || goog.graphics.ext.coordinates.isSpecial(this.distance_); 
}; 
goog.graphics.ext.Element.Position_.prototype.cachedValue_ = null; 
goog.graphics.ext.Element.Position_.prototype.coordinateCache_ = null; 
goog.graphics.ext.Element.Position_.prototype.minSize_ = 0; 
goog.graphics.ext.Element.Position_.prototype.size_ = 0; 
goog.graphics.ext.Element.Position_.prototype.distance_ = 0; 
goog.graphics.ext.Element.Position_.prototype.distanceType_ = goog.graphics.ext.Element.PositionType_.START; 
