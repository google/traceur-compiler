
goog.provide('goog.graphics.ext.Group'); 
goog.require('goog.graphics.ext.Element'); 
goog.graphics.ext.Group = function(group, opt_wrapper) { 
  opt_wrapper = opt_wrapper || group.getGraphicsImplementation().createGroup(group.getWrapper()); 
  goog.graphics.ext.Element.call(this, group, opt_wrapper); 
  this.children_ =[]; 
}; 
goog.inherits(goog.graphics.ext.Group, goog.graphics.ext.Element); 
goog.graphics.ext.Group.prototype.addChild = function(element, opt_chain) { 
  if(! goog.array.contains(this.children_, element)) { 
    this.children_.push(element); 
  } 
  var transformed = this.growToFit_(element); 
  if(element.isParentDependent()) { 
    element.parentTransform(); 
  } 
  if(! opt_chain && element.isPendingTransform()) { 
    element.reset(); 
  } 
  if(transformed) { 
    this.reset(); 
  } 
}; 
goog.graphics.ext.Group.prototype.removeChild = function(element) { 
  goog.array.remove(this.children_, element); 
  this.getGraphicsImplementation().removeElement(element.getWrapper()); 
}; 
goog.graphics.ext.Group.prototype.forEachChild = function(f, opt_obj) { 
  if(this.children_) { 
    goog.array.forEach(this.children_, f, opt_obj); 
  } 
}; 
goog.graphics.ext.Group.prototype.getWrapper; 
goog.graphics.ext.Group.prototype.reset = function() { 
  goog.graphics.ext.Group.superClass_.reset.call(this); 
  this.updateChildren(); 
}; 
goog.graphics.ext.Group.prototype.redraw = function() { 
  this.getWrapper().setSize(this.getWidth(), this.getHeight()); 
  this.transformChildren(); 
}; 
goog.graphics.ext.Group.prototype.transformChildren = function() { 
  this.forEachChild(function(child) { 
    if(child.isParentDependent()) { 
      child.parentTransform(); 
    } 
  }); 
}; 
goog.graphics.ext.Group.prototype.updateChildren = function() { 
  this.forEachChild(function(child) { 
    if(child.isParentDependent() || child.isPendingTransform()) { 
      child.reset(); 
    } else if(child.updateChildren) { 
      child.updateChildren(); 
    } 
  }); 
}; 
goog.graphics.ext.Group.prototype.growToFit_ = function(element) { 
  var transformed = false; 
  var x = element.getMaxX(); 
  if(x > this.getWidth()) { 
    this.setMinWidth(x); 
    transformed = true; 
  } 
  var y = element.getMaxY(); 
  if(y > this.getHeight()) { 
    this.setMinHeight(y); 
    transformed = true; 
  } 
  return transformed; 
}; 
goog.graphics.ext.Group.prototype.getCoordinateWidth = function() { 
  return this.getWidth(); 
}; 
goog.graphics.ext.Group.prototype.getCoordinateHeight = function() { 
  return this.getHeight(); 
}; 
goog.graphics.ext.Group.prototype.clear = function() { 
  while(this.children_.length) { 
    this.removeChild(this.children_[0]); 
  } 
}; 
