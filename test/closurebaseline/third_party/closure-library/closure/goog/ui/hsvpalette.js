
goog.provide('goog.ui.HsvPalette'); 
goog.require('goog.color'); 
goog.require('goog.dom'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.InputHandler'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.userAgent'); 
goog.ui.HsvPalette = function(opt_domHelper, opt_color, opt_class) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.setColor_(opt_color || '#f00'); 
  this.class_ = opt_class || goog.getCssName('goog-hsv-palette'); 
  this.document_ = this.getDomHelper().getDocument(); 
}; 
goog.inherits(goog.ui.HsvPalette, goog.ui.Component); 
goog.ui.HsvPalette.prototype.hsImageEl_; 
goog.ui.HsvPalette.prototype.hsHandleEl_; 
goog.ui.HsvPalette.prototype.vImageEl_; 
goog.ui.HsvPalette.prototype.vHandleEl_; 
goog.ui.HsvPalette.prototype.swatchEl_; 
goog.ui.HsvPalette.prototype.inputEl_; 
goog.ui.HsvPalette.prototype.inputHandler_; 
goog.ui.HsvPalette.prototype.mouseMoveListener_; 
goog.ui.HsvPalette.prototype.mouseUpListener_; 
goog.ui.HsvPalette.prototype.getColor = function() { 
  return this.color_; 
}; 
goog.ui.HsvPalette.prototype.getAlpha = function() { 
  return 1; 
}; 
goog.ui.HsvPalette.prototype.updateInput = function() { 
  var parsed; 
  try { 
    parsed = goog.color.parse(this.inputEl_.value).hex; 
  } catch(e) { } 
  if(this.color_ != parsed) { 
    this.inputEl_.value = this.color_; 
  } 
}; 
goog.ui.HsvPalette.prototype.setColor = function(color) { 
  if(color != this.color_) { 
    this.setColor_(color); 
    this.updateUi_(); 
    this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
  } 
}; 
goog.ui.HsvPalette.prototype.setColor_ = function(color) { 
  var rgbHex = goog.color.parse(color).hex; 
  var rgbArray = goog.color.hexToRgb(rgbHex); 
  this.hsv_ = goog.color.rgbArrayToHsv(rgbArray); 
  this.hsv_[0]= this.hsv_[0]/ 360; 
  this.color_ = rgbHex; 
}; 
goog.ui.HsvPalette.prototype.setHsv = function(opt_hue, opt_saturation, opt_value) { 
  if(opt_hue != null || opt_saturation != null || opt_value != null) { 
    this.setHsv_(opt_hue, opt_saturation, opt_value); 
    this.updateUi_(); 
    this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
  } 
}; 
goog.ui.HsvPalette.prototype.setHsv_ = function(opt_hue, opt_saturation, opt_value) { 
  this.hsv_[0]=(opt_hue != null) ? opt_hue: this.hsv_[0]; 
  this.hsv_[1]=(opt_saturation != null) ? opt_saturation: this.hsv_[1]; 
  this.hsv_[2]=(opt_value != null) ? opt_value: this.hsv_[2]; 
  this.color_ = goog.color.hsvArrayToHex([this.hsv_[0]* 360, this.hsv_[1], this.hsv_[2]]); 
}; 
goog.ui.HsvPalette.prototype.canDecorate = function(element) { 
  return false; 
}; 
goog.ui.HsvPalette.prototype.createDom = function() { 
  var dom = this.getDomHelper(); 
  var noalpha =(goog.userAgent.IE && ! goog.userAgent.isVersion('7')) ? ' ' + goog.getCssName(this.class_, 'noalpha'): ''; 
  var element = dom.createDom(goog.dom.TagName.DIV, this.class_ + noalpha, dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'hs-backdrop')), this.hsImageEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'hs-image')), this.hsHandleEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'hs-handle')), this.vImageEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'v-image')), this.vHandleEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'v-handle')), this.swatchEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(this.class_, 'swatch')), dom.createDom('label', null, this.inputEl_ = dom.createDom('input', { 
    'class': goog.getCssName(this.class_, 'input'), 
    'type': 'text' 
  }))); 
  this.setElementInternal(element); 
}; 
goog.ui.HsvPalette.prototype.enterDocument = function() { 
  goog.ui.HsvPalette.superClass_.enterDocument.call(this); 
  this.updateUi_(); 
  var handler = this.getHandler(); 
  handler.listen(this.getElement(), goog.events.EventType.MOUSEDOWN, this.handleMouseDown_, false, this); 
  if(! this.inputHandler_) { 
    this.inputHandler_ = new goog.events.InputHandler(this.inputEl_); 
  } 
  handler.listen(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.handleInput_, false, this); 
}; 
goog.ui.HsvPalette.prototype.disposeInternal = function() { 
  goog.ui.HsvPalette.superClass_.disposeInternal.call(this); 
  delete this.hsImageEl_; 
  delete this.hsHandleEl_; 
  delete this.vImageEl_; 
  delete this.vHandleEl_; 
  delete this.swatchEl_; 
  delete this.inputEl_; 
  if(this.inputHandler_) { 
    this.inputHandler_.dispose(); 
    delete this.inputHandler_; 
  } 
  goog.events.unlistenByKey(this.mouseMoveListener_); 
  goog.events.unlistenByKey(this.mouseUpListener_); 
}; 
goog.ui.HsvPalette.prototype.updateUi_ = function() { 
  if(this.isInDocument()) { 
    var h = this.hsv_[0]; 
    var s = this.hsv_[1]; 
    var v = this.hsv_[2]; 
    var left = this.hsImageEl_.offsetLeft - Math.floor(this.hsHandleEl_.offsetWidth / 2) + this.hsImageEl_.offsetWidth * h; 
    this.hsHandleEl_.style.left = left + 'px'; 
    var top = this.hsImageEl_.offsetTop - Math.floor(this.hsHandleEl_.offsetHeight / 2) + this.hsImageEl_.offsetHeight *(1 - s); 
    this.hsHandleEl_.style.top = top + 'px'; 
    top = this.vImageEl_.offsetTop - Math.floor(this.vHandleEl_.offsetHeight / 2) + this.vImageEl_.offsetHeight *((255 - v) / 255); 
    this.vHandleEl_.style.top = top + 'px'; 
    goog.style.setOpacity(this.hsImageEl_,(v / 255)); 
    goog.style.setStyle(this.vImageEl_, 'background-color', goog.color.hsvToHex(this.hsv_[0]* 360, this.hsv_[1], 255)); 
    goog.style.setStyle(this.swatchEl_, 'background-color', this.color_); 
    goog.style.setStyle(this.swatchEl_, 'color',(this.hsv_[2]> 255 / 2) ? '#000': '#fff'); 
    this.updateInput(); 
  } 
}; 
goog.ui.HsvPalette.prototype.handleMouseDown_ = function(e) { 
  if(e.target == this.vImageEl_ || e.target == this.vHandleEl_) { 
    var b = goog.style.getBounds(this.vImageEl_); 
    this.handleMouseMoveV_(b, e); 
    this.mouseMoveListener_ = goog.events.listen(this.document_, goog.events.EventType.MOUSEMOVE, goog.bind(this.handleMouseMoveV_, this, b)); 
    this.mouseUpListener_ = goog.events.listen(this.document_, goog.events.EventType.MOUSEUP, this.handleMouseUp_, false, this); 
  } else if(e.target == this.hsImageEl_ || e.target == this.hsHandleEl_) { 
    var b = goog.style.getBounds(this.hsImageEl_); 
    this.handleMouseMoveHs_(b, e); 
    this.mouseMoveListener_ = goog.events.listen(this.document_, goog.events.EventType.MOUSEMOVE, goog.bind(this.handleMouseMoveHs_, this, b)); 
    this.mouseUpListener_ = goog.events.listen(this.document_, goog.events.EventType.MOUSEUP, this.handleMouseUp_, false, this); 
  } 
}; 
goog.ui.HsvPalette.prototype.handleMouseMoveV_ = function(b, e) { 
  e.preventDefault(); 
  var vportPos = this.getDomHelper().getDocumentScroll(); 
  var newV = Math.round(255 *(b.top + b.height - Math.min(Math.max(vportPos.y + e.clientY, b.top), b.top + b.height)) / b.height); 
  this.setHsv(null, null, newV); 
}; 
goog.ui.HsvPalette.prototype.handleMouseMoveHs_ = function(b, e) { 
  e.preventDefault(); 
  var vportPos = this.getDomHelper().getDocumentScroll(); 
  var newH =(Math.min(Math.max(vportPos.x + e.clientX, b.left), b.left + b.width) - b.left) / b.width; 
  var newS =(- Math.min(Math.max(vportPos.y + e.clientY, b.top), b.top + b.height) + b.top + b.height) / b.height; 
  this.setHsv(newH, newS, null); 
}; 
goog.ui.HsvPalette.prototype.handleMouseUp_ = function(e) { 
  goog.events.unlistenByKey(this.mouseMoveListener_); 
  goog.events.unlistenByKey(this.mouseUpListener_); 
}; 
goog.ui.HsvPalette.prototype.handleInput_ = function(e) { 
  if(/^#[0-9a-f]{6}$/i.test(this.inputEl_.value)) { 
    this.setColor(this.inputEl_.value); 
  } 
}; 
