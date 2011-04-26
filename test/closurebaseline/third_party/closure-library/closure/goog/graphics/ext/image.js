
goog.provide('goog.graphics.ext.Image'); 
goog.require('goog.graphics.ext.Element'); 
goog.graphics.ext.Image = function(group, src) { 
  var wrapper = group.getGraphicsImplementation().drawImage(0, 0, 1, 1, src, group.getWrapper()); 
  goog.graphics.ext.Element.call(this, group, wrapper); 
}; 
goog.inherits(goog.graphics.ext.Image, goog.graphics.ext.Element); 
goog.graphics.ext.Image.prototype.redraw = function() { 
  goog.graphics.ext.Image.superClass_.redraw.call(this); 
  this.getWrapper().setSize(this.getWidth(), this.getHeight()); 
}; 
goog.graphics.ext.Image.prototype.setSource = function(src) { 
  this.getWrapper().setSource(src); 
}; 
