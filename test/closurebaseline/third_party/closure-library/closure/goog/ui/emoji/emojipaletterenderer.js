
goog.provide('goog.ui.emoji.EmojiPaletteRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.ui.PaletteRenderer'); 
goog.require('goog.ui.emoji.Emoji'); 
goog.require('goog.ui.emoji.SpriteInfo'); 
goog.ui.emoji.EmojiPaletteRenderer = function(defaultImgUrl) { 
  goog.ui.PaletteRenderer.call(this); 
  this.defaultImgUrl_ = defaultImgUrl; 
}; 
goog.inherits(goog.ui.emoji.EmojiPaletteRenderer, goog.ui.PaletteRenderer); 
goog.ui.emoji.EmojiPaletteRenderer.cellId_ = 0; 
goog.ui.emoji.EmojiPaletteRenderer.prototype.defaultImgUrl_ = null; 
goog.ui.emoji.EmojiPaletteRenderer.getCssClass = function() { 
  return goog.getCssName('goog-ui-emojipalette'); 
}; 
goog.ui.emoji.EmojiPaletteRenderer.prototype.createPaletteItem = function(dom, id, spriteInfo, displayUrl) { 
  var el; 
  if(spriteInfo) { 
    var cssClass = spriteInfo.getCssClass(); 
    if(cssClass) { 
      el = dom.createDom('div', cssClass); 
    } else { 
      el = this.buildElementFromSpriteMetadata(dom, spriteInfo, displayUrl); 
    } 
  } else { 
    el = dom.createDom('img', { 'src': displayUrl }); 
  } 
  var outerdiv = dom.createDom('div', goog.getCssName('goog-palette-cell-wrapper'), el); 
  outerdiv.setAttribute(goog.ui.emoji.Emoji.ATTRIBUTE, id); 
  return(outerdiv); 
}; 
goog.ui.emoji.EmojiPaletteRenderer.prototype.updateAnimatedPaletteItem = function(item, animatedImg) { 
  var inner =(item.firstChild); 
  var classes = goog.dom.classes.get(inner); 
  if(classes && classes.length == 1) { 
    inner.className = ''; 
  } 
  goog.style.setStyle(inner, { 
    'width': animatedImg.width, 
    'height': animatedImg.height, 
    'background-image': 'url(' + animatedImg.src + ')', 
    'background-position': '0 0' 
  }); 
}; 
goog.ui.emoji.EmojiPaletteRenderer.prototype.buildElementFromSpriteMetadata = function(dom, spriteInfo, displayUrl) { 
  var width = spriteInfo.getWidthCssValue(); 
  var height = spriteInfo.getHeightCssValue(); 
  var x = spriteInfo.getXOffsetCssValue(); 
  var y = spriteInfo.getYOffsetCssValue(); 
  var el = dom.createDom('div'); 
  goog.style.setStyle(el, { 
    'width': width, 
    'height': height, 
    'background-image': 'url(' + displayUrl + ')', 
    'background-repeat': 'no-repeat', 
    'background-position': x + ' ' + y 
  }); 
  return(el); 
}; 
goog.ui.emoji.EmojiPaletteRenderer.prototype.createCell = function(node, dom) { 
  if(! node) { 
    var elem = this.defaultImgUrl_ ? dom.createDom('img', { 'src': this.defaultImgUrl_ }): dom.createDom('div'); 
    node = dom.createDom('div', goog.getCssName('goog-palette-cell-wrapper'), elem); 
  } 
  var cell = dom.createDom('td', { 
    'class': goog.getCssName(this.getCssClass(), 'cell'), 
    'id': this.getCssClass() + '-cell-' + goog.ui.emoji.EmojiPaletteRenderer.cellId_ ++ 
  }, node); 
  goog.dom.a11y.setRole(cell, 'gridcell'); 
  return cell; 
}; 
goog.ui.emoji.EmojiPaletteRenderer.prototype.getContainingItem = function(palette, node) { 
  var root = palette.getElement(); 
  while(node && node.nodeType == goog.dom.NodeType.ELEMENT && node != root) { 
    if(node.tagName == 'TD') { 
      return node.firstChild; 
    } 
    node = node.parentNode; 
  } 
  return null; 
}; 
