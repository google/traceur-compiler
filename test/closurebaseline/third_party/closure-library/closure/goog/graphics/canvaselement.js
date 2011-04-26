
goog.provide('goog.graphics.CanvasEllipseElement'); 
goog.provide('goog.graphics.CanvasGroupElement'); 
goog.provide('goog.graphics.CanvasImageElement'); 
goog.provide('goog.graphics.CanvasPathElement'); 
goog.provide('goog.graphics.CanvasRectElement'); 
goog.provide('goog.graphics.CanvasTextElement'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.graphics.EllipseElement'); 
goog.require('goog.graphics.GroupElement'); 
goog.require('goog.graphics.ImageElement'); 
goog.require('goog.graphics.Path'); 
goog.require('goog.graphics.PathElement'); 
goog.require('goog.graphics.RectElement'); 
goog.require('goog.graphics.TextElement'); 
goog.graphics.CanvasGroupElement = function(graphics) { 
  goog.graphics.GroupElement.call(this, null, graphics); 
  this.children_ =[]; 
}; 
goog.inherits(goog.graphics.CanvasGroupElement, goog.graphics.GroupElement); 
goog.graphics.CanvasGroupElement.prototype.clear = function() { 
  if(this.children_.length) { 
    this.children_.length = 0; 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasGroupElement.prototype.setSize = function(width, height) { }; 
goog.graphics.CanvasGroupElement.prototype.appendChild = function(element) { 
  this.children_.push(element); 
}; 
goog.graphics.CanvasGroupElement.prototype.draw = function(ctx) { 
  for(var i = 0, len = this.children_.length; i < len; i ++) { 
    this.getGraphics().drawElement(this.children_[i]); 
  } 
}; 
goog.graphics.CanvasEllipseElement = function(element, graphics, cx, cy, rx, ry, stroke, fill) { 
  goog.graphics.EllipseElement.call(this, element, graphics, stroke, fill); 
  this.cx_ = cx; 
  this.cy_ = cy; 
  this.rx_ = rx; 
  this.ry_ = ry; 
  this.path_ = new goog.graphics.Path(); 
  this.setUpPath_(); 
  this.pathElement_ = new goog.graphics.CanvasPathElement(null, graphics, this.path_, stroke, fill); 
}; 
goog.inherits(goog.graphics.CanvasEllipseElement, goog.graphics.EllipseElement); 
goog.graphics.CanvasEllipseElement.prototype.setUpPath_ = function() { 
  this.path_.clear(); 
  this.path_.moveTo(this.cx_ + goog.math.angleDx(0, this.rx_), this.cy_ + goog.math.angleDy(0, this.ry_)); 
  this.path_.arcTo(this.rx_, this.ry_, 0, 360); 
  this.path_.close(); 
}; 
goog.graphics.CanvasEllipseElement.prototype.setCenter = function(cx, cy) { 
  this.cx_ = cx; 
  this.cy_ = cy; 
  this.setUpPath_(); 
  this.pathElement_.setPath((this.path_)); 
}; 
goog.graphics.CanvasEllipseElement.prototype.setRadius = function(rx, ry) { 
  this.rx_ = rx; 
  this.ry_ = ry; 
  this.setUpPath_(); 
  this.pathElement_.setPath((this.path_)); 
}; 
goog.graphics.CanvasEllipseElement.prototype.draw = function(ctx) { 
  this.pathElement_.draw(ctx); 
}; 
goog.graphics.CanvasRectElement = function(element, graphics, x, y, w, h, stroke, fill) { 
  goog.graphics.RectElement.call(this, element, graphics, stroke, fill); 
  this.x_ = x; 
  this.y_ = y; 
  this.w_ = w; 
  this.h_ = h; 
}; 
goog.inherits(goog.graphics.CanvasRectElement, goog.graphics.RectElement); 
goog.graphics.CanvasRectElement.prototype.setPosition = function(x, y) { 
  this.x_ = x; 
  this.y_ = y; 
  if(this.drawn_) { 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasRectElement.prototype.drawn_ = false; 
goog.graphics.CanvasRectElement.prototype.setSize = function(width, height) { 
  this.w_ = width; 
  this.h_ = height; 
  if(this.drawn_) { 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasRectElement.prototype.draw = function(ctx) { 
  this.drawn_ = true; 
  ctx.beginPath(); 
  ctx.moveTo(this.x_, this.y_); 
  ctx.lineTo(this.x_, this.y_ + this.h_); 
  ctx.lineTo(this.x_ + this.w_, this.y_ + this.h_); 
  ctx.lineTo(this.x_ + this.w_, this.y_); 
  ctx.closePath(); 
}; 
goog.graphics.CanvasPathElement = function(element, graphics, path, stroke, fill) { 
  goog.graphics.PathElement.call(this, element, graphics, stroke, fill); 
  this.setPath(path); 
}; 
goog.inherits(goog.graphics.CanvasPathElement, goog.graphics.PathElement); 
goog.graphics.CanvasPathElement.prototype.drawn_ = false; 
goog.graphics.CanvasPathElement.prototype.path_; 
goog.graphics.CanvasPathElement.prototype.setPath = function(path) { 
  this.path_ = path.isSimple() ? path: goog.graphics.Path.createSimplifiedPath(path); 
  if(this.drawn_) { 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasPathElement.prototype.draw = function(ctx) { 
  this.drawn_ = true; 
  ctx.beginPath(); 
  this.path_.forEachSegment(function(segment, args) { 
    switch(segment) { 
      case goog.graphics.Path.Segment.MOVETO: 
        ctx.moveTo(args[0], args[1]); 
        break; 

      case goog.graphics.Path.Segment.LINETO: 
        for(var i = 0; i < args.length; i += 2) { 
          ctx.lineTo(args[i], args[i + 1]); 
        } 
        break; 

      case goog.graphics.Path.Segment.CURVETO: 
        for(var i = 0; i < args.length; i += 6) { 
          ctx.bezierCurveTo(args[i], args[i + 1], args[i + 2], args[i + 3], args[i + 4], args[i + 5]); 
        } 
        break; 

      case goog.graphics.Path.Segment.ARCTO: 
        throw Error('Canvas paths cannot contain arcs'); 

      case goog.graphics.Path.Segment.CLOSE: 
        ctx.closePath(); 
        break; 

    } 
  }); 
}; 
goog.graphics.CanvasTextElement = function(graphics, text, x1, y1, x2, y2, align, font, stroke, fill) { 
  goog.graphics.TextElement.call(this, null, graphics, stroke, fill); 
  this.text_ = text; 
  this.x1_ = x1; 
  this.y1_ = y1; 
  this.x2_ = x2; 
  this.y2_ = y2; 
  this.align_ = align || 'left'; 
  this.font_ = font; 
  this.element_ = goog.dom.createDom('DIV', { 'style': 'display:table;position:absolute;padding:0;margin:0;border:0' }); 
  this.innerElement_ = goog.dom.createDom('DIV', { 'style': 'display:table-cell;padding: 0;margin: 0;border: 0' }); 
  this.updateStyle_(); 
  this.updateText_(); 
  graphics.getElement().appendChild(this.element_); 
  this.element_.appendChild(this.innerElement_); 
}; 
goog.inherits(goog.graphics.CanvasTextElement, goog.graphics.TextElement); 
goog.graphics.CanvasTextElement.prototype.setText = function(text) { 
  this.text_ = text; 
  this.updateText_(); 
}; 
goog.graphics.CanvasTextElement.prototype.setFill = function(fill) { 
  this.fill = fill; 
  if(this.element_) { 
    this.element_.style.color = fill.getColor() || fill.getColor1(); 
  } 
}; 
goog.graphics.CanvasTextElement.prototype.setStroke = function(stroke) { }; 
goog.graphics.CanvasTextElement.prototype.draw = function(ctx) { }; 
goog.graphics.CanvasTextElement.prototype.updateStyle_ = function() { 
  var x1 = this.x1_; 
  var x2 = this.x2_; 
  var y1 = this.y1_; 
  var y2 = this.y2_; 
  var align = this.align_; 
  var font = this.font_; 
  var style = this.element_.style; 
  var scaleX = this.getGraphics().getPixelScaleX(); 
  var scaleY = this.getGraphics().getPixelScaleY(); 
  if(x1 == x2) { 
    style.lineHeight = '90%'; 
    this.innerElement_.style.verticalAlign = align == 'center' ? 'middle': align == 'left' ?(y1 < y2 ? 'top': 'bottom'): y1 < y2 ? 'bottom': 'top'; 
    style.textAlign = 'center'; 
    var w = font.size * scaleX; 
    style.top = Math.round(Math.min(y1, y2) * scaleY) + 'px'; 
    style.left = Math.round((x1 - w / 2) * scaleX) + 'px'; 
    style.width = Math.round(w) + 'px'; 
    style.height = Math.abs(y1 - y2) * scaleY + 'px'; 
    style.fontSize = font.size * 0.6 * scaleY + 'pt'; 
  } else { 
    style.lineHeight = '100%'; 
    this.innerElement_.style.verticalAlign = 'top'; 
    style.textAlign = align; 
    style.top = Math.round(((y1 + y2) / 2 - font.size * 2 / 3) * scaleY) + 'px'; 
    style.left = Math.round(x1 * scaleX) + 'px'; 
    style.width = Math.round(Math.abs(x2 - x1) * scaleX) + 'px'; 
    style.height = 'auto'; 
    style.fontSize = font.size * scaleY + 'pt'; 
  } 
  style.fontWeight = font.bold ? 'bold': 'normal'; 
  style.fontStyle = font.italic ? 'italic': 'normal'; 
  style.fontFamily = font.family; 
  var fill = this.getFill(); 
  style.color = fill.getColor() || fill.getColor1(); 
}; 
goog.graphics.CanvasTextElement.prototype.updateText_ = function() { 
  if(this.x1_ == this.x2_) { 
    this.innerElement_.innerHTML = goog.array.map(this.text_.split(''), goog.string.htmlEscape).join('<br>'); 
  } else { 
    this.innerElement_.innerHTML = goog.string.htmlEscape(this.text_); 
  } 
}; 
goog.graphics.CanvasImageElement = function(element, graphics, x, y, w, h, src) { 
  goog.graphics.ImageElement.call(this, element, graphics); 
  this.x_ = x; 
  this.y_ = y; 
  this.w_ = w; 
  this.h_ = h; 
  this.src_ = src; 
}; 
goog.inherits(goog.graphics.CanvasImageElement, goog.graphics.ImageElement); 
goog.graphics.CanvasImageElement.prototype.drawn_ = false; 
goog.graphics.CanvasImageElement.prototype.setPosition = function(x, y) { 
  this.x_ = x; 
  this.y_ = y; 
  if(this.drawn_) { 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasImageElement.prototype.setSize = function(width, height) { 
  this.w_ = width; 
  this.h_ = height; 
  if(this.drawn_) { 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasImageElement.prototype.setSource = function(src) { 
  this.src_ = src; 
  if(this.drawn_) { 
    this.getGraphics().redraw(); 
  } 
}; 
goog.graphics.CanvasImageElement.prototype.draw = function(ctx) { 
  if(this.img_) { 
    if(this.w_ && this.h_) { 
      ctx.drawImage(this.img_, this.x_, this.y_, this.w_, this.h_); 
    } 
    this.drawn_ = true; 
  } else { 
    var img = new Image(); 
    img.onload = goog.bind(this.handleImageLoad_, this, img); 
    img.src = this.src_; 
  } 
}; 
goog.graphics.CanvasImageElement.prototype.handleImageLoad_ = function(img) { 
  this.img_ = img; 
  this.getGraphics().redraw(); 
}; 
