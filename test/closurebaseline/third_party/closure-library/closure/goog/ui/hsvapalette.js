
goog.provide('goog.ui.HsvaPalette'); 
goog.require('goog.array'); 
goog.require('goog.color'); 
goog.require('goog.color.alpha'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.HsvPalette'); 
goog.ui.HsvaPalette = function(opt_domHelper, opt_color, opt_alpha, opt_class) { 
  goog.ui.HsvPalette.call(this, opt_domHelper, opt_color, opt_class); 
  this.alpha_ = goog.isDef(opt_alpha) ? opt_alpha: 1; 
  this.class_ = opt_class || goog.getCssName('goog-hsva-palette'); 
  this.document_ = opt_domHelper ? opt_domHelper.getDocument(): goog.dom.getDomHelper().getDocument(); 
}; 
goog.inherits(goog.ui.HsvaPalette, goog.ui.HsvPalette); 
goog.ui.HsvaPalette.prototype.aImageEl_; 
goog.ui.HsvaPalette.prototype.aHandleEl_; 
goog.ui.HsvaPalette.prototype.swatchBackdropEl_; 
goog.ui.HsvaPalette.prototype.getAlpha = function() { 
  return this.alpha_; 
}; 
goog.ui.HsvaPalette.prototype.setAlpha = function(alpha) { 
  this.setColorAlphaHelper_(this.color_, alpha); 
}; 
goog.ui.HsvaPalette.prototype.setColor = function(color) { 
  this.setColorAlphaHelper_(color, 1); 
}; 
goog.ui.HsvaPalette.prototype.getColorRgbaHex = function() { 
  var alphaHex = Math.floor(this.alpha_ * 255).toString(16); 
  return this.color_ +(alphaHex.length == 1 ? '0' + alphaHex: alphaHex); 
}; 
goog.ui.HsvaPalette.prototype.setColorRgbaHex = function(color) { 
  var parsed = goog.ui.HsvaPalette.parseColorRgbaHex_(color); 
  this.setColorAlphaHelper_(parsed[0], parsed[1]); 
}; 
goog.ui.HsvaPalette.prototype.setColorAlphaHelper_ = function(color, alpha) { 
  var colorChange = this.color_ != color; 
  var alphaChange = this.alpha_ != alpha; 
  this.alpha_ = alpha; 
  this.color_ = color; 
  if(colorChange) { 
    goog.ui.HsvaPalette.superClass_.setColor_.call(this, color); 
  } 
  if(colorChange || alphaChange) { 
    this.updateUi_(); 
    this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
  } 
}; 
goog.ui.HsvaPalette.prototype.createDom = function() { 
  goog.ui.HsvaPalette.superClass_.createDom.call(this); 
  var dom = this.getDomHelper(); 
  this.aImageEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'a-image')); 
  this.aHandleEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'a-handle')); 
  this.swatchBackdropEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'swatch-backdrop')); 
  dom.appendChild(this.element_, this.aImageEl_); 
  dom.appendChild(this.element_, this.aHandleEl_); 
  dom.appendChild(this.element_, this.swatchBackdropEl_); 
}; 
goog.ui.HsvaPalette.prototype.disposeInternal = function() { 
  goog.ui.HsvaPalette.superClass_.disposeInternal.call(this); 
  delete this.aImageEl_; 
  delete this.aHandleEl_; 
  delete this.swatchBackdropEl_; 
}; 
goog.ui.HsvaPalette.prototype.updateUi_ = function() { 
  goog.ui.HsvaPalette.superClass_.updateUi_.call(this); 
  if(this.isInDocument()) { 
    var a = this.alpha_ * 255; 
    var top = this.aImageEl_.offsetTop - Math.floor(this.aHandleEl_.offsetHeight / 2) + this.aImageEl_.offsetHeight *((255 - a) / 255); 
    this.aHandleEl_.style.top = top + 'px'; 
    this.aImageEl_.style.backgroundColor = this.color_; 
    goog.style.setOpacity(this.swatchEl_, a / 255); 
  } 
}; 
goog.ui.HsvaPalette.prototype.updateInput = function() { 
  if(! goog.array.equals([this.color_, this.alpha_], goog.ui.HsvaPalette.parseUserInput_(this.inputEl_.value))) { 
    this.inputEl_.value = this.getColorRgbaHex(); 
  } 
}; 
goog.ui.HsvaPalette.prototype.handleMouseDown_ = function(e) { 
  goog.ui.HsvaPalette.superClass_.handleMouseDown_.call(this, e); 
  if(e.target == this.aImageEl_ || e.target == this.aHandleEl_) { 
    var b = goog.style.getBounds(this.vImageEl_); 
    this.handleMouseMoveA_(b, e); 
    this.mouseMoveListener_ = goog.events.listen(this.document_, goog.events.EventType.MOUSEMOVE, goog.bind(this.handleMouseMoveA_, this, b)); 
    this.mouseUpListener_ = goog.events.listen(this.document_, goog.events.EventType.MOUSEUP, this.handleMouseUp_, false, this); 
  } 
}; 
goog.ui.HsvaPalette.prototype.handleMouseMoveA_ = function(b, e) { 
  e.preventDefault(); 
  var vportPos = goog.dom.getPageScroll(); 
  var newA =(b.top + b.height - Math.min(Math.max(vportPos.y + e.clientY, b.top), b.top + b.height)) / b.height; 
  this.setAlpha(newA); 
}; 
goog.ui.HsvaPalette.prototype.handleInput_ = function(e) { 
  var parsed = goog.ui.HsvaPalette.parseUserInput_(this.inputEl_.value); 
  if(parsed) { 
    this.setColorAlphaHelper_(parsed[0], parsed[1]); 
  } 
}; 
goog.ui.HsvaPalette.parseUserInput_ = function(value) { 
  if(/^#[0-9a-f]{8}$/i.test(value)) { 
    return goog.ui.HsvaPalette.parseColorRgbaHex_(value); 
  } else if(/^#[0-9a-f]{6}$/i.test(value)) { 
    return[value, 1]; 
  } 
  return null; 
}; 
goog.ui.HsvaPalette.parseColorRgbaHex_ = function(color) { 
  var hex = goog.color.alpha.parse(color).hex; 
  return[goog.color.alpha.extractHexColor(hex), parseInt(goog.color.alpha.extractAlpha(hex), 16) / 255]; 
}; 
