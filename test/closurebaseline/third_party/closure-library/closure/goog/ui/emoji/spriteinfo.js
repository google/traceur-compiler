
goog.provide('goog.ui.emoji.SpriteInfo'); 
goog.ui.emoji.SpriteInfo = function(cssClass, opt_url, opt_width, opt_height, opt_xOffset, opt_yOffset, opt_animated) { 
  if(cssClass != null) { 
    this.cssClass_ = cssClass; 
  } else { 
    if(opt_url == undefined || opt_width === undefined || opt_height === undefined || opt_xOffset == undefined || opt_yOffset === undefined) { 
      throw Error('Sprite info is not fully specified'); 
    } 
    this.url_ = opt_url; 
    this.width_ = opt_width; 
    this.height_ = opt_height; 
    this.xOffset_ = opt_xOffset; 
    this.yOffset_ = opt_yOffset; 
  } 
  this.animated_ = ! ! opt_animated; 
}; 
goog.ui.emoji.SpriteInfo.prototype.cssClass_; 
goog.ui.emoji.SpriteInfo.prototype.url_; 
goog.ui.emoji.SpriteInfo.prototype.width_; 
goog.ui.emoji.SpriteInfo.prototype.height_; 
goog.ui.emoji.SpriteInfo.prototype.xOffset_; 
goog.ui.emoji.SpriteInfo.prototype.yOffset_; 
goog.ui.emoji.SpriteInfo.prototype.animated_; 
goog.ui.emoji.SpriteInfo.prototype.getCssClass = function() { 
  return this.cssClass_ || null; 
}; 
goog.ui.emoji.SpriteInfo.prototype.getUrl = function() { 
  return this.url_ || null; 
}; 
goog.ui.emoji.SpriteInfo.prototype.isAnimated = function() { 
  return this.animated_; 
}; 
goog.ui.emoji.SpriteInfo.prototype.getWidthCssValue = function() { 
  return goog.ui.emoji.SpriteInfo.getCssPixelValue_(this.width_); 
}; 
goog.ui.emoji.SpriteInfo.prototype.getHeightCssValue = function() { 
  return goog.ui.emoji.SpriteInfo.getCssPixelValue_(this.height_); 
}; 
goog.ui.emoji.SpriteInfo.prototype.getXOffsetCssValue = function() { 
  return goog.ui.emoji.SpriteInfo.getOffsetCssValue_(this.xOffset_); 
}; 
goog.ui.emoji.SpriteInfo.prototype.getYOffsetCssValue = function() { 
  return goog.ui.emoji.SpriteInfo.getOffsetCssValue_(this.yOffset_); 
}; 
goog.ui.emoji.SpriteInfo.getCssPixelValue_ = function(value) { 
  return ! value ? '0': value + 'px'; 
}; 
goog.ui.emoji.SpriteInfo.getOffsetCssValue_ = function(posOffset) { 
  var offset = goog.ui.emoji.SpriteInfo.getCssPixelValue_(posOffset); 
  return offset == '0' ? offset: '-' + offset; 
}; 
