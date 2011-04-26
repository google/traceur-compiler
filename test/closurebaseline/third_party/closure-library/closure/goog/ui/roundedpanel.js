
goog.provide('goog.ui.BaseRoundedPanel'); 
goog.provide('goog.ui.CssRoundedPanel'); 
goog.provide('goog.ui.GraphicsRoundedPanel'); 
goog.provide('goog.ui.RoundedPanel'); 
goog.provide('goog.ui.RoundedPanel.Corner'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.graphics'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Stroke'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.userAgent'); 
goog.ui.RoundedPanel.create = function(radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper) { 
  var isCssReady = goog.userAgent.WEBKIT && goog.userAgent.isVersion('500') || goog.userAgent.GECKO && goog.userAgent.isVersion('1.9a'); 
  if(isCssReady) { 
    return new goog.ui.CssRoundedPanel(radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper); 
  } else { 
    return new goog.ui.GraphicsRoundedPanel(radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper); 
  } 
}; 
goog.ui.RoundedPanel.Corner = { 
  NONE: 0, 
  BOTTOM_LEFT: 2, 
  TOP_LEFT: 4, 
  LEFT: 6, 
  TOP_RIGHT: 8, 
  TOP: 12, 
  BOTTOM_RIGHT: 1, 
  BOTTOM: 3, 
  RIGHT: 9, 
  ALL: 15 
}; 
goog.ui.RoundedPanel.Classes_ = { 
  BACKGROUND: goog.getCssName('goog-roundedpanel-background'), 
  PANEL: goog.getCssName('goog-roundedpanel'), 
  CONTENT: goog.getCssName('goog-roundedpanel-content') 
}; 
goog.ui.BaseRoundedPanel = function(radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.radius_ = radius; 
  this.borderWidth_ = borderWidth; 
  this.borderColor_ = borderColor; 
  this.backgroundColor_ = opt_backgroundColor || null; 
  this.corners_ = opt_corners || goog.ui.RoundedPanel.Corner.NONE; 
}; 
goog.inherits(goog.ui.BaseRoundedPanel, goog.ui.Component); 
goog.ui.BaseRoundedPanel.prototype.backgroundElement_; 
goog.ui.BaseRoundedPanel.prototype.contentElement_; 
goog.ui.BaseRoundedPanel.prototype.decorateInternal = function(element) { 
  goog.ui.BaseRoundedPanel.superClass_.decorateInternal.call(this, element); 
  goog.dom.classes.add(this.getElement(), goog.ui.RoundedPanel.Classes_.PANEL); 
  this.backgroundElement_ = this.getDomHelper().createElement('div'); 
  this.backgroundElement_.className = goog.ui.RoundedPanel.Classes_.BACKGROUND; 
  this.getElement().appendChild(this.backgroundElement_); 
  this.contentElement_ = goog.dom.getElementsByTagNameAndClass(null, goog.ui.RoundedPanel.Classes_.CONTENT, this.getElement())[0]; 
  if(! this.contentElement_) { 
    this.contentElement_ = this.getDomHelper().createDom('div'); 
    this.contentElement_.className = goog.ui.RoundedPanel.Classes_.CONTENT; 
    this.getElement().appendChild(this.contentElement_); 
  } 
}; 
goog.ui.BaseRoundedPanel.prototype.disposeInternal = function() { 
  if(this.backgroundElement_) { 
    this.getDomHelper().removeNode(this.backgroundElement_); 
    this.backgroundElement_ = null; 
  } 
  this.contentElement_ = null; 
  goog.ui.BaseRoundedPanel.superClass_.disposeInternal.call(this); 
}; 
goog.ui.BaseRoundedPanel.prototype.getContentElement = function() { 
  return this.contentElement_; 
}; 
goog.ui.CssRoundedPanel = function(radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper) { 
  goog.ui.BaseRoundedPanel.call(this, radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper); 
}; 
goog.inherits(goog.ui.CssRoundedPanel, goog.ui.BaseRoundedPanel); 
goog.ui.CssRoundedPanel.prototype.decorateInternal = function(element) { 
  goog.ui.CssRoundedPanel.superClass_.decorateInternal.call(this, element); 
  this.backgroundElement_.style.border = this.borderWidth_ + 'px solid ' + this.borderColor_; 
  if(this.backgroundColor_) { 
    this.backgroundElement_.style.backgroundColor = this.backgroundColor_; 
  } 
  if(this.corners_ == goog.ui.RoundedPanel.Corner.ALL) { 
    var styleName = this.getStyle_(goog.ui.RoundedPanel.Corner.ALL); 
    this.backgroundElement_.style[styleName]= this.radius_ + 'px'; 
  } else { 
    var topLeftRadius = this.corners_ & goog.ui.RoundedPanel.Corner.TOP_LEFT ? this.radius_: 0; 
    var cornerStyle = this.getStyle_(goog.ui.RoundedPanel.Corner.TOP_LEFT); 
    this.backgroundElement_.style[cornerStyle]= topLeftRadius + 'px'; 
    var topRightRadius = this.corners_ & goog.ui.RoundedPanel.Corner.TOP_RIGHT ? this.radius_: 0; 
    cornerStyle = this.getStyle_(goog.ui.RoundedPanel.Corner.TOP_RIGHT); 
    this.backgroundElement_.style[cornerStyle]= topRightRadius + 'px'; 
    var bottomRightRadius = this.corners_ & goog.ui.RoundedPanel.Corner.BOTTOM_RIGHT ? this.radius_: 0; 
    cornerStyle = this.getStyle_(goog.ui.RoundedPanel.Corner.BOTTOM_RIGHT); 
    this.backgroundElement_.style[cornerStyle]= bottomRightRadius + 'px'; 
    var bottomLeftRadius = this.corners_ & goog.ui.RoundedPanel.Corner.BOTTOM_LEFT ? this.radius_: 0; 
    cornerStyle = this.getStyle_(goog.ui.RoundedPanel.Corner.BOTTOM_LEFT); 
    this.backgroundElement_.style[cornerStyle]= bottomLeftRadius + 'px'; 
  } 
}; 
goog.ui.CssRoundedPanel.prototype.getStyle_ = function(corner) { 
  var cssCorner, suffixLeft, suffixRight; 
  if(goog.userAgent.WEBKIT) { 
    suffixLeft = 'Left'; 
    suffixRight = 'Right'; 
  } else { 
    suffixLeft = 'left'; 
    suffixRight = 'right'; 
  } 
  switch(corner) { 
    case goog.ui.RoundedPanel.Corner.ALL: 
      cssCorner = ''; 
      break; 

    case goog.ui.RoundedPanel.Corner.TOP_LEFT: 
      cssCorner = 'Top' + suffixLeft; 
      break; 

    case goog.ui.RoundedPanel.Corner.TOP_RIGHT: 
      cssCorner = 'Top' + suffixRight; 
      break; 

    case goog.ui.RoundedPanel.Corner.BOTTOM_LEFT: 
      cssCorner = 'Bottom' + suffixLeft; 
      break; 

    case goog.ui.RoundedPanel.Corner.BOTTOM_RIGHT: 
      cssCorner = 'Bottom' + suffixRight; 
      break; 

  } 
  return goog.userAgent.WEBKIT ? 'WebkitBorder' + cssCorner + 'Radius': 'MozBorderRadius' + cssCorner; 
}; 
goog.ui.GraphicsRoundedPanel = function(radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper) { 
  goog.ui.BaseRoundedPanel.call(this, radius, borderWidth, borderColor, opt_backgroundColor, opt_corners, opt_domHelper); 
}; 
goog.inherits(goog.ui.GraphicsRoundedPanel, goog.ui.BaseRoundedPanel); 
goog.ui.GraphicsRoundedPanel.prototype.arcCenters_; 
goog.ui.GraphicsRoundedPanel.prototype.cornerStarts_; 
goog.ui.GraphicsRoundedPanel.prototype.endAngles_; 
goog.ui.GraphicsRoundedPanel.prototype.graphics_; 
goog.ui.GraphicsRoundedPanel.prototype.radii_; 
goog.ui.GraphicsRoundedPanel.prototype.startAngles_; 
goog.ui.GraphicsRoundedPanel.BORDER_WIDTH_FACTOR_ = 1 / 2; 
goog.ui.GraphicsRoundedPanel.prototype.decorateInternal = function(element) { 
  goog.ui.GraphicsRoundedPanel.superClass_.decorateInternal.call(this, element); 
  var elementSize = goog.style.getSize(this.getElement()); 
  this.calculateArcParameters_(elementSize); 
  this.graphics_ = goog.graphics.createGraphics((elementSize.width),(elementSize.height),(elementSize.width),(elementSize.height), this.getDomHelper()); 
  this.graphics_.createDom(); 
  var path = this.graphics_.createPath(); 
  for(var i = 0; i < 4; i ++) { 
    if(this.radii_[i]) { 
      path.arc(this.arcCenters_[i].x, this.arcCenters_[i].y, this.radii_[i], this.radii_[i], this.startAngles_[i], this.endAngles_[i]- this.startAngles_[i], i > 0); 
    } else if(i == 0) { 
      path.moveTo(this.cornerStarts_[i].x, this.cornerStarts_[i].y); 
    } else { 
      path.lineTo(this.cornerStarts_[i].x, this.cornerStarts_[i].y); 
    } 
  } 
  path.close(); 
  var stroke = this.borderWidth_ ? new goog.graphics.Stroke(this.borderWidth_, this.borderColor_): null; 
  var fill = this.backgroundColor_ ? new goog.graphics.SolidFill(this.backgroundColor_, 1): null; 
  this.graphics_.drawPath(path, stroke, fill); 
  this.graphics_.render(this.backgroundElement_); 
}; 
goog.ui.GraphicsRoundedPanel.prototype.disposeInternal = function() { 
  goog.ui.GraphicsRoundedPanel.superClass_.disposeInternal.call(this); 
  this.graphics_.dispose(); 
  delete this.graphics_; 
  delete this.radii_; 
  delete this.cornerStarts_; 
  delete this.arcCenters_; 
  delete this.startAngles_; 
  delete this.endAngles_; 
}; 
goog.ui.GraphicsRoundedPanel.prototype.calculateArcParameters_ = function(elementSize) { 
  this.radii_ =[]; 
  this.cornerStarts_ =[]; 
  this.arcCenters_ =[]; 
  this.startAngles_ =[]; 
  this.endAngles_ =[]; 
  var angleInterval = 90; 
  var borderWidthOffset = this.borderWidth_ * goog.ui.GraphicsRoundedPanel.BORDER_WIDTH_FACTOR_; 
  var radius, xStart, yStart, xCenter, yCenter, startAngle, endAngle; 
  for(var i = 0; i < 4; i ++) { 
    var corner = Math.pow(2, i); 
    var isLeft = corner & goog.ui.RoundedPanel.Corner.LEFT; 
    var isTop = corner & goog.ui.RoundedPanel.Corner.TOP; 
    radius = corner & this.corners_ ? this.radius_: 0; 
    switch(corner) { 
      case goog.ui.RoundedPanel.Corner.BOTTOM_LEFT: 
        xStart = borderWidthOffset + radius; 
        yStart = elementSize.height - borderWidthOffset; 
        break; 

      case goog.ui.RoundedPanel.Corner.TOP_LEFT: 
        xStart = borderWidthOffset; 
        yStart = radius + borderWidthOffset; 
        break; 

      case goog.ui.RoundedPanel.Corner.TOP_RIGHT: 
        xStart = elementSize.width - radius - borderWidthOffset; 
        yStart = borderWidthOffset; 
        break; 

      case goog.ui.RoundedPanel.Corner.BOTTOM_RIGHT: 
        xStart = elementSize.width - borderWidthOffset; 
        yStart = elementSize.height - radius - borderWidthOffset; 
        break; 

    } 
    xCenter = isLeft ? radius + borderWidthOffset: elementSize.width - radius - borderWidthOffset; 
    yCenter = isTop ? radius + borderWidthOffset: elementSize.height - radius - borderWidthOffset; 
    startAngle = angleInterval * i; 
    endAngle = startAngle + angleInterval; 
    this.radii_[i]= radius; 
    this.cornerStarts_[i]= new goog.math.Coordinate(xStart, yStart); 
    this.arcCenters_[i]= new goog.math.Coordinate(xCenter, yCenter); 
    this.startAngles_[i]= startAngle; 
    this.endAngles_[i]= endAngle; 
  } 
}; 
