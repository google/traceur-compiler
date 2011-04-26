
goog.provide('goog.graphics.ext.Ellipse'); 
goog.require('goog.graphics.ext.StrokeAndFillElement'); 
goog.graphics.ext.Ellipse = function(group) { 
  var wrapper = group.getGraphicsImplementation().drawEllipse(1, 1, 2, 2, null, null, group.getWrapper()); 
  goog.graphics.ext.StrokeAndFillElement.call(this, group, wrapper); 
}; 
goog.inherits(goog.graphics.ext.Ellipse, goog.graphics.ext.StrokeAndFillElement); 
goog.graphics.ext.Ellipse.prototype.redraw = function() { 
  goog.graphics.ext.Ellipse.superClass_.redraw.call(this); 
  var xRadius = this.getWidth() / 2; 
  var yRadius = this.getHeight() / 2; 
  var wrapper = this.getWrapper(); 
  wrapper.setCenter(xRadius, yRadius); 
  wrapper.setRadius(xRadius, yRadius); 
}; 
