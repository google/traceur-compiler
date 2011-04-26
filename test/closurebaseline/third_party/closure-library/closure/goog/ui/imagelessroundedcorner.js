
goog.provide('goog.ui.AbstractImagelessRoundedCorner'); 
goog.provide('goog.ui.CanvasRoundedCorner'); 
goog.provide('goog.ui.ImagelessRoundedCorner'); 
goog.provide('goog.ui.VmlRoundedCorner'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Stroke'); 
goog.require('goog.graphics.VmlGraphics'); 
goog.require('goog.userAgent'); 
goog.ui.ImagelessRoundedCorner.create = function(element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper) { 
  if(width <= 0 || height <= 0 || borderWidth <= 0 || radius < 0) { 
    return; 
  } 
  var roundedCorner; 
  var version = parseFloat(goog.userAgent.VERSION); 
  if(goog.userAgent.IE) { 
    roundedCorner = new goog.ui.VmlRoundedCorner(element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper); 
  } else { 
    roundedCorner = new goog.ui.CanvasRoundedCorner(element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper); 
  } 
  return roundedCorner; 
}; 
goog.ui.ImagelessRoundedCorner.Corner = { 
  TOP_LEFT: 1, 
  TOP_RIGHT: 2, 
  BOTTOM_LEFT: 4, 
  BOTTOM_RIGHT: 8 
}; 
goog.ui.ImagelessRoundedCorner.LEFT_ = goog.ui.ImagelessRoundedCorner.Corner.TOP_LEFT | goog.ui.ImagelessRoundedCorner.Corner.BOTTOM_LEFT; 
goog.ui.ImagelessRoundedCorner.TOP_ = goog.ui.ImagelessRoundedCorner.Corner.TOP_LEFT | goog.ui.ImagelessRoundedCorner.Corner.TOP_RIGHT; 
goog.ui.AbstractImagelessRoundedCorner = function(element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper) { 
  this.element_ = element; 
  this.width_ = width; 
  this.height_ = height; 
  this.borderColor_ = borderColor; 
  this.backgroundColor_ = opt_backgroundColor; 
  this.borderWidth_ = borderWidth; 
  this.radius_ = radius; 
  this.isLeft_ = ! !(location & goog.ui.ImagelessRoundedCorner.LEFT_); 
  this.isTop_ = ! !(location & goog.ui.ImagelessRoundedCorner.TOP_); 
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper(this.element_); 
  this.startAngle_ = this.getStartAngle(); 
  this.endAngle_ = this.getEndAngle(); 
  this.start_ =[]; 
  this.end_ =[]; 
  var borderWidthOffset = this.getBorderWidthOffset(); 
  if(this.isLeft_) { 
    this.start_[0]= this.width_; 
    this.xCenter_ = this.radius_ + borderWidthOffset; 
    this.end_[0]= borderWidthOffset; 
  } else { 
    this.start_[0]= 0; 
    this.xCenter_ = this.width_ - this.radius_ - borderWidthOffset; 
    this.end_[0]= this.width_ - borderWidthOffset; 
  } 
  if(this.isTop_) { 
    this.start_[1]= borderWidthOffset; 
    this.yCenter_ = this.radius_ + borderWidthOffset; 
    this.end_[1]= this.height_; 
  } else { 
    this.start_[1]= this.height_ - borderWidthOffset; 
    this.yCenter_ = this.height_ - this.radius_ - borderWidthOffset; 
    this.end_[1]= 0; 
  } 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.xCenter_; 
goog.ui.AbstractImagelessRoundedCorner.prototype.yCenter_; 
goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR = 1 / 2; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getEndAngle = goog.abstractMethod; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getStartAngle = goog.abstractMethod; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getBorderWidthOffset = function() { 
  return this.borderWidth_ * goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getElement = goog.abstractMethod; 
goog.ui.AbstractImagelessRoundedCorner.prototype.draw = goog.abstractMethod; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getHeight = function() { 
  return this.height_; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.setHeight = function(height) { 
  this.height_ = height; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getWidth = function() { 
  return this.width_; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.setWidth = function(width) { 
  this.width_ = width; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getLineWidth = function() { 
  return this.borderWidth_; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.setLineWidth = function(thickness) { 
  this.borderWidth_ = thickness; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getRadius = function() { 
  return this.radius_; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.setRadius = function(radius) { 
  this.radius_ = radius; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getBorderColor = function() { 
  return this.borderColor_; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.setBorderColor = function(borderColor) { 
  this.borderColor_ = borderColor; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.getBackgroundColor = function() { 
  return this.backgroundColor_; 
}; 
goog.ui.AbstractImagelessRoundedCorner.prototype.setBackgroundColor = function(backgroundColor) { 
  this.backgroundColor_ = backgroundColor; 
}; 
goog.ui.CanvasRoundedCorner = function(element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper) { 
  goog.ui.AbstractImagelessRoundedCorner.call(this, element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper); 
  this.canvas_ = this.domHelper_.createDom('canvas', { 
    'height': height, 
    'width': width 
  }); 
  if(this.backgroundColor_) { 
    var borderWidthOffset = this.getBorderWidthOffset(); 
    this.oppositeCorner_ =[]; 
    if(this.isLeft_) { 
      this.oppositeCorner_[0]= this.width_ + borderWidthOffset; 
      this.xStartOffset_ = this.start_[0]+ borderWidthOffset; 
    } else { 
      this.oppositeCorner_[0]= - borderWidthOffset; 
      this.xStartOffset_ = - borderWidthOffset; 
    } 
    if(this.isTop_) { 
      this.end_[1]+= borderWidthOffset; 
      this.oppositeCorner_[1]= this.height_ + borderWidthOffset; 
    } else { 
      this.end_[1]-= borderWidthOffset; 
      this.oppositeCorner_[1]= - borderWidthOffset; 
    } 
  } 
  this.domHelper_.appendChild(this.element_, this.canvas_); 
}; 
goog.inherits(goog.ui.CanvasRoundedCorner, goog.ui.AbstractImagelessRoundedCorner); 
goog.ui.CanvasRoundedCorner.prototype.oppositeCorner_; 
goog.ui.CanvasRoundedCorner.prototype.xStartOffset_; 
goog.ui.CanvasRoundedCorner.RADIANS_HALF_ = Math.PI / 2; 
goog.ui.CanvasRoundedCorner.RADIANS_ONE_ = Math.PI; 
goog.ui.CanvasRoundedCorner.RADIANS_THREE_HALVES_ = 1.5 * Math.PI; 
goog.ui.CanvasRoundedCorner.RADIANS_TWO_ = 2 * Math.PI; 
goog.ui.CanvasRoundedCorner.prototype.getEndAngle = function() { 
  return this.isLeft_ ? goog.ui.CanvasRoundedCorner.RADIANS_ONE_: goog.ui.CanvasRoundedCorner.RADIANS_TWO_; 
}; 
goog.ui.CanvasRoundedCorner.prototype.getStartAngle = function() { 
  return this.isTop_ ? goog.ui.CanvasRoundedCorner.RADIANS_THREE_HALVES_: goog.ui.CanvasRoundedCorner.RADIANS_HALF_; 
}; 
goog.ui.CanvasRoundedCorner.prototype.getElement = function() { 
  return this.canvas_; 
}; 
goog.ui.CanvasRoundedCorner.prototype.draw = function() { 
  var counterClockwise = this.isLeft_ && this.isTop_ || ! this.isLeft_ && ! this.isTop_; 
  var context = this.canvas_.getContext('2d'); 
  var version = parseFloat(goog.userAgent.VERSION); 
  if(goog.userAgent.WEBKIT && goog.userAgent.isVersion('500') && this.oppositeCorner_ && this.xStartOffset_) { 
    this.drawSafari2WithBackground_(context, counterClockwise); 
  } else { 
    context.strokeStyle = this.borderColor_; 
    context.lineWidth = this.borderWidth_; 
    context.beginPath(); 
    context.moveTo(this.start_[0], this.start_[1]); 
    context.arc(this.xCenter_, this.yCenter_, this.radius_, this.startAngle_, this.endAngle_, counterClockwise); 
    context.lineTo(this.end_[0], this.end_[1]); 
    if(this.oppositeCorner_ && this.xStartOffset_) { 
      context.lineTo(this.oppositeCorner_[0], this.oppositeCorner_[1]); 
      context.lineTo(this.xStartOffset_, this.start_[1]); 
      context.closePath(); 
      context.fillStyle = this.backgroundColor_; 
      context.fill(); 
    } 
    context.stroke(); 
  } 
}; 
goog.ui.CanvasRoundedCorner.prototype.drawSafari2WithBackground_ = function(context, counterClockwise) { 
  if(this.oppositeCorner_ && this.xStartOffset_) { 
    context.strokeStyle = this.backgroundColor_; 
    context.lineWidth = 1; 
    context.beginPath(); 
    context.moveTo(this.start_[0], this.start_[1]); 
    context.arc(this.xCenter_, this.yCenter_, this.radius_, this.startAngle_, this.endAngle_, counterClockwise); 
    context.lineTo(this.end_[0], this.end_[1]); 
    context.lineTo(this.oppositeCorner_[0], this.oppositeCorner_[1]); 
    context.lineTo(this.xStartOffset_, this.start_[1]); 
    context.closePath(); 
    context.fillStyle = this.backgroundColor_; 
    context.fill(); 
  } 
  context.strokeStyle = this.borderColor_; 
  context.borderWidth = this.borderWidth_; 
  context.beginPath(); 
  context.moveTo(this.start_[0], this.start_[1]); 
  context.arc(this.xCenter_, this.yCenter_, this.radius_, this.startAngle_, this.endAngle_, counterClockwise); 
  context.lineTo(this.end_[0], this.end_[1]); 
  context.stroke(); 
}; 
goog.ui.VmlRoundedCorner = function(element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper) { 
  goog.ui.AbstractImagelessRoundedCorner.call(this, element, width, height, borderWidth, radius, location, borderColor, opt_backgroundColor, opt_domHelper); 
  this.start_[0]-= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  this.end_[0]-= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  this.xCenter_ -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  this.start_[1]-= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  this.end_[1]-= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  this.yCenter_ -= goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  this.graphics_ = new goog.graphics.VmlGraphics(this.width_, this.height_, this.width_, this.height_, this.domHelper_); 
  this.container_ = this.domHelper_.createDom('div', { 'style': 'overflow:hidden;position:relative;' + 'width:' + this.width_ + 'px;' + 'height:' + this.height_ + 'px;' }); 
}; 
goog.inherits(goog.ui.VmlRoundedCorner, goog.ui.AbstractImagelessRoundedCorner); 
goog.ui.VmlRoundedCorner.prototype.getEndAngle = function() { 
  return this.isLeft_ ? 180: 360; 
}; 
goog.ui.VmlRoundedCorner.prototype.getStartAngle = function() { 
  return this.isTop_ ? 270: 90; 
}; 
goog.ui.VmlRoundedCorner.prototype.getElement = function() { 
  return this.container_; 
}; 
goog.ui.VmlRoundedCorner.prototype.draw = function() { 
  var clockwise = this.isLeft_ && ! this.isTop_ || ! this.isLeft_ && this.isTop_; 
  this.graphics_.createDom(); 
  if(this.backgroundColor_) { 
    this.drawBackground_(clockwise); 
  } 
  var path = this.graphics_.createPath(); 
  path.moveTo(this.start_[0], this.start_[1]); 
  path.arc(this.xCenter_, this.yCenter_, this.radius_, this.radius_, this.startAngle_, clockwise ? 90: - 90, true); 
  path.lineTo(this.end_[0], this.end_[1]); 
  var stroke = new goog.graphics.Stroke(this.borderWidth_, this.borderColor_); 
  this.graphics_.drawPath(path, stroke, null); 
  var shapeNode = this.extractShapeNode_(); 
  this.domHelper_.appendChild(this.container_, shapeNode); 
  this.domHelper_.appendChild(this.element_, this.container_); 
}; 
goog.ui.VmlRoundedCorner.prototype.drawBackground_ = function(clockwise) { 
  var arcEnd =[]; 
  arcEnd[0]= this.isLeft_ ? goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR: this.width_ - goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  arcEnd[1]= this.isTop_ ? this.height_ - goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR: goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  var oppositeCorner =[]; 
  oppositeCorner[0]= this.isLeft_ ? this.width_ - goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR: goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  oppositeCorner[1]= arcEnd[1]; 
  var endX = this.isLeft_ ? this.start_[0]- goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR: goog.ui.AbstractImagelessRoundedCorner.BORDER_WIDTH_FACTOR; 
  var path = this.graphics_.createPath(); 
  path.moveTo(this.start_[0], this.start_[1]); 
  path.arc(this.xCenter_, this.yCenter_, this.radius_, this.radius_, this.startAngle_, clockwise ? 90: - 90, true); 
  path.lineTo(arcEnd[0], arcEnd[1]); 
  path.lineTo(oppositeCorner[0], oppositeCorner[1]); 
  path.lineTo(endX, this.start_[1]); 
  var stroke = new goog.graphics.Stroke(1,(this.backgroundColor_)); 
  var fill = new goog.graphics.SolidFill((this.backgroundColor_), 1); 
  this.graphics_.drawPath(path, stroke, fill); 
  var shapeNode = this.extractShapeNode_(); 
  this.domHelper_.appendChild(this.container_, shapeNode); 
}; 
goog.ui.VmlRoundedCorner.prototype.extractShapeNode_ = function() { 
  var shapeNode =(goog.dom.findNode(this.graphics_.getElement(), goog.ui.VmlRoundedCorner.isShapeNode_)); 
  goog.style.setSize(shapeNode, this.width_, this.height_); 
  goog.style.setPosition(shapeNode, 0, 0); 
  return shapeNode; 
}; 
goog.ui.VmlRoundedCorner.isShapeNode_ = function(node) { 
  return node.nodeType == goog.dom.NodeType.ELEMENT && node.nodeName == 'shape'; 
}; 
