
goog.provide('goog.graphics.SvgGraphics'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.graphics.AbstractGraphics'); 
goog.require('goog.graphics.Font'); 
goog.require('goog.graphics.LinearGradient'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Stroke'); 
goog.require('goog.graphics.SvgEllipseElement'); 
goog.require('goog.graphics.SvgGroupElement'); 
goog.require('goog.graphics.SvgImageElement'); 
goog.require('goog.graphics.SvgPathElement'); 
goog.require('goog.graphics.SvgRectElement'); 
goog.require('goog.graphics.SvgTextElement'); 
goog.require('goog.math.Size'); 
goog.require('goog.userAgent'); 
goog.graphics.SvgGraphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) { 
  goog.graphics.AbstractGraphics.call(this, width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
  this.defs_ = { }; 
  this.useManualViewbox_ = goog.userAgent.WEBKIT && ! goog.userAgent.isVersion(526); 
  this.handler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.graphics.SvgGraphics, goog.graphics.AbstractGraphics); 
goog.graphics.SvgGraphics.SVG_NS_ = 'http://www.w3.org/2000/svg'; 
goog.graphics.SvgGraphics.DEF_ID_PREFIX_ = '_svgdef_'; 
goog.graphics.SvgGraphics.nextDefId_ = 0; 
goog.graphics.SvgGraphics.prototype.defsElement_; 
goog.graphics.SvgGraphics.prototype.createSvgElement_ = function(tagName, opt_attributes) { 
  var element = this.dom_.getDocument().createElementNS(goog.graphics.SvgGraphics.SVG_NS_, tagName); 
  if(opt_attributes) { 
    this.setElementAttributes(element, opt_attributes); 
  } 
  return element; 
}; 
goog.graphics.SvgGraphics.prototype.setElementAttributes = function(element, attributes) { 
  for(var key in attributes) { 
    element.setAttribute(key, attributes[key]); 
  } 
}; 
goog.graphics.SvgGraphics.prototype.append_ = function(element, opt_group) { 
  var parent = opt_group || this.canvasElement; 
  parent.getElement().appendChild(element.getElement()); 
}; 
goog.graphics.SvgGraphics.prototype.setElementFill = function(element, fill) { 
  var svgElement = element.getElement(); 
  if(fill instanceof goog.graphics.SolidFill) { 
    svgElement.setAttribute('fill', fill.getColor()); 
    svgElement.setAttribute('fill-opacity', fill.getOpacity()); 
  } else if(fill instanceof goog.graphics.LinearGradient) { 
    var defKey = 'lg-' + fill.getX1() + '-' + fill.getY1() + '-' + fill.getX2() + '-' + fill.getY2() + '-' + fill.getColor1() + '-' + fill.getColor2(); 
    var id = this.getDef_(defKey); 
    if(! id) { 
      var gradient = this.createSvgElement_('linearGradient', { 
        'x1': fill.getX1(), 
        'y1': fill.getY1(), 
        'x2': fill.getX2(), 
        'y2': fill.getY2(), 
        'gradientUnits': 'userSpaceOnUse' 
      }); 
      var stop1 = this.createSvgElement_('stop', { 
        'offset': '0%', 
        'style': 'stop-color:' + fill.getColor1() 
      }); 
      gradient.appendChild(stop1); 
      var stop2 = this.createSvgElement_('stop', { 
        'offset': '100%', 
        'style': 'stop-color:' + fill.getColor2() 
      }); 
      gradient.appendChild(stop2); 
      id = this.addDef_(defKey, gradient); 
    } 
    svgElement.setAttribute('fill', 'url(#' + id + ')'); 
  } else { 
    svgElement.setAttribute('fill', 'none'); 
  } 
}; 
goog.graphics.SvgGraphics.prototype.setElementStroke = function(element, stroke) { 
  var svgElement = element.getElement(); 
  if(stroke) { 
    svgElement.setAttribute('stroke', stroke.getColor()); 
    var width = stroke.getWidth(); 
    if(goog.isString(width) && width.indexOf('px') != - 1) { 
      svgElement.setAttribute('stroke-width', parseFloat(width) / this.getPixelScaleX()); 
    } else { 
      svgElement.setAttribute('stroke-width', width); 
    } 
  } else { 
    svgElement.setAttribute('stroke', 'none'); 
  } 
}; 
goog.graphics.SvgGraphics.prototype.setElementTransform = function(element, x, y, angle, centerX, centerY) { 
  element.getElement().setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + angle + ' ' + centerX + ' ' + centerY + ')'); 
}; 
goog.graphics.SvgGraphics.prototype.createDom = function() { 
  var attributes = { 
    'width': this.width, 
    'height': this.height, 
    'overflow': 'hidden' 
  }; 
  var svgElement = this.createSvgElement_('svg', attributes); 
  var groupElement = this.createSvgElement_('g'); 
  this.defsElement_ = this.createSvgElement_('defs'); 
  this.canvasElement = new goog.graphics.SvgGroupElement(groupElement, this); 
  svgElement.appendChild(this.defsElement_); 
  svgElement.appendChild(groupElement); 
  this.setElementInternal(svgElement); 
  this.setViewBox_(); 
}; 
goog.graphics.SvgGraphics.prototype.setCoordOrigin = function(left, top) { 
  this.coordLeft = left; 
  this.coordTop = top; 
  this.setViewBox_(); 
}; 
goog.graphics.SvgGraphics.prototype.setCoordSize = function(coordWidth, coordHeight) { 
  goog.graphics.SvgGraphics.superClass_.setCoordSize.apply(this, arguments); 
  this.setViewBox_(); 
}; 
goog.graphics.SvgGraphics.prototype.getViewBox_ = function() { 
  return this.coordLeft + ' ' + this.coordTop + ' ' +(this.coordWidth ? this.coordWidth + ' ' + this.coordHeight: ''); 
}; 
goog.graphics.SvgGraphics.prototype.setViewBox_ = function() { 
  if(this.coordWidth || this.coordLeft || this.coordTop) { 
    this.getElement().setAttribute('preserveAspectRatio', 'none'); 
    if(this.useManualViewbox_) { 
      this.updateManualViewBox_(); 
    } else { 
      this.getElement().setAttribute('viewBox', this.getViewBox_()); 
    } 
  } 
}; 
goog.graphics.SvgGraphics.prototype.updateManualViewBox_ = function() { 
  if(! this.isInDocument() || !(this.coordWidth || this.coordLeft || ! this.coordTop)) { 
    return; 
  } 
  var size = this.getPixelSize(); 
  if(size.width == 0) { 
    this.getElement().style.visibility = 'hidden'; 
    return; 
  } 
  this.getElement().style.visibility = ''; 
  var offsetX = - this.coordLeft; 
  var offsetY = - this.coordTop; 
  var scaleX = size.width / this.coordWidth; 
  var scaleY = size.height / this.coordHeight; 
  this.canvasElement.getElement().setAttribute('transform', 'scale(' + scaleX + ' ' + scaleY + ') ' + 'translate(' + offsetX + ' ' + offsetY + ')'); 
}; 
goog.graphics.SvgGraphics.prototype.setSize = function(pixelWidth, pixelHeight) { }; 
goog.graphics.SvgGraphics.prototype.getPixelSize = function() { 
  if(! goog.userAgent.GECKO) { 
    return this.isInDocument() ? goog.style.getSize(this.getElement()): goog.base(this, 'getPixelSize'); 
  } 
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
goog.graphics.SvgGraphics.prototype.clear = function() { 
  this.canvasElement.clear(); 
  goog.dom.removeChildren(this.defsElement_); 
  this.defs_ = { }; 
}; 
goog.graphics.SvgGraphics.prototype.drawEllipse = function(cx, cy, rx, ry, stroke, fill, opt_group) { 
  var element = this.createSvgElement_('ellipse', { 
    'cx': cx, 
    'cy': cy, 
    'rx': rx, 
    'ry': ry 
  }); 
  var wrapper = new goog.graphics.SvgEllipseElement(element, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.SvgGraphics.prototype.drawRect = function(x, y, width, height, stroke, fill, opt_group) { 
  var element = this.createSvgElement_('rect', { 
    'x': x, 
    'y': y, 
    'width': width, 
    'height': height 
  }); 
  var wrapper = new goog.graphics.SvgRectElement(element, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.SvgGraphics.prototype.drawImage = function(x, y, width, height, src, opt_group) { 
  var element = this.createSvgElement_('image', { 
    'x': x, 
    'y': y, 
    'width': width, 
    'height': height, 
    'image-rendering': 'optimizeQuality', 
    'preserveAspectRatio': 'none' 
  }); 
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src); 
  var wrapper = new goog.graphics.SvgImageElement(element, this); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.SvgGraphics.prototype.drawTextOnLine = function(text, x1, y1, x2, y2, align, font, stroke, fill, opt_group) { 
  var angle = Math.round(goog.math.angle(x1, y1, x2, y2)); 
  var dx = x2 - x1; 
  var dy = y2 - y1; 
  var lineLength = Math.round(Math.sqrt(dx * dx + dy * dy)); 
  var fontSize = font.size; 
  var attributes = { 
    'font-family': font.family, 
    'font-size': fontSize 
  }; 
  var baseline = Math.round(fontSize * 0.85); 
  var textY = Math.round(y1 -(fontSize / 2) + baseline); 
  var textX = x1; 
  if(align == 'center') { 
    textX += Math.round(lineLength / 2); 
    attributes['text-anchor']= 'middle'; 
  } else if(align == 'right') { 
    textX += lineLength; 
    attributes['text-anchor']= 'end'; 
  } 
  attributes['x']= textX; 
  attributes['y']= textY; 
  if(font.bold) { 
    attributes['font-weight']= 'bold'; 
  } 
  if(font.italic) { 
    attributes['font-style']= 'italic'; 
  } 
  if(angle != 0) { 
    attributes['transform']= 'rotate(' + angle + ' ' + x1 + ' ' + y1 + ')'; 
  } 
  var element = this.createSvgElement_('text', attributes); 
  element.appendChild(this.dom_.getDocument().createTextNode(text)); 
  if(stroke == null && goog.userAgent.GECKO && goog.userAgent.MAC) { 
    var color = 'black'; 
    if(fill instanceof goog.graphics.SolidFill) { 
      color = fill.getColor(); 
    } 
    stroke = new goog.graphics.Stroke(1, color); 
  } 
  var wrapper = new goog.graphics.SvgTextElement(element, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.SvgGraphics.prototype.drawPath = function(path, stroke, fill, opt_group) { 
  var element = this.createSvgElement_('path', { 'd': goog.graphics.SvgGraphics.getSvgPath(path) }); 
  var wrapper = new goog.graphics.SvgPathElement(element, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.SvgGraphics.getSvgPath = function(path) { 
  var list =[]; 
  path.forEachSegment(function(segment, args) { 
    switch(segment) { 
      case goog.graphics.Path.Segment.MOVETO: 
        list.push('M'); 
        Array.prototype.push.apply(list, args); 
        break; 

      case goog.graphics.Path.Segment.LINETO: 
        list.push('L'); 
        Array.prototype.push.apply(list, args); 
        break; 

      case goog.graphics.Path.Segment.CURVETO: 
        list.push('C'); 
        Array.prototype.push.apply(list, args); 
        break; 

      case goog.graphics.Path.Segment.ARCTO: 
        var extent = args[3]; 
        var toAngle = args[2]+ extent; 
        list.push('A', args[0], args[1], 0, Math.abs(extent) > 180 ? 1: 0, extent > 0 ? 1: 0, args[4], args[5]); 
        break; 

      case goog.graphics.Path.Segment.CLOSE: 
        list.push('Z'); 
        break; 

    } 
  }); 
  return list.join(' '); 
}; 
goog.graphics.SvgGraphics.prototype.createGroup = function(opt_group) { 
  var element = this.createSvgElement_('g'); 
  var parent = opt_group || this.canvasElement; 
  parent.getElement().appendChild(element); 
  return new goog.graphics.SvgGroupElement(element, this); 
}; 
goog.graphics.SvgGraphics.prototype.getTextWidth = function(text, font) { }; 
goog.graphics.SvgGraphics.prototype.addDef_ = function(defKey, defElement) { 
  if(defKey in this.defs_) { 
    return this.defs_[defKey]; 
  } 
  var id = goog.graphics.SvgGraphics.DEF_ID_PREFIX_ + goog.graphics.SvgGraphics.nextDefId_ ++; 
  defElement.setAttribute('id', id); 
  this.defs_[defKey]= id; 
  var defs = this.defsElement_; 
  defs.appendChild(defElement); 
  return id; 
}; 
goog.graphics.SvgGraphics.prototype.getDef_ = function(defKey) { 
  return defKey in this.defs_ ? this.defs_[defKey]: null; 
}; 
goog.graphics.SvgGraphics.prototype.enterDocument = function() { 
  var oldPixelSize = this.getPixelSize(); 
  goog.graphics.SvgGraphics.superClass_.enterDocument.call(this); 
  if(! oldPixelSize) { 
    this.dispatchEvent(goog.events.EventType.RESIZE); 
  } 
  if(this.useManualViewbox_) { 
    var width = this.width; 
    var height = this.height; 
    if(typeof width == 'string' && width.indexOf('%') != - 1 && typeof height == 'string' && height.indexOf('%') != - 1) { 
      this.handler_.listen(goog.graphics.SvgGraphics.getResizeCheckTimer_(), goog.Timer.TICK, this.updateManualViewBox_); 
    } 
    this.updateManualViewBox_(); 
  } 
}; 
goog.graphics.SvgGraphics.prototype.exitDocument = function() { 
  goog.graphics.SvgGraphics.superClass_.exitDocument.call(this); 
  if(this.useManualViewbox_) { 
    this.handler_.unlisten(goog.graphics.SvgGraphics.getResizeCheckTimer_(), goog.Timer.TICK, this.updateManualViewBox_); 
  } 
}; 
goog.graphics.SvgGraphics.prototype.disposeInternal = function() { 
  delete this.defs_; 
  delete this.defsElement_; 
  delete this.canvasElement; 
  goog.graphics.SvgGraphics.superClass_.disposeInternal.call(this); 
}; 
goog.graphics.SvgGraphics.resizeCheckTimer_; 
goog.graphics.SvgGraphics.getResizeCheckTimer_ = function() { 
  if(! goog.graphics.SvgGraphics.resizeCheckTimer_) { 
    goog.graphics.SvgGraphics.resizeCheckTimer_ = new goog.Timer(400); 
    goog.graphics.SvgGraphics.resizeCheckTimer_.start(); 
  } 
  return(goog.graphics.SvgGraphics.resizeCheckTimer_); 
}; 
goog.graphics.SvgGraphics.prototype.isDomClonable = function() { 
  return true; 
}; 
