
goog.provide('goog.graphics.VmlEllipseElement'); 
goog.provide('goog.graphics.VmlGroupElement'); 
goog.provide('goog.graphics.VmlImageElement'); 
goog.provide('goog.graphics.VmlPathElement'); 
goog.provide('goog.graphics.VmlRectElement'); 
goog.provide('goog.graphics.VmlTextElement'); 
goog.require('goog.dom'); 
goog.require('goog.graphics.EllipseElement'); 
goog.require('goog.graphics.GroupElement'); 
goog.require('goog.graphics.ImageElement'); 
goog.require('goog.graphics.PathElement'); 
goog.require('goog.graphics.RectElement'); 
goog.require('goog.graphics.TextElement'); 
goog.graphics.vmlGetElement_ = function() { 
  this.element_ = this.getGraphics().getVmlElement(this.id_) || this.element_; 
  return this.element_; 
}; 
goog.graphics.VmlGroupElement = function(element, graphics) { 
  this.id_ = element.id; 
  goog.graphics.GroupElement.call(this, element, graphics); 
}; 
goog.inherits(goog.graphics.VmlGroupElement, goog.graphics.GroupElement); 
goog.graphics.VmlGroupElement.prototype.getElement = goog.graphics.vmlGetElement_; 
goog.graphics.VmlGroupElement.prototype.clear = function() { 
  goog.dom.removeChildren(this.getElement()); 
}; 
goog.graphics.VmlGroupElement.prototype.isRootElement_ = function() { 
  return this.getGraphics().getCanvasElement() == this; 
}; 
goog.graphics.VmlGroupElement.prototype.setSize = function(width, height) { 
  var element = this.getElement(); 
  var style = element.style; 
  style.width = goog.graphics.VmlGraphics.toSizePx(width); 
  style.height = goog.graphics.VmlGraphics.toSizePx(height); 
  element.coordsize = goog.graphics.VmlGraphics.toSizeCoord(width) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(height); 
  if(! this.isRootElement_()) { 
    element.coordorigin = '0 0'; 
  } 
}; 
goog.graphics.VmlEllipseElement = function(element, graphics, cx, cy, rx, ry, stroke, fill) { 
  this.id_ = element.id; 
  goog.graphics.EllipseElement.call(this, element, graphics, stroke, fill); 
  this.cx = cx; 
  this.cy = cy; 
  this.rx = rx; 
  this.ry = ry; 
}; 
goog.inherits(goog.graphics.VmlEllipseElement, goog.graphics.EllipseElement); 
goog.graphics.VmlEllipseElement.prototype.getElement = goog.graphics.vmlGetElement_; 
goog.graphics.VmlEllipseElement.prototype.setCenter = function(cx, cy) { 
  this.cx = cx; 
  this.cy = cy; 
  goog.graphics.VmlGraphics.setPositionAndSize(this.getElement(), cx - this.rx, cy - this.ry, this.rx * 2, this.ry * 2); 
}; 
goog.graphics.VmlEllipseElement.prototype.setRadius = function(rx, ry) { 
  this.rx = rx; 
  this.ry = ry; 
  goog.graphics.VmlGraphics.setPositionAndSize(this.getElement(), this.cx - rx, this.cy - ry, rx * 2, ry * 2); 
}; 
goog.graphics.VmlRectElement = function(element, graphics, stroke, fill) { 
  this.id_ = element.id; 
  goog.graphics.RectElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.VmlRectElement, goog.graphics.RectElement); 
goog.graphics.VmlRectElement.prototype.getElement = goog.graphics.vmlGetElement_; 
goog.graphics.VmlRectElement.prototype.setPosition = function(x, y) { 
  var style = this.getElement().style; 
  style.left = goog.graphics.VmlGraphics.toPosPx(x); 
  style.top = goog.graphics.VmlGraphics.toPosPx(y); 
}; 
goog.graphics.VmlRectElement.prototype.setSize = function(width, height) { 
  var style = this.getElement().style; 
  style.width = goog.graphics.VmlGraphics.toSizePx(width); 
  style.height = goog.graphics.VmlGraphics.toSizePx(height); 
}; 
goog.graphics.VmlPathElement = function(element, graphics, stroke, fill) { 
  this.id_ = element.id; 
  goog.graphics.PathElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.VmlPathElement, goog.graphics.PathElement); 
goog.graphics.VmlPathElement.prototype.getElement = goog.graphics.vmlGetElement_; 
goog.graphics.VmlPathElement.prototype.setPath = function(path) { 
  goog.graphics.VmlGraphics.setAttribute(this.getElement(), 'path', goog.graphics.VmlGraphics.getVmlPath(path)); 
}; 
goog.graphics.VmlTextElement = function(element, graphics, stroke, fill) { 
  this.id_ = element.id; 
  goog.graphics.TextElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.VmlTextElement, goog.graphics.TextElement); 
goog.graphics.VmlTextElement.prototype.getElement = goog.graphics.vmlGetElement_; 
goog.graphics.VmlTextElement.prototype.setText = function(text) { 
  goog.graphics.VmlGraphics.setAttribute(this.getElement().childNodes[1], 'string', text); 
}; 
goog.graphics.VmlImageElement = function(element, graphics) { 
  this.id_ = element.id; 
  goog.graphics.ImageElement.call(this, element, graphics); 
}; 
goog.inherits(goog.graphics.VmlImageElement, goog.graphics.ImageElement); 
goog.graphics.VmlImageElement.prototype.getElement = goog.graphics.vmlGetElement_; 
goog.graphics.VmlImageElement.prototype.setPosition = function(x, y) { 
  var style = this.getElement().style; 
  style.left = goog.graphics.VmlGraphics.toPosPx(x); 
  style.top = goog.graphics.VmlGraphics.toPosPx(y); 
}; 
goog.graphics.VmlImageElement.prototype.setSize = function(width, height) { 
  var style = this.getElement().style; 
  style.width = goog.graphics.VmlGraphics.toPosPx(width); 
  style.height = goog.graphics.VmlGraphics.toPosPx(height); 
}; 
goog.graphics.VmlImageElement.prototype.setSource = function(src) { 
  goog.graphics.VmlGraphics.setAttribute(this.getElement(), 'src', src); 
}; 
