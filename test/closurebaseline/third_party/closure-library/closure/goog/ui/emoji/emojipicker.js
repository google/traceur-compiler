
goog.provide('goog.ui.emoji.EmojiPicker'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.TabPane'); 
goog.require('goog.ui.TabPane.TabPage'); 
goog.require('goog.ui.emoji.Emoji'); 
goog.require('goog.ui.emoji.EmojiPalette'); 
goog.require('goog.ui.emoji.EmojiPaletteRenderer'); 
goog.require('goog.ui.emoji.ProgressiveEmojiPaletteRenderer'); 
goog.ui.emoji.EmojiPicker = function(defaultImgUrl, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.defaultImgUrl_ = defaultImgUrl; 
  this.emoji_ =[]; 
  this.pages_ =[]; 
  this.pageLoadStatus_ =[]; 
  this.tabPane_ = null; 
  this.getHandler().listen(this, goog.ui.Component.EventType.ACTION, this.onEmojiPaletteAction_); 
}; 
goog.inherits(goog.ui.emoji.EmojiPicker, goog.ui.Component); 
goog.ui.emoji.EmojiPicker.DEFAULT_NUM_ROWS = 5; 
goog.ui.emoji.EmojiPicker.DEFAULT_NUM_COLS = 10; 
goog.ui.emoji.EmojiPicker.DEFAULT_TAB_LOCATION = goog.ui.TabPane.TabLocation.TOP; 
goog.ui.emoji.EmojiPicker.prototype.numRows_ = goog.ui.emoji.EmojiPicker.DEFAULT_NUM_ROWS; 
goog.ui.emoji.EmojiPicker.prototype.numCols_ = goog.ui.emoji.EmojiPicker.DEFAULT_NUM_COLS; 
goog.ui.emoji.EmojiPicker.prototype.autoSizeByColumnCount_ = true; 
goog.ui.emoji.EmojiPicker.prototype.tabLocation_ = goog.ui.emoji.EmojiPicker.DEFAULT_TAB_LOCATION; 
goog.ui.emoji.EmojiPicker.prototype.focusable_ = true; 
goog.ui.emoji.EmojiPicker.prototype.defaultImgUrl_; 
goog.ui.emoji.EmojiPicker.prototype.urlPrefix_; 
goog.ui.emoji.EmojiPicker.prototype.delayedLoad_ = false; 
goog.ui.emoji.EmojiPicker.prototype.progressiveRender_ = false; 
goog.ui.emoji.EmojiPicker.prototype.manualLoadOfAnimatedEmoji_ = false; 
goog.ui.emoji.EmojiPicker.prototype.activePage_ = - 1; 
goog.ui.emoji.EmojiPicker.prototype.addEmojiGroup = function(title, emojiGroup) { 
  this.emoji_.push({ 
    title: title, 
    emoji: emojiGroup 
  }); 
}; 
goog.ui.emoji.EmojiPicker.prototype.getNumRows = function() { 
  return this.numRows_; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getNumColumns = function() { 
  return this.numCols_; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setNumRows = function(numRows) { 
  this.numRows_ = numRows; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setNumColumns = function(numCols) { 
  this.numCols_ = numCols; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setAutoSizeByColumnCount = function(autoSize) { 
  this.autoSizeByColumnCount_ = autoSize; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setTabLocation = function(tabLocation) { 
  this.tabLocation_ = tabLocation; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setDelayedLoad = function(shouldDelay) { 
  this.delayedLoad_ = shouldDelay; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setManualLoadOfAnimatedEmoji = function(manual) { 
  this.manualLoadOfAnimatedEmoji_ = manual; 
}; 
goog.ui.emoji.EmojiPicker.prototype.isFocusable = function() { 
  return this.focusable_; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setFocusable = function(focusable) { 
  this.focusable_ = focusable; 
  for(var i = 0; i < this.pages_.length; i ++) { 
    if(this.pages_[i]) { 
      this.pages_[i].setSupportedState(goog.ui.Component.State.FOCUSED, focusable); 
    } 
  } 
}; 
goog.ui.emoji.EmojiPicker.prototype.setUrlPrefix = function(urlPrefix) { 
  this.urlPrefix_ = urlPrefix; 
}; 
goog.ui.emoji.EmojiPicker.prototype.setProgressiveRender = function(progressive) { 
  this.progressiveRender_ = progressive; 
}; 
goog.ui.emoji.EmojiPicker.prototype.logger_ = goog.debug.Logger.getLogger('goog.ui.emoji.EmojiPicker'); 
goog.ui.emoji.EmojiPicker.prototype.adjustNumRowsIfNecessary_ = function() { 
  var currentMax = 0; 
  for(var i = 0; i < this.emoji_.length; i ++) { 
    var numEmoji = this.emoji_[i].emoji.length; 
    var rowsNeeded = Math.ceil(numEmoji / this.numCols_); 
    if(rowsNeeded > currentMax) { 
      currentMax = rowsNeeded; 
    } 
  } 
  this.setNumRows(currentMax); 
}; 
goog.ui.emoji.EmojiPicker.prototype.loadImages = function() { 
  if(! this.delayedLoad_) { 
    return; 
  } 
  this.loadPage_(0); 
  this.activePage_ = 0; 
}; 
goog.ui.emoji.EmojiPicker.prototype.createDom = function() { 
  this.setElementInternal(this.getDomHelper().createDom('div')); 
  if(this.autoSizeByColumnCount_) { 
    this.adjustNumRowsIfNecessary_(); 
  } 
  if(this.emoji_.length == 0) { 
    throw Error('Must add some emoji to the picker'); 
  } 
  if(this.emoji_.length > 1) { 
    var div = this.getDomHelper().createDom('div'); 
    this.getElement().appendChild(div); 
    this.tabPane_ = new goog.ui.TabPane(div, this.tabLocation_, this.getDomHelper(), true); 
  } 
  this.renderer_ = this.progressiveRender_ ? new goog.ui.emoji.ProgressiveEmojiPaletteRenderer(this.defaultImgUrl_): new goog.ui.emoji.EmojiPaletteRenderer(this.defaultImgUrl_); 
  for(var i = 0; i < this.emoji_.length; i ++) { 
    var emoji = this.emoji_[i].emoji; 
    var page = this.delayedLoad_ ? this.createPlaceholderEmojiPage_(emoji): this.createEmojiPage_(emoji, i); 
    this.pages_.push(page); 
  } 
  this.activePage_ = 0; 
  this.getElement().tabIndex = 0; 
}; 
goog.ui.emoji.EmojiPicker.prototype.manuallyLoadAnimatedEmoji = function() { 
  for(var i = 0; i < this.pages_.length; i ++) { 
    this.pages_[i].loadAnimatedEmoji(); 
  } 
}; 
goog.ui.emoji.EmojiPicker.prototype.createEmojiPage_ = function(emoji, index) { 
  if(this.pageLoadStatus_[index]) { 
    return null; 
  } 
  var palette = new goog.ui.emoji.EmojiPalette(emoji, this.urlPrefix_, this.renderer_, this.getDomHelper()); 
  if(! this.manualLoadOfAnimatedEmoji_) { 
    palette.loadAnimatedEmoji(); 
  } 
  palette.setSize(this.numCols_, this.numRows_); 
  palette.setSupportedState(goog.ui.Component.State.FOCUSED, this.focusable_); 
  palette.createDom(); 
  palette.setParent(this); 
  this.pageLoadStatus_[index]= true; 
  return palette; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getPlaceholderEmoji_ = function(emoji) { 
  var placeholderEmoji =[]; 
  for(var i = 0; i < emoji.length; i ++) { 
    placeholderEmoji.push([this.defaultImgUrl_, emoji[i][1]]); 
  } 
  return placeholderEmoji; 
}; 
goog.ui.emoji.EmojiPicker.prototype.createPlaceholderEmojiPage_ = function(emoji) { 
  var placeholderEmoji = this.getPlaceholderEmoji_(emoji); 
  var palette = new goog.ui.emoji.EmojiPalette(placeholderEmoji, null, this.renderer_, this.getDomHelper()); 
  palette.setSize(this.numCols_, this.numRows_); 
  palette.setSupportedState(goog.ui.Component.State.FOCUSED, this.focusable_); 
  palette.createDom(); 
  palette.setParent(this); 
  return palette; 
}; 
goog.ui.emoji.EmojiPicker.prototype.canDecorate = function(element) { 
  return false; 
}; 
goog.ui.emoji.EmojiPicker.prototype.enterDocument = function() { 
  goog.ui.emoji.EmojiPicker.superClass_.enterDocument.call(this); 
  for(var i = 0; i < this.pages_.length; i ++) { 
    this.pages_[i].enterDocument(); 
    var pageElement = this.pages_[i].getElement(); 
    if(this.pages_.length > 1) { 
      var title = this.emoji_[i].title ||(i + 1); 
      this.tabPane_.addPage(new goog.ui.TabPane.TabPage(pageElement, title, this.getDomHelper())); 
    } else { 
      this.getElement().appendChild(pageElement); 
    } 
  } 
  if(this.tabPane_) { 
    this.getHandler().listen(this.tabPane_, goog.ui.TabPane.Events.CHANGE, this.onPageChanged_); 
    goog.style.setUnselectable(this.tabPane_.getElement(), true); 
  } 
  this.getElement().unselectable = 'on'; 
}; 
goog.ui.emoji.EmojiPicker.prototype.exitDocument = function() { 
  goog.ui.emoji.EmojiPicker.superClass_.exitDocument.call(this); 
  for(var i = 0; i < this.pages_.length; i ++) { 
    this.pages_[i].exitDocument(); 
  } 
}; 
goog.ui.emoji.EmojiPicker.prototype.disposeInternal = function() { 
  goog.ui.emoji.EmojiPicker.superClass_.disposeInternal.call(this); 
  if(this.tabPane_) { 
    this.tabPane_.dispose(); 
    this.tabPane_ = null; 
  } 
  for(var i = 0; i < this.pages_.length; i ++) { 
    this.pages_[i].dispose(); 
  } 
  this.pages_.length = 0; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getCssClass = function() { 
  return goog.getCssName('goog-ui-emojipicker'); 
}; 
goog.ui.emoji.EmojiPicker.prototype.getSelectedEmoji = function() { 
  return this.urlPrefix_ ? new goog.ui.emoji.Emoji(this.urlPrefix_ + this.selectedEmoji_.getId(), this.selectedEmoji_.getId()): this.selectedEmoji_; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getNumEmojiGroups = function() { 
  return this.emoji_.length; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getPage = function(index) { 
  return this.pages_[index]; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getPages = function() { 
  return this.pages_; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getTabPane = function() { 
  return this.tabPane_; 
}; 
goog.ui.emoji.EmojiPicker.prototype.getActivePage_ = function() { 
  return this.pages_[this.activePage_]; 
}; 
goog.ui.emoji.EmojiPicker.prototype.onEmojiPaletteAction_ = function(e) { 
  this.selectedEmoji_ = this.getActivePage_().getSelectedEmoji(); 
}; 
goog.ui.emoji.EmojiPicker.prototype.onPageChanged_ = function(e) { 
  var index =(e.page.getIndex()); 
  this.loadPage_(index); 
  this.activePage_ = index; 
}; 
goog.ui.emoji.EmojiPicker.prototype.loadPage_ = function(index) { 
  if(index < 0 || index > this.pages_.length) { 
    throw Error('Index out of bounds'); 
  } 
  if(! this.pageLoadStatus_[index]) { 
    var oldPage = this.pages_[index]; 
    this.pages_[index]= this.createEmojiPage_(this.emoji_[index].emoji, index); 
    this.pages_[index].enterDocument(); 
    var pageElement = this.pages_[index].getElement(); 
    if(this.pages_.length > 1) { 
      this.tabPane_.removePage(index); 
      var title = this.emoji_[index].title ||(index + 1); 
      this.tabPane_.addPage(new goog.ui.TabPane.TabPage(pageElement, title, this.getDomHelper()), index); 
      this.tabPane_.setSelectedIndex(index); 
    } else { 
      var el = this.getElement(); 
      el.appendChild(pageElement); 
    } 
    if(oldPage) { 
      oldPage.dispose(); 
    } 
  } 
}; 
