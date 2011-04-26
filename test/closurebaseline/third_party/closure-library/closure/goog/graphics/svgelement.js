
goog.provide('goog.graphics.SvgEllipseElement'); 
goog.provide('goog.graphics.SvgGroupElement'); 
goog.provide('goog.graphics.SvgImageElement'); 
goog.provide('goog.graphics.SvgPathElement'); 
goog.provide('goog.graphics.SvgRectElement'); 
goog.provide('goog.graphics.SvgTextElement'); 
goog.require('goog.dom'); 
goog.require('goog.graphics.EllipseElement'); 
goog.require('goog.graphics.GroupElement'); 
goog.require('goog.graphics.ImageElement'); 
goog.require('goog.graphics.PathElement'); 
goog.require('goog.graphics.RectElement'); 
goog.require('goog.graphics.TextElement'); 
goog.graphics.SvgGroupElement = function(element, graphics) { 
  goog.graphics.GroupElement.call(this, element, graphics); 
}; 
goog.inherits(goog.graphics.SvgGroupElement, goog.graphics.GroupElement); 
goog.graphics.SvgGroupElement.prototype.clear = function() { 
  goog.dom.removeChildren(this.getElement()); 
}; 
goog.graphics.SvgGroupElement.prototype.setSize = function(width, height) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'width': width, 
    'height': height 
  }); 
}; 
goog.graphics.SvgEllipseElement = function(element, graphics, stroke, fill) { 
  goog.graphics.EllipseElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.SvgEllipseElement, goog.graphics.EllipseElement); 
goog.graphics.SvgEllipseElement.prototype.setCenter = function(cx, cy) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'cx': cx, 
    'cy': cy 
  }); 
}; 
goog.graphics.SvgEllipseElement.prototype.setRadius = function(rx, ry) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'rx': rx, 
    'ry': ry 
  }); 
}; 
goog.graphics.SvgRectElement = function(element, graphics, stroke, fill) { 
  goog.graphics.RectElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.SvgRectElement, goog.graphics.RectElement); 
goog.graphics.SvgRectElement.prototype.setPosition = function(x, y) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'x': x, 
    'y': y 
  }); 
}; 
goog.graphics.SvgRectElement.prototype.setSize = function(width, height) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'width': width, 
    'height': height 
  }); 
}; 
goog.graphics.SvgPathElement = function(element, graphics, stroke, fill) { 
  goog.graphics.PathElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.SvgPathElement, goog.graphics.PathElement); 
goog.graphics.SvgPathElement.prototype.setPath = function(path) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 'd': goog.graphics.SvgGraphics.getSvgPath(path) }); 
}; 
goog.graphics.SvgTextElement = function(element, graphics, stroke, fill) { 
  goog.graphics.TextElement.call(this, element, graphics, stroke, fill); 
}; 
goog.inherits(goog.graphics.SvgTextElement, goog.graphics.TextElement); 
goog.graphics.SvgTextElement.prototype.setText = function(text) { 
  this.getElement().firstChild.data = text; 
}; 
goog.graphics.SvgImageElement = function(element, graphics) { 
  goog.graphics.ImageElement.call(this, element, graphics); 
}; 
goog.inherits(goog.graphics.SvgImageElement, goog.graphics.ImageElement); 
goog.graphics.SvgImageElement.prototype.setPosition = function(x, y) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'x': x, 
    'y': y 
  }); 
}; 
goog.graphics.SvgImageElement.prototype.setSize = function(width, height) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 
    'width': width, 
    'height': height 
  }); 
}; 
goog.graphics.SvgImageElement.prototype.setSource = function(src) { 
  this.getGraphics().setElementAttributes(this.getElement(), { 'xlink:href': src }); 
}; 
