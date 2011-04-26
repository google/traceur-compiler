
goog.provide('goog.ui.emoji.PopupEmojiPicker'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventType'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Popup'); 
goog.require('goog.ui.emoji.EmojiPicker'); 
goog.ui.emoji.PopupEmojiPicker = function(defaultImgUrl, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.emojiPicker_ = new goog.ui.emoji.EmojiPicker(defaultImgUrl, opt_domHelper); 
  this.addChild(this.emojiPicker_); 
  this.getHandler().listen(this.emojiPicker_, goog.ui.Component.EventType.ACTION, this.onEmojiPicked_); 
}; 
goog.inherits(goog.ui.emoji.PopupEmojiPicker, goog.ui.Component); 
goog.ui.emoji.PopupEmojiPicker.prototype.emojiPicker_ = null; 
goog.ui.emoji.PopupEmojiPicker.prototype.popup_ = null; 
goog.ui.emoji.PopupEmojiPicker.prototype.lastTarget_ = null; 
goog.ui.emoji.PopupEmojiPicker.prototype.focusable_ = true; 
goog.ui.emoji.PopupEmojiPicker.prototype.toggleMode_ = true; 
goog.ui.emoji.PopupEmojiPicker.prototype.addEmojiGroup = function(title, emojiGroup) { 
  this.emojiPicker_.addEmojiGroup(title, emojiGroup); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setToggleMode = function(toggle) { 
  this.toggleMode_ = toggle; 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getToggleMode = function() { 
  return this.toggleMode_; 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setDelayedLoad = function(shouldDelay) { 
  if(this.emojiPicker_) { 
    this.emojiPicker_.setDelayedLoad(shouldDelay); 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setFocusable = function(focusable) { 
  this.focusable_ = focusable; 
  if(this.emojiPicker_) { 
    this.emojiPicker_.setFocusable(focusable); 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setUrlPrefix = function(urlPrefix) { 
  this.emojiPicker_.setUrlPrefix(urlPrefix); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setTabLocation = function(tabLocation) { 
  this.emojiPicker_.setTabLocation(tabLocation); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setNumRows = function(numRows) { 
  this.emojiPicker_.setNumRows(numRows); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setNumColumns = function(numCols) { 
  this.emojiPicker_.setNumColumns(numCols); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setProgressiveRender = function(progressive) { 
  if(this.emojiPicker_) { 
    this.emojiPicker_.setProgressiveRender(progressive); 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getNumEmojiGroups = function() { 
  return this.emojiPicker_.getNumEmojiGroups(); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.loadImages = function() { 
  if(this.emojiPicker_) { 
    this.emojiPicker_.loadImages(); 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.createDom = function() { 
  goog.ui.emoji.PopupEmojiPicker.superClass_.createDom.call(this); 
  this.emojiPicker_.createDom(); 
  this.getElement().className = goog.getCssName('goog-ui-popupemojipicker'); 
  this.getElement().appendChild(this.emojiPicker_.getElement()); 
  this.popup_ = new goog.ui.Popup(this.getElement()); 
  this.getElement().unselectable = 'on'; 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.disposeInternal = function() { 
  goog.ui.emoji.PopupEmojiPicker.superClass_.disposeInternal.call(this); 
  this.emojiPicker_ = null; 
  this.lastTarget_ = null; 
  if(this.popup_) { 
    this.popup_.dispose(); 
    this.popup_ = null; 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.attach = function(element) { 
  this.getHandler().listen(element, goog.events.EventType.CLICK, this.show_); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.detach = function(element) { 
  this.getHandler().unlisten(element, goog.events.EventType.CLICK, this.show_); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getEmojiPicker = function() { 
  return this.emojiPicker_; 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getAutoHide = function() { 
  return ! ! this.popup_ && this.popup_.getAutoHide(); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setAutoHide = function(autoHide) { 
  if(this.popup_) { 
    this.popup_.setAutoHide(autoHide); 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getAutoHideRegion = function() { 
  return this.popup_ && this.popup_.getAutoHideRegion(); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.setAutoHideRegion = function(element) { 
  if(this.popup_) { 
    this.popup_.setAutoHideRegion(element); 
  } 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getPopup = function() { 
  return this.popup_; 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getLastTarget = function() { 
  return this.lastTarget_; 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.getSelectedEmoji = function() { 
  return this.emojiPicker_.getSelectedEmoji(); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.show_ = function(e) { 
  if(this.popup_.isOrWasRecentlyVisible() && this.toggleMode_ && this.lastTarget_ == e.currentTarget) { 
    this.popup_.setVisible(false); 
    return; 
  } 
  this.lastTarget_ =(e.currentTarget); 
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(this.lastTarget_, goog.positioning.Corner.BOTTOM_LEFT)); 
  this.popup_.setVisible(true); 
}; 
goog.ui.emoji.PopupEmojiPicker.prototype.onEmojiPicked_ = function(e) { 
  this.popup_.setVisible(false); 
}; 
