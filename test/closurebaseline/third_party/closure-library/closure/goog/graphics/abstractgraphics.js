
goog.provide('goog.graphics.AbstractGraphics'); 
goog.require('goog.graphics.Path'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Size'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.graphics.AbstractGraphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.width = width; 
  this.height = height; 
  this.coordWidth = opt_coordWidth || null; 
  this.coordHeight = opt_coordHeight || null; 
}; 
goog.inherits(goog.graphics.AbstractGraphics, goog.ui.Component); 
goog.graphics.AbstractGraphics.prototype.canvasElement = null; 
goog.graphics.AbstractGraphics.prototype.coordLeft = 0; 
goog.graphics.AbstractGraphics.prototype.coordTop = 0; 
goog.graphics.AbstractGraphics.prototype.getCanvasElement = function() { 
  return this.canvasElement; 
}; 
goog.graphics.AbstractGraphics.prototype.setCoordSize = function(coordWidth, coordHeight) { 
  this.coordWidth = coordWidth; 
  this.coordHeight = coordHeight; 
}; 
goog.graphics.AbstractGraphics.prototype.getCoordSize = function() { 
  if(this.coordWidth) { 
    return new goog.math.Size(this.coordWidth,(this.coordHeight)); 
  } else { 
    return this.getPixelSize(); 
  } 
}; 
goog.graphics.AbstractGraphics.prototype.setCoordOrigin = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.getCoordOrigin = function() { 
  return new goog.math.Coordinate(this.coordLeft, this.coordTop); 
}; 
goog.graphics.AbstractGraphics.prototype.setSize = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.getSize = function() { 
  return this.getPixelSize(); 
}; 
goog.graphics.AbstractGraphics.prototype.getPixelSize = function() { 
  if(this.isInDocument()) { 
    return goog.style.getSize(this.getElement()); 
  } 
  if(goog.isNumber(this.width) && goog.isNumber(this.height)) { 
    return new goog.math.Size(this.width, this.height); 
  } 
  return null; 
}; 
goog.graphics.AbstractGraphics.prototype.getPixelScaleX = function() { 
  var pixelSize = this.getPixelSize(); 
  return pixelSize ? pixelSize.width / this.getCoordSize().width: 0; 
}; 
goog.graphics.AbstractGraphics.prototype.getPixelScaleY = function() { 
  var pixelSize = this.getPixelSize(); 
  return pixelSize ? pixelSize.height / this.getCoordSize().height: 0; 
}; 
goog.graphics.AbstractGraphics.prototype.clear = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.removeElement = function(element) { 
  goog.dom.removeNode(element.getElement()); 
}; 
goog.graphics.AbstractGraphics.prototype.setElementFill = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.setElementStroke = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.setElementTransform = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.drawCircle = function(cx, cy, r, stroke, fill, opt_group) { 
  return this.drawEllipse(cx, cy, r, r, stroke, fill, opt_group); 
}; 
goog.graphics.AbstractGraphics.prototype.drawEllipse = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.drawRect = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.drawText = function(text, x, y, width, height, align, vAlign, font, stroke, fill, opt_group) { 
  var baseline = font.size / 2; 
  var textY; 
  if(vAlign == 'bottom') { 
    textY = y + height - baseline; 
  } else if(vAlign == 'center') { 
    textY = y + height / 2; 
  } else { 
    textY = y + baseline; 
  } 
  return this.drawTextOnLine(text, x, textY, x + width, textY, align, font, stroke, fill, opt_group); 
}; 
goog.graphics.AbstractGraphics.prototype.drawTextOnLine = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.drawPath = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.createGroup = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.createPath = function() { 
  return new goog.graphics.Path(); 
}; 
goog.graphics.AbstractGraphics.prototype.getTextWidth = goog.abstractMethod; 
goog.graphics.AbstractGraphics.prototype.isDomClonable = function() { 
  return false; 
}; 
goog.graphics.AbstractGraphics.prototype.suspend = function() { }; 
goog.graphics.AbstractGraphics.prototype.resume = function() { }; 
