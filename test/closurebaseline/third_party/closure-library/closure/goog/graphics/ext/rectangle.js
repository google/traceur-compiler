
goog.provide('goog.graphics.ext.Rectangle'); 
goog.require('goog.graphics.ext.StrokeAndFillElement'); 
goog.graphics.ext.Rectangle = function(group) { 
  var wrapper = group.getGraphicsImplementation().drawRect(0, 0, 1, 1, null, null, group.getWrapper()); 
  goog.graphics.ext.StrokeAndFillElement.call(this, group, wrapper); 
}; 
goog.inherits(goog.graphics.ext.Rectangle, goog.graphics.ext.StrokeAndFillElement); 
goog.graphics.ext.Rectangle.prototype.redraw = function() { 
  goog.graphics.ext.Rectangle.superClass_.redraw.call(this); 
  this.getWrapper().setSize(this.getWidth(), this.getHeight()); 
}; 
