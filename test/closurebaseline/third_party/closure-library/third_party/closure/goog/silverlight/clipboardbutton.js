
goog.provide('goog.silverlight.ClipboardButton'); 
goog.provide('goog.silverlight.ClipboardButtonType'); 
goog.provide('goog.silverlight.ClipboardEvent'); 
goog.provide('goog.silverlight.CopyButton'); 
goog.provide('goog.silverlight.PasteButton'); 
goog.provide('goog.silverlight.PasteButtonEvent'); 
goog.require('goog.asserts'); 
goog.require('goog.events.Event'); 
goog.require('goog.math.Size'); 
goog.require('goog.silverlight'); 
goog.require('goog.ui.Component'); 
goog.silverlight.ClipboardButton = function(type, callback, slResource, caption, opt_domHelper) { 
  goog.asserts.assert(goog.silverlight.ClipboardButton.hasClipboardAccess(), 'no clipboard access'); 
  goog.base(this, opt_domHelper); 
  this.callbackId_ = goog.asserts.assertString(goog.silverlight.getHandlerName(callback)); 
  this.caption_ = caption; 
  this.slResource_ = slResource; 
  this.type_ = type; 
  this.size_ = goog.silverlight.ClipboardButton.DEFAULT_SIZE_; 
}; 
goog.inherits(goog.silverlight.ClipboardButton, goog.ui.Component); 
goog.silverlight.ClipboardButton.DEFAULT_SIZE_ = new goog.math.Size(100, 30); 
goog.silverlight.ClipboardButton.prototype.setSize = function(size) { 
  this.size_ = size; 
}; 
goog.silverlight.ClipboardButton.prototype.createDom = function() { 
  var dom = this.getDomHelper(); 
  var element = dom.createDom('div', goog.getCssName('goog-inline-block')); 
  this.setElementInternal(element); 
  goog.silverlight.createObject(this.slResource_, element, null, { 
    version: '4.0', 
    width: this.size_.width, 
    height: this.size_.height 
  }, null,['buttonType=' + this.type_, 'callbackName=' + this.callbackId_, 'Content=' + this.caption_].join(',')); 
}; 
goog.silverlight.ClipboardButton.hasClipboardAccess = function() { 
  return goog.silverlight.isInstalled('4.0'); 
}; 
goog.silverlight.ClipboardButton.prototype.disposeInternal = function() { 
  goog.silverlight.disposeHandlerName(this.callbackId_); 
  goog.base(this, 'disposeInternal'); 
}; 
goog.silverlight.ClipboardButtonType = { 
  COPY: 1, 
  PASTE: 2 
}; 
goog.silverlight.ClipboardEvent = function(type, opt_data) { 
  goog.base(this, type); 
  this.data_ = opt_data || null; 
}; 
goog.inherits(goog.silverlight.ClipboardEvent, goog.events.Event); 
goog.silverlight.ClipboardEvent.prototype.getData = function() { 
  return this.data_; 
}; 
goog.silverlight.ClipboardEvent.prototype.setData = function(data) { 
  this.data_ = data; 
}; 
goog.silverlight.ClipboardEventType = { 
  COPY: 'copy', 
  PASTE: 'paste' 
}; 
goog.silverlight.PasteButton = function(slResource, opt_caption, opt_domHelper) { 
  var MSG_DEFAULT_PASTE_BUTTON_CAPTION = goog.getMsg('Paste'); 
  var caption = opt_caption || MSG_DEFAULT_PASTE_BUTTON_CAPTION; 
  goog.base(this, goog.silverlight.ClipboardButtonType.PASTE, goog.bind(this.handlePaste_, this), slResource, caption, opt_domHelper); 
}; 
goog.inherits(goog.silverlight.PasteButton, goog.silverlight.ClipboardButton); 
goog.silverlight.PasteButton.prototype.handlePaste_ = function(content) { 
  this.dispatchEvent(new goog.silverlight.ClipboardEvent(goog.silverlight.ClipboardEventType.PASTE, content)); 
}; 
goog.silverlight.CopyButton = function(slResource, opt_caption, opt_domHelper) { 
  var MSG_DEFAULT_COPY_BUTTON_CAPTION = goog.getMsg('Copy'); 
  var caption = opt_caption || MSG_DEFAULT_COPY_BUTTON_CAPTION; 
  goog.base(this, goog.silverlight.ClipboardButtonType.COPY, goog.bind(this.handleCopy_, this), slResource, caption, opt_domHelper); 
}; 
goog.inherits(goog.silverlight.CopyButton, goog.silverlight.ClipboardButton); 
goog.silverlight.CopyButton.prototype.handleCopy_ = function() { 
  var event = new goog.silverlight.ClipboardEvent(goog.silverlight.ClipboardEventType.COPY); 
  this.dispatchEvent(event); 
  return event.getData() || ''; 
}; 
