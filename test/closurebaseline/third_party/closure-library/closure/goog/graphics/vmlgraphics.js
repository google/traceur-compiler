
goog.provide('goog.graphics.VmlGraphics'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.graphics.AbstractGraphics'); 
goog.require('goog.graphics.Font'); 
goog.require('goog.graphics.LinearGradient'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Stroke'); 
goog.require('goog.graphics.VmlEllipseElement'); 
goog.require('goog.graphics.VmlGroupElement'); 
goog.require('goog.graphics.VmlImageElement'); 
goog.require('goog.graphics.VmlPathElement'); 
goog.require('goog.graphics.VmlRectElement'); 
goog.require('goog.graphics.VmlTextElement'); 
goog.require('goog.math.Size'); 
goog.require('goog.string'); 
goog.graphics.VmlGraphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) { 
  goog.graphics.AbstractGraphics.call(this, width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
  this.handler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.graphics.VmlGraphics, goog.graphics.AbstractGraphics); 
goog.graphics.VmlGraphics.VML_PREFIX_ = 'g_vml_'; 
goog.graphics.VmlGraphics.VML_NS_ = 'urn:schemas-microsoft-com:vml'; 
goog.graphics.VmlGraphics.VML_IMPORT_ = '#default#VML'; 
goog.graphics.VmlGraphics.IE8_MODE_ = document.documentMode && document.documentMode >= 8; 
goog.graphics.VmlGraphics.COORD_MULTIPLIER = 100; 
goog.graphics.VmlGraphics.toCssSize = function(size) { 
  return goog.isString(size) && goog.string.endsWith(size, '%') ? size: parseFloat(size.toString()) + 'px'; 
}; 
goog.graphics.VmlGraphics.toPosCoord = function(number) { 
  return Math.round((parseFloat(number.toString()) - 0.5) * goog.graphics.VmlGraphics.COORD_MULTIPLIER); 
}; 
goog.graphics.VmlGraphics.toPosPx = function(number) { 
  return goog.graphics.VmlGraphics.toPosCoord(number) + 'px'; 
}; 
goog.graphics.VmlGraphics.toSizeCoord = function(number) { 
  return Math.round(parseFloat(number.toString()) * goog.graphics.VmlGraphics.COORD_MULTIPLIER); 
}; 
goog.graphics.VmlGraphics.toSizePx = function(number) { 
  return goog.graphics.VmlGraphics.toSizeCoord(number) + 'px'; 
}; 
goog.graphics.VmlGraphics.setAttribute = function(element, name, value) { 
  if(goog.graphics.VmlGraphics.IE8_MODE_) { 
    element[name]= value; 
  } else { 
    element.setAttribute(name, value); 
  } 
}; 
goog.graphics.VmlGraphics.prototype.handler_; 
goog.graphics.VmlGraphics.prototype.createVmlElement = function(tagName) { 
  var element = this.dom_.createElement(goog.graphics.VmlGraphics.VML_PREFIX_ + ':' + tagName); 
  element.id = goog.string.createUniqueString(); 
  return element; 
}; 
goog.graphics.VmlGraphics.prototype.getVmlElement = function(id) { 
  return this.dom_.getElement(id); 
}; 
goog.graphics.VmlGraphics.prototype.updateGraphics_ = function() { 
  if(goog.graphics.VmlGraphics.IE8_MODE_ && this.isInDocument()) { 
    this.getElement().innerHTML = this.getElement().innerHTML; 
  } 
}; 
goog.graphics.VmlGraphics.prototype.append_ = function(element, opt_group) { 
  var parent = opt_group || this.canvasElement; 
  parent.getElement().appendChild(element.getElement()); 
  this.updateGraphics_(); 
}; 
goog.graphics.VmlGraphics.prototype.setElementFill = function(element, fill) { 
  var vmlElement = element.getElement(); 
  this.removeFill(vmlElement); 
  if(fill instanceof goog.graphics.SolidFill) { 
    if(fill.getColor() == 'transparent') { 
      vmlElement.filled = false; 
    } else if(fill.getOpacity() != 1) { 
      vmlElement.filled = true; 
      var fillNode = this.createVmlElement('fill'); 
      fillNode.opacity = Math.round(fill.getOpacity() * 100) + '%'; 
      fillNode.color = fill.getColor(); 
      vmlElement.appendChild(fillNode); 
    } else { 
      vmlElement.filled = true; 
      vmlElement.fillcolor = fill.getColor(); 
    } 
  } else if(fill instanceof goog.graphics.LinearGradient) { 
    vmlElement.filled = true; 
    var gradient = this.createVmlElement('fill'); 
    gradient.color = fill.getColor1(); 
    gradient.color2 = fill.getColor2(); 
    var angle = goog.math.angle(fill.getX1(), fill.getY1(), fill.getX2(), fill.getY2()); 
    angle = Math.round(goog.math.standardAngle(270 - angle)); 
    gradient.angle = angle; 
    gradient.type = 'gradient'; 
    vmlElement.appendChild(gradient); 
  } else { 
    vmlElement.filled = false; 
  } 
  this.updateGraphics_(); 
}; 
goog.graphics.VmlGraphics.prototype.setElementStroke = function(element, stroke) { 
  var vmlElement = element.getElement(); 
  if(stroke) { 
    vmlElement.stroked = true; 
    var width = stroke.getWidth(); 
    if(goog.isString(width) && width.indexOf('px') == - 1) { 
      width = parseFloat(width); 
    } else { 
      width = width * this.getPixelScaleX(); 
    } 
    var strokeElement = vmlElement.getElementsByTagName('stroke')[0]; 
    if(width < 1) { 
      strokeElement = strokeElement || this.createVmlElement('stroke'); 
      strokeElement.opacity = width; 
      strokeElement.weight = '1px'; 
      strokeElement.color = stroke.getColor(); 
      vmlElement.appendChild(strokeElement); 
    } else { 
      if(strokeElement) { 
        vmlElement.removeChild(strokeElement); 
      } 
      vmlElement.strokecolor = stroke.getColor(); 
      vmlElement.strokeweight = width + 'px'; 
    } 
  } else { 
    vmlElement.stroked = false; 
  } 
  this.updateGraphics_(); 
}; 
goog.graphics.VmlGraphics.prototype.setElementTransform = function(element, x, y, angle, centerX, centerY) { 
  var el = element.getElement(); 
  el.style.left = goog.graphics.VmlGraphics.toPosPx(x); 
  el.style.top = goog.graphics.VmlGraphics.toPosPx(y); 
  if(angle || el.rotation) { 
    el.rotation = angle; 
    el.coordsize = goog.graphics.VmlGraphics.toSizeCoord(centerX * 2) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(centerY * 2); 
  } 
}; 
goog.graphics.VmlGraphics.prototype.removeFill = function(element) { 
  element.fillcolor = ''; 
  var v = element.childNodes.length; 
  for(var i = 0; i < element.childNodes.length; i ++) { 
    var child = element.childNodes[i]; 
    if(child.tagName == 'fill') { 
      element.removeChild(child); 
    } 
  } 
}; 
goog.graphics.VmlGraphics.setPositionAndSize = function(element, left, top, width, height) { 
  var style = element.style; 
  style.position = 'absolute'; 
  style.left = goog.graphics.VmlGraphics.toPosPx(left); 
  style.top = goog.graphics.VmlGraphics.toPosPx(top); 
  style.width = goog.graphics.VmlGraphics.toSizePx(width); 
  style.height = goog.graphics.VmlGraphics.toSizePx(height); 
  if(element.tagName == 'shape') { 
    element.coordsize = goog.graphics.VmlGraphics.toSizeCoord(width) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(height); 
  } 
}; 
goog.graphics.VmlGraphics.prototype.createFullSizeElement_ = function(type) { 
  var element = this.createVmlElement(type); 
  var size = this.getCoordSize(); 
  goog.graphics.VmlGraphics.setPositionAndSize(element, 0, 0, size.width, size.height); 
  return element; 
}; 
try { 
  eval('document.namespaces'); 
} catch(ex) { } 
goog.graphics.VmlGraphics.prototype.createDom = function() { 
  var doc = this.dom_.getDocument(); 
  if(! doc.namespaces[goog.graphics.VmlGraphics.VML_PREFIX_]) { 
    if(goog.graphics.VmlGraphics.IE8_MODE_) { 
      doc.namespaces.add(goog.graphics.VmlGraphics.VML_PREFIX_, goog.graphics.VmlGraphics.VML_NS_, goog.graphics.VmlGraphics.VML_IMPORT_); 
    } else { 
      doc.namespaces.add(goog.graphics.VmlGraphics.VML_PREFIX_, goog.graphics.VmlGraphics.VML_NS_); 
    } 
    var ss = doc.createStyleSheet(); 
    ss.cssText = goog.graphics.VmlGraphics.VML_PREFIX_ + '\\:*' + '{behavior:url(#default#VML)}'; 
  } 
  var pixelWidth = this.width; 
  var pixelHeight = this.height; 
  var divElement = this.dom_.createDom('div', { 'style': 'overflow:hidden;position:relative;width:' + goog.graphics.VmlGraphics.toCssSize(pixelWidth) + ';height:' + goog.graphics.VmlGraphics.toCssSize(pixelHeight) }); 
  this.setElementInternal(divElement); 
  var group = this.createVmlElement('group'); 
  var style = group.style; 
  style.position = 'absolute'; 
  style.left = style.top = 0; 
  style.width = this.width; 
  style.height = this.height; 
  if(this.coordWidth) { 
    group.coordsize = goog.graphics.VmlGraphics.toSizeCoord(this.coordWidth) + ' ' + goog.graphics.VmlGraphics.toSizeCoord((this.coordHeight)); 
  } else { 
    group.coordsize = goog.graphics.VmlGraphics.toSizeCoord(pixelWidth) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(pixelHeight); 
  } 
  if(goog.isDef(this.coordLeft)) { 
    group.coordorigin = goog.graphics.VmlGraphics.toSizeCoord(this.coordLeft) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(this.coordTop); 
  } else { 
    group.coordorigin = '0 0'; 
  } 
  divElement.appendChild(group); 
  this.canvasElement = new goog.graphics.VmlGroupElement(group, this); 
  goog.events.listen(divElement, goog.events.EventType.RESIZE, goog.bind(this.handleContainerResize_, this)); 
}; 
goog.graphics.VmlGraphics.prototype.handleContainerResize_ = function() { 
  var size = goog.style.getSize(this.getElement()); 
  var style = this.canvasElement.getElement().style; 
  if(size.width) { 
    style.width = size.width + 'px'; 
    style.height = size.height + 'px'; 
  } else { 
    var current = this.getElement(); 
    while(current && current.currentStyle && current.currentStyle.display != 'none') { 
      current = current.parentNode; 
    } 
    if(current && current.currentStyle) { 
      this.handler_.listen(current, 'propertychange', this.handleContainerResize_); 
    } 
  } 
  this.dispatchEvent(goog.events.EventType.RESIZE); 
}; 
goog.graphics.VmlGraphics.prototype.handlePropertyChange_ = function(e) { 
  var prop = e.getBrowserEvent().propertyName; 
  if(prop == 'display' || prop == 'className') { 
    this.handler_.unlisten((e.target), 'propertychange', this.handlePropertyChange_); 
    this.handleContainerResize_(); 
  } 
}; 
goog.graphics.VmlGraphics.prototype.setCoordOrigin = function(left, top) { 
  this.coordLeft = left; 
  this.coordTop = top; 
  this.canvasElement.getElement().coordorigin = goog.graphics.VmlGraphics.toSizeCoord(this.coordLeft) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(this.coordTop); 
}; 
goog.graphics.VmlGraphics.prototype.setCoordSize = function(coordWidth, coordHeight) { 
  goog.graphics.VmlGraphics.superClass_.setCoordSize.apply(this, arguments); 
  this.canvasElement.getElement().coordsize = goog.graphics.VmlGraphics.toSizeCoord(coordWidth) + ' ' + goog.graphics.VmlGraphics.toSizeCoord(coordHeight); 
}; 
goog.graphics.VmlGraphics.prototype.setSize = function(pixelWidth, pixelHeight) { }; 
goog.graphics.VmlGraphics.prototype.getPixelSize = function() { 
  var el = this.getElement(); 
  return new goog.math.Size(el.style.pixelWidth || el.offsetWidth || 1, el.style.pixelHeight || el.offsetHeight || 1); 
}; 
goog.graphics.VmlGraphics.prototype.clear = function() { 
  this.canvasElement.clear(); 
}; 
goog.graphics.VmlGraphics.prototype.drawEllipse = function(cx, cy, rx, ry, stroke, fill, opt_group) { 
  var element = this.createVmlElement('oval'); 
  goog.graphics.VmlGraphics.setPositionAndSize(element, cx - rx, cy - ry, rx * 2, ry * 2); 
  var wrapper = new goog.graphics.VmlEllipseElement(element, this, cx, cy, rx, ry, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.VmlGraphics.prototype.drawRect = function(x, y, width, height, stroke, fill, opt_group) { 
  var element = this.createVmlElement('rect'); 
  goog.graphics.VmlGraphics.setPositionAndSize(element, x, y, width, height); 
  var wrapper = new goog.graphics.VmlRectElement(element, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.VmlGraphics.prototype.drawImage = function(x, y, width, height, src, opt_group) { 
  var element = this.createVmlElement('image'); 
  goog.graphics.VmlGraphics.setPositionAndSize(element, x, y, width, height); 
  goog.graphics.VmlGraphics.setAttribute(element, 'src', src); 
  var wrapper = new goog.graphics.VmlImageElement(element, this); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.VmlGraphics.prototype.drawTextOnLine = function(text, x1, y1, x2, y2, align, font, stroke, fill, opt_group) { 
  var shape = this.createFullSizeElement_('shape'); 
  var pathElement = this.createVmlElement('path'); 
  var path = 'M' + goog.graphics.VmlGraphics.toPosCoord(x1) + ',' + goog.graphics.VmlGraphics.toPosCoord(y1) + 'L' + goog.graphics.VmlGraphics.toPosCoord(x2) + ',' + goog.graphics.VmlGraphics.toPosCoord(y2) + 'E'; 
  goog.graphics.VmlGraphics.setAttribute(pathElement, 'v', path); 
  goog.graphics.VmlGraphics.setAttribute(pathElement, 'textpathok', 'true'); 
  var textPathElement = this.createVmlElement('textpath'); 
  textPathElement.setAttribute('on', 'true'); 
  var style = textPathElement.style; 
  style.fontSize = font.size * this.getPixelScaleX(); 
  style.fontFamily = font.family; 
  if(align != null) { 
    style['v-text-align']= align; 
  } 
  if(font.bold) { 
    style.fontWeight = 'bold'; 
  } 
  if(font.italic) { 
    style.fontStyle = 'italic'; 
  } 
  goog.graphics.VmlGraphics.setAttribute(textPathElement, 'string', text); 
  shape.appendChild(pathElement); 
  shape.appendChild(textPathElement); 
  var wrapper = new goog.graphics.VmlTextElement(shape, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.VmlGraphics.prototype.drawPath = function(path, stroke, fill, opt_group) { 
  var element = this.createFullSizeElement_('shape'); 
  goog.graphics.VmlGraphics.setAttribute(element, 'path', goog.graphics.VmlGraphics.getVmlPath(path)); 
  var wrapper = new goog.graphics.VmlPathElement(element, this, stroke, fill); 
  this.append_(wrapper, opt_group); 
  return wrapper; 
}; 
goog.graphics.VmlGraphics.getVmlPath = function(path) { 
  var list =[]; 
  path.forEachSegment(function(segment, args) { 
    switch(segment) { 
      case goog.graphics.Path.Segment.MOVETO: 
        list.push('m'); 
        Array.prototype.push.apply(list, goog.array.map(args, goog.graphics.VmlGraphics.toSizeCoord)); 
        break; 

      case goog.graphics.Path.Segment.LINETO: 
        list.push('l'); 
        Array.prototype.push.apply(list, goog.array.map(args, goog.graphics.VmlGraphics.toSizeCoord)); 
        break; 

      case goog.graphics.Path.Segment.CURVETO: 
        list.push('c'); 
        Array.prototype.push.apply(list, goog.array.map(args, goog.graphics.VmlGraphics.toSizeCoord)); 
        break; 

      case goog.graphics.Path.Segment.CLOSE: 
        list.push('x'); 
        break; 

      case goog.graphics.Path.Segment.ARCTO: 
        var toAngle = args[2]+ args[3]; 
        var cx = goog.graphics.VmlGraphics.toSizeCoord(args[4]- goog.math.angleDx(toAngle, args[0])); 
        var cy = goog.graphics.VmlGraphics.toSizeCoord(args[5]- goog.math.angleDy(toAngle, args[1])); 
        var rx = goog.graphics.VmlGraphics.toSizeCoord(args[0]); 
        var ry = goog.graphics.VmlGraphics.toSizeCoord(args[1]); 
        var fromAngle = Math.round(args[2]* - 65536); 
        var extent = Math.round(args[3]* - 65536); 
        list.push('ae', cx, cy, rx, ry, fromAngle, extent); 
        break; 

    } 
  }); 
  return list.join(' '); 
}; 
goog.graphics.VmlGraphics.prototype.createGroup = function(opt_group) { 
  var element = this.createFullSizeElement_('group'); 
  var parent = opt_group || this.canvasElement; 
  parent.getElement().appendChild(element); 
  return new goog.graphics.VmlGroupElement(element, this); 
}; 
goog.graphics.VmlGraphics.prototype.getTextWidth = function(text, font) { 
  return 0; 
}; 
goog.graphics.VmlGraphics.prototype.enterDocument = function() { 
  goog.graphics.VmlGraphics.superClass_.enterDocument.call(this); 
  this.handleContainerResize_(); 
  this.updateGraphics_(); 
}; 
goog.graphics.VmlGraphics.prototype.disposeInternal = function() { 
  this.canvasElement = null; 
  goog.graphics.VmlGraphics.superClass_.disposeInternal.call(this); 
}; 
