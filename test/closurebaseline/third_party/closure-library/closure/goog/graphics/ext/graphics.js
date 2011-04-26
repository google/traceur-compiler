
goog.provide('goog.graphics.ext.Graphics'); 
goog.require('goog.events.EventType'); 
goog.require('goog.graphics.ext.Group'); 
goog.graphics.ext.Graphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper, opt_isSimple) { 
  var surface = opt_isSimple ? goog.graphics.createSimpleGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper): goog.graphics.createGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
  this.implementation_ = surface; 
  goog.graphics.ext.Group.call(this, null, surface.getCanvasElement()); 
  goog.events.listen(surface, goog.events.EventType.RESIZE, this.updateChildren, false, this); 
}; 
goog.inherits(goog.graphics.ext.Graphics, goog.graphics.ext.Group); 
goog.graphics.ext.Graphics.prototype.implementation_; 
goog.graphics.ext.Graphics.prototype.getImplementation = function() { 
  return this.implementation_; 
}; 
goog.graphics.ext.Graphics.prototype.setCoordSize = function(coordWidth, coordHeight) { 
  this.implementation_.setCoordSize(coordWidth, coordHeight); 
  goog.graphics.ext.Graphics.superClass_.setSize.call(this, coordWidth, coordHeight); 
}; 
goog.graphics.ext.Graphics.prototype.getCoordSize = function() { 
  return this.implementation_.getCoordSize(); 
}; 
goog.graphics.ext.Graphics.prototype.setCoordOrigin = function(left, top) { 
  this.implementation_.setCoordOrigin(left, top); 
}; 
goog.graphics.ext.Graphics.prototype.getCoordOrigin = function() { 
  return this.implementation_.getCoordOrigin(); 
}; 
goog.graphics.ext.Graphics.prototype.setPixelSize = function(pixelWidth, pixelHeight) { 
  this.implementation_.setSize(pixelWidth, pixelHeight); 
  var coordSize = this.getCoordSize(); 
  goog.graphics.ext.Graphics.superClass_.setSize.call(this, coordSize.width, coordSize.height); 
}; 
goog.graphics.ext.Graphics.prototype.getPixelSize = function() { 
  return this.implementation_.getPixelSize(); 
}; 
goog.graphics.ext.Graphics.prototype.getWidth = function() { 
  return this.implementation_.getCoordSize().width; 
}; 
goog.graphics.ext.Graphics.prototype.getHeight = function() { 
  return this.implementation_.getCoordSize().height; 
}; 
goog.graphics.ext.Graphics.prototype.getPixelScaleX = function() { 
  return this.implementation_.getPixelScaleX(); 
}; 
goog.graphics.ext.Graphics.prototype.getPixelScaleY = function() { 
  return this.implementation_.getPixelScaleY(); 
}; 
goog.graphics.ext.Graphics.prototype.getElement = function() { 
  return this.implementation_.getElement(); 
}; 
goog.graphics.ext.Graphics.prototype.render = function(parentElement) { 
  this.implementation_.render(parentElement); 
}; 
goog.graphics.ext.Graphics.prototype.transform = goog.nullFunction; 
goog.graphics.ext.Graphics.prototype.redraw = function() { 
  this.transformChildren(); 
}; 
