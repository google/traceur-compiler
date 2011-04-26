
goog.provide('goog.graphics.ext.Shape'); 
goog.require('goog.graphics.ext.Path'); 
goog.require('goog.graphics.ext.StrokeAndFillElement'); 
goog.require('goog.math.Rect'); 
goog.graphics.ext.Shape = function(group, path, opt_autoSize) { 
  this.autoSize_ = ! ! opt_autoSize; 
  var graphics = group.getGraphicsImplementation(); 
  var wrapper = graphics.drawPath(path, null, null, group.getWrapper()); 
  goog.graphics.ext.StrokeAndFillElement.call(this, group, wrapper); 
  this.setPath(path); 
}; 
goog.inherits(goog.graphics.ext.Shape, goog.graphics.ext.StrokeAndFillElement); 
goog.graphics.ext.Shape.prototype.autoSize_ = false; 
goog.graphics.ext.Shape.prototype.path_; 
goog.graphics.ext.Shape.prototype.boundingBox_ = null; 
goog.graphics.ext.Shape.prototype.scaledPath_; 
goog.graphics.ext.Shape.prototype.getPath = function() { 
  return this.path_; 
}; 
goog.graphics.ext.Shape.prototype.setPath = function(path) { 
  this.path_ = path; 
  if(this.autoSize_) { 
    this.boundingBox_ = path.getBoundingBox(); 
  } 
  this.scaleAndSetPath_(); 
}; 
goog.graphics.ext.Shape.prototype.scaleAndSetPath_ = function() { 
  this.scaledPath_ = this.boundingBox_ ? this.path_.clone().modifyBounds(- this.boundingBox_.left, - this.boundingBox_.top, this.getWidth() /(this.boundingBox_.width || 1), this.getHeight() /(this.boundingBox_.height || 1)): this.path_; 
  var wrapper = this.getWrapper(); 
  if(wrapper) { 
    wrapper.setPath(this.scaledPath_); 
  } 
}; 
goog.graphics.ext.Shape.prototype.redraw = function() { 
  goog.graphics.ext.Shape.superClass_.redraw.call(this); 
  if(this.autoSize_) { 
    this.scaleAndSetPath_(); 
  } 
}; 
goog.graphics.ext.Shape.prototype.checkParentDependent = function() { 
  return this.autoSize_ || goog.graphics.ext.Shape.superClass_.checkParentDependent.call(this); 
}; 
