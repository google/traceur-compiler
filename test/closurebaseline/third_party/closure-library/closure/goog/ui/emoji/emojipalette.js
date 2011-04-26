
goog.provide('goog.ui.emoji.EmojiPalette'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.net.ImageLoader'); 
goog.require('goog.ui.Palette'); 
goog.require('goog.ui.emoji.Emoji'); 
goog.require('goog.ui.emoji.EmojiPaletteRenderer'); 
goog.ui.emoji.EmojiPalette = function(emoji, opt_urlPrefix, opt_renderer, opt_domHelper) { 
  goog.ui.Palette.call(this, null, opt_renderer || new goog.ui.emoji.EmojiPaletteRenderer(null), opt_domHelper); 
  this.emojiCells_ = { }; 
  this.emojiMap_ = { }; 
  this.animatedEmoji_ =[]; 
  this.urlPrefix_ = opt_urlPrefix || ''; 
  this.emoji_ = this.getEmojiArrayFromProperties_(emoji); 
  this.renderer_ = this.getRenderer(); 
  this.setContent(this.emoji_); 
}; 
goog.inherits(goog.ui.emoji.EmojiPalette, goog.ui.Palette); 
goog.ui.emoji.EmojiPalette.prototype.urlPrefix_ = ''; 
goog.ui.emoji.EmojiPalette.prototype.imagesLoaded_ = false; 
goog.ui.emoji.EmojiPalette.prototype.imageLoader_; 
goog.ui.emoji.EmojiPalette.prototype.getEmojiArrayFromProperties_ = function(emojiGroup) { 
  var emojiItems =[]; 
  for(var i = 0; i < emojiGroup.length; i ++) { 
    var url = emojiGroup[i][0]; 
    var id = emojiGroup[i][1]; 
    var spriteInfo = emojiGroup[i][2]; 
    var displayUrl = spriteInfo ? spriteInfo.getUrl(): this.urlPrefix_ + url; 
    var item = this.renderer_.createPaletteItem(this.getDomHelper(), id, spriteInfo, displayUrl); 
    emojiItems.push(item); 
    var emoji = new goog.ui.emoji.Emoji(url, id); 
    this.emojiCells_[id]= emoji; 
    this.emojiMap_[id]= i; 
    if(spriteInfo && spriteInfo.isAnimated()) { 
      this.animatedEmoji_.push([item, emoji]); 
    } 
  } 
  if(this.animatedEmoji_.length > 0) { 
    this.imageLoader_ = new goog.net.ImageLoader(); 
  } 
  this.imagesLoaded_ = true; 
  return emojiItems; 
}; 
goog.ui.emoji.EmojiPalette.prototype.loadAnimatedEmoji = function() { 
  if(this.animatedEmoji_.length > 0) { 
    for(var i = 0; i < this.animatedEmoji_.length; i ++) { 
      var paletteItem = this.animatedEmoji_[i][0]; 
      var emoji = this.animatedEmoji_[i][1]; 
      var url = this.urlPrefix_ + emoji.getUrl(); 
      this.imageLoader_.addImage(emoji.getId(), url); 
    } 
    this.getHandler().listen(this.imageLoader_, goog.events.EventType.LOAD, this.handleImageLoad_); 
    this.imageLoader_.start(); 
  } 
}; 
goog.ui.emoji.EmojiPalette.prototype.handleImageLoad_ = function(e) { 
  var id = e.target.id; 
  var url = e.target.src; 
  if(id && url) { 
    var item = this.emoji_[this.emojiMap_[id]]; 
    if(item) { 
      this.getRenderer().updateAnimatedPaletteItem(item, e.target); 
    } 
  } 
}; 
goog.ui.emoji.EmojiPalette.prototype.getImageLoader = function() { 
  return this.imageLoader_; 
}; 
goog.ui.emoji.EmojiPalette.prototype.disposeInternal = function() { 
  goog.ui.emoji.EmojiPalette.superClass_.disposeInternal.call(this); 
  if(this.imageLoader_) { 
    this.imageLoader_.dispose(); 
    this.imageLoader_ = null; 
  } 
  this.animatedEmoji_ = null; 
  this.emojiCells_ = null; 
  this.emojiMap_ = null; 
  this.emoji_ = null; 
}; 
goog.ui.emoji.EmojiPalette.prototype.getGoomojiIdFromElement_ = function(el) { 
  if(! el) { 
    return null; 
  } 
  var item = this.getRenderer().getContainingItem(this, el); 
  return item ? item.getAttribute(goog.ui.emoji.Emoji.ATTRIBUTE): null; 
}; 
goog.ui.emoji.EmojiPalette.prototype.getSelectedEmoji = function() { 
  var elem =(this.getSelectedItem()); 
  var goomojiId = this.getGoomojiIdFromElement_(elem); 
  return this.emojiCells_[goomojiId]; 
}; 
goog.ui.emoji.EmojiPalette.prototype.getNumberOfEmoji = function() { 
  return this.emojiCells_.length; 
}; 
goog.ui.emoji.EmojiPalette.prototype.getEmojiIndex = function(id) { 
  return this.emojiMap_[id]; 
}; 
