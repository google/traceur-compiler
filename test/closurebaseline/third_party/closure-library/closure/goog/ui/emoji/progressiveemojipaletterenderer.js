
goog.provide('goog.ui.emoji.ProgressiveEmojiPaletteRenderer'); 
goog.require('goog.ui.emoji.EmojiPaletteRenderer'); 
goog.ui.emoji.ProgressiveEmojiPaletteRenderer = function(defaultImgUrl) { 
  goog.ui.emoji.EmojiPaletteRenderer.call(this, defaultImgUrl); 
}; 
goog.inherits(goog.ui.emoji.ProgressiveEmojiPaletteRenderer, goog.ui.emoji.EmojiPaletteRenderer); 
goog.ui.emoji.ProgressiveEmojiPaletteRenderer.prototype.buildElementFromSpriteMetadata = function(dom, spriteInfo, displayUrl) { 
  var width = spriteInfo.getWidthCssValue(); 
  var height = spriteInfo.getHeightCssValue(); 
  var x = spriteInfo.getXOffsetCssValue(); 
  var y = spriteInfo.getYOffsetCssValue(); 
  var inner = dom.createDom('img', { 'src': displayUrl }); 
  var el =(dom.createDom('div', goog.getCssName('goog-palette-cell-extra'), inner)); 
  goog.style.setStyle(el, { 
    'width': width, 
    'height': height, 
    'overflow': 'hidden', 
    'position': 'relative' 
  }); 
  goog.style.setStyle(inner, { 
    'left': x, 
    'top': y, 
    'position': 'absolute' 
  }); 
  return el; 
}; 
goog.ui.emoji.ProgressiveEmojiPaletteRenderer.prototype.updateAnimatedPaletteItem = function(item, animatedImg) { 
  var img; 
  var el = item.firstChild; 
  while(el) { 
    if('IMG' == el.tagName) { 
      img =(el); 
      break; 
    } 
    el = el.firstChild; 
  } 
  if(! el) { 
    return; 
  } 
  img.width = animatedImg.width; 
  img.height = animatedImg.height; 
  goog.style.setStyle(img, { 
    'left': 0, 
    'top': 0 
  }); 
  img.src = animatedImg.src; 
}; 
