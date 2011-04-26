
goog.provide('goog.graphics.CanvasGraphics'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventType'); 
goog.require('goog.graphics.AbstractGraphics'); 
goog.require('goog.graphics.CanvasEllipseElement'); 
goog.require('goog.graphics.CanvasGroupElement'); 
goog.require('goog.graphics.CanvasImageElement'); 
goog.require('goog.graphics.CanvasPathElement'); 
goog.require('goog.graphics.CanvasRectElement'); 
goog.require('goog.graphics.CanvasTextElement'); 
goog.require('goog.graphics.Font'); 
goog.require('goog.graphics.LinearGradient'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Stroke'); 
goog.require('goog.math.Size'); 
goog.graphics.CanvasGraphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) { 
  goog.graphics.AbstractGraphics.call(this, width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
}; 
goog.inherits(goog.graphics.CanvasGraphics, goog.graphics.AbstractGraphics); 
goog.graphics.CanvasGraphics.prototype.setElementFill = function(element, fill) { 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.setElementStroke = function(element, stroke) { 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.setElementTransform = function(element, x, y, angle, centerX, centerY) { 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.pushElementTransform = function(element) { 
  var ctx = this.getContext(); 
  ctx.save(); 
  var transform = element.getTransform(); 
  var tx = transform.getTranslateX(); 
  var ty = transform.getTranslateY(); 
  if(tx || ty) { 
    ctx.translate(tx, ty); 
  } 
  var sinTheta = transform.getShearY(); 
  if(sinTheta) { 
    ctx.rotate(Math.asin(sinTheta)); 
  } 
}; 
goog.graphics.CanvasGraphics.prototype.popElementTransform = function() { 
  this.getContext().restore(); 
}; 
goog.graphics.CanvasGraphics.prototype.createDom = function() { 
  var element = this.dom_.createDom('div', { 'style': 'position:relative;overflow:hidden' }); 
  this.setElementInternal(element); 
  this.canvas_ = this.dom_.createDom('canvas'); 
  element.appendChild(this.canvas_); 
  this.canvasElement = new goog.graphics.CanvasGroupElement(this); 
  this.lastGroup_ = this.canvasElement; 
  this.redrawTimeout_ = 0; 
  this.updateSize(); 
}; 
goog.graphics.CanvasGraphics.prototype.clearContext_ = function() { 
  this.context_ = null; 
}; 
goog.graphics.CanvasGraphics.prototype.getContext = function() { 
  if(! this.getElement()) { 
    this.createDom(); 
  } 
  if(! this.context_) { 
    this.context_ = this.canvas_.getContext('2d'); 
    this.context_.save(); 
  } 
  return this.context_; 
}; 
goog.graphics.CanvasGraphics.prototype.setCoordOrigin = function(left, top) { 
  this.coordLeft = left; 
  this.coordTop = top; 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.setCoordSize = function(coordWidth, coordHeight) { 
  goog.graphics.CanvasGraphics.superClass_.setCoordSize.apply(this, arguments); 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.setSize = function(pixelWidth, pixelHeight) { 
  this.width = pixelWidth; 
  this.height = pixelHeight; 
  this.updateSize(); 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.getPixelSize = function() { 
  var width = this.width; 
  var height = this.height; 
  var computeWidth = goog.isString(width) && width.indexOf('%') != - 1; 
  var computeHeight = goog.isString(height) && height.indexOf('%') != - 1; 
  if(! this.isInDocument() &&(computeWidth || computeHeight)) { 
    return null; 
  } 
  var parent; 
  var parentSize; 
  if(computeWidth) { 
    parent =(this.getElement().parentNode); 
    parentSize = goog.style.getSize(parent); 
    width = parseFloat((width)) * parentSize.width / 100; 
  } 
  if(computeHeight) { 
    parent = parent ||(this.getElement().parentNode); 
    parentSize = parentSize || goog.style.getSize(parent); 
    height = parseFloat((height)) * parentSize.height / 100; 
  } 
  return new goog.math.Size((width),(height)); 
}; 
goog.graphics.CanvasGraphics.prototype.updateSize = function() { 
  goog.style.setSize(this.getElement(), this.width, this.height); 
  var pixels = this.getPixelSize(); 
  if(pixels) { 
    goog.style.setSize(this.canvas_,(pixels.width),(pixels.height)); 
    this.canvas_.width = pixels.width; 
    this.canvas_.height = pixels.height; 
    this.clearContext_(); 
  } 
}; 
goog.graphics.CanvasGraphics.prototype.reset = function() { 
  var ctx = this.getContext(); 
  ctx.restore(); 
  var size = this.getPixelSize(); 
  if(size.width && size.height) { 
    ctx.clearRect(0, 0, size.width, size.height); 
  } 
  ctx.save(); 
}; 
goog.graphics.CanvasGraphics.prototype.clear = function() { 
  this.reset(); 
  this.canvasElement.clear(); 
  var el = this.getElement(); 
  while(el.childNodes.length > 1) { 
    el.removeChild(el.lastChild); 
  } 
}; 
goog.graphics.CanvasGraphics.prototype.redraw = function() { 
  if(this.preventRedraw_) { 
    this.needsRedraw_ = true; 
    return; 
  } 
  if(this.isInDocument()) { 
    this.reset(); 
    if(this.coordWidth) { 
      var pixels = this.getPixelSize(); 
      this.getContext().scale(pixels.width / this.coordWidth, pixels.height / this.coordHeight); 
    } 
    if(this.coordLeft || this.coordTop) { 
      this.getContext().translate(- this.coordLeft, - this.coordTop); 
    } 
    this.pushElementTransform(this.canvasElement); 
    this.canvasElement.draw(this.context_); 
    this.popElementTransform(); 
  } 
}; 
goog.graphics.CanvasGraphics.prototype.drawElement = function(element) { 
  if(element instanceof goog.graphics.CanvasTextElement) { 
    return; 
  } 
  var ctx = this.getContext(); 
  this.pushElementTransform(element); 
  if(! element.getFill || ! element.getStroke) { 
    element.draw(ctx); 
    this.popElementTransform(); 
    return; 
  } 
  var fill = element.getFill(); 
  if(fill) { 
    if(fill instanceof goog.graphics.SolidFill) { 
      if(fill.getOpacity() != 0) { 
        ctx.globalAlpha = fill.getOpacity(); 
        ctx.fillStyle = fill.getColor(); 
        element.draw(ctx); 
        ctx.fill(); 
        ctx.globalAlpha = 1; 
      } 
    } else { 
      var linearGradient = ctx.createLinearGradient(fill.getX1(), fill.getY1(), fill.getX2(), fill.getY2()); 
      linearGradient.addColorStop(0.0, fill.getColor1()); 
      linearGradient.addColorStop(1.0, fill.getColor2()); 
      ctx.fillStyle = linearGradient; 
      element.draw(ctx); 
      ctx.fill(); 
    } 
  } 
  var stroke = element.getStroke(); 
  if(stroke) { 
    element.draw(ctx); 
    ctx.strokeStyle = stroke.getColor(); 
    var width = stroke.getWidth(); 
    if(goog.isString(width) && width.indexOf('px') != - 1) { 
      width = parseFloat(width) / this.getPixelScaleX(); 
    } 
    ctx.lineWidth = width; 
    ctx.stroke(); 
  } 
  this.popElementTransform(); 
}; 
goog.graphics.CanvasGraphics.prototype.append_ = function(element, group) { 
  group = group || this.canvasElement; 
  group.appendChild(element); 
  if(this.isDrawable(group)) { 
    this.drawElement(element); 
  } 
}; 
goog.graphics.CanvasGraphics.prototype.drawEllipse = function(cx, cy, rx, ry, stroke, fill, opt_group) { 
  var element = new goog.graphics.CanvasEllipseElement(null, this, cx, cy, rx, ry, stroke, fill); 
  this.append_(element, opt_group); 
  return element; 
}; 
goog.graphics.CanvasGraphics.prototype.drawRect = function(x, y, width, height, stroke, fill, opt_group) { 
  var element = new goog.graphics.CanvasRectElement(null, this, x, y, width, height, stroke, fill); 
  this.append_(element, opt_group); 
  return element; 
}; 
goog.graphics.CanvasGraphics.prototype.drawImage = function(x, y, width, height, src, opt_group) { 
  var element = new goog.graphics.CanvasImageElement(null, this, x, y, width, height, src); 
  this.append_(element, opt_group); 
  return element; 
}; 
goog.graphics.CanvasGraphics.prototype.drawTextOnLine = function(text, x1, y1, x2, y2, align, font, stroke, fill, opt_group) { 
  var element = new goog.graphics.CanvasTextElement(this, text, x1, y1, x2, y2, align, font, stroke, fill); 
  this.append_(element, opt_group); 
  return element; 
}; 
goog.graphics.CanvasGraphics.prototype.drawPath = function(path, stroke, fill, opt_group) { 
  var element = new goog.graphics.CanvasPathElement(null, this, path, stroke, fill); 
  this.append_(element, opt_group); 
  return element; 
}; 
goog.graphics.CanvasGraphics.prototype.isDrawable = function(group) { 
  return this.isInDocument() && ! this.redrawTimeout_ && ! this.isRedrawRequired(group); 
}; 
goog.graphics.CanvasGraphics.prototype.isRedrawRequired = function(group) { 
  return group != this.canvasElement && group != this.lastGroup_; 
}; 
goog.graphics.CanvasGraphics.prototype.createGroup = function(opt_group) { 
  var group = new goog.graphics.CanvasGroupElement(this); 
  opt_group = opt_group || this.canvasElement; 
  if(opt_group == this.canvasElement || opt_group == this.lastGroup_) { 
    this.lastGroup_ = group; 
  } 
  this.append_(group, opt_group); 
  return group; 
}; 
goog.graphics.CanvasGraphics.prototype.getTextWidth = goog.abstractMethod; 
goog.graphics.CanvasGraphics.prototype.disposeInternal = function() { 
  this.context_ = null; 
  goog.graphics.CanvasGraphics.superClass_.disposeInternal.call(this); 
}; 
goog.graphics.CanvasGraphics.prototype.enterDocument = function() { 
  var oldPixelSize = this.getPixelSize(); 
  goog.graphics.CanvasGraphics.superClass_.enterDocument.call(this); 
  if(! oldPixelSize) { 
    this.updateSize(); 
    this.dispatchEvent(goog.events.EventType.RESIZE); 
  } 
  this.redraw(); 
}; 
goog.graphics.CanvasGraphics.prototype.suspend = function() { 
  this.preventRedraw_ = true; 
}; 
goog.graphics.CanvasGraphics.prototype.resume = function() { 
  this.preventRedraw_ = false; 
  if(this.needsRedraw_) { 
    this.redraw(); 
    this.needsRedraw_ = false; 
  } 
}; 
