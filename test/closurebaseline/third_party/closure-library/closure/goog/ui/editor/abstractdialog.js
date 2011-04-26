
goog.provide('goog.ui.editor.AbstractDialog'); 
goog.provide('goog.ui.editor.AbstractDialog.Builder'); 
goog.provide('goog.ui.editor.AbstractDialog.EventType'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.ui.Dialog'); 
goog.require('goog.ui.Dialog.ButtonSet'); 
goog.require('goog.ui.Dialog.DefaultButtonKeys'); 
goog.require('goog.ui.Dialog.Event'); 
goog.require('goog.ui.Dialog.EventType'); 
goog.ui.editor.AbstractDialog = function(domHelper) { 
  goog.events.EventTarget.call(this); 
  this.dom = domHelper; 
}; 
goog.inherits(goog.ui.editor.AbstractDialog, goog.events.EventTarget); 
goog.ui.editor.AbstractDialog.prototype.show = function() { 
  if(! this.dialogInternal_) { 
    this.dialogInternal_ = this.createDialogControl(); 
    this.dialogInternal_.addEventListener(goog.ui.Dialog.EventType.AFTER_HIDE, this.handleAfterHide_, false, this); 
  } 
  this.dialogInternal_.setVisible(true); 
}; 
goog.ui.editor.AbstractDialog.prototype.hide = function() { 
  if(this.dialogInternal_) { 
    this.dialogInternal_.setVisible(false); 
  } 
}; 
goog.ui.editor.AbstractDialog.prototype.isOpen = function() { 
  return ! ! this.dialogInternal_ && this.dialogInternal_.isVisible(); 
}; 
goog.ui.editor.AbstractDialog.prototype.processOkAndClose = function() { 
  var evt = new goog.ui.Dialog.Event(goog.ui.Dialog.DefaultButtonKeys.OK, null); 
  if(this.handleOk(evt)) { 
    this.hide(); 
  } 
}; 
goog.ui.editor.AbstractDialog.EventType = { 
  AFTER_HIDE: 'afterhide', 
  CANCEL: 'cancel', 
  OK: 'ok' 
}; 
goog.ui.editor.AbstractDialog.Builder = function(editorDialog) { 
  this.editorDialog_ = editorDialog; 
  this.wrappedDialog_ = new goog.ui.Dialog('', true, this.editorDialog_.dom); 
  this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.editorDialog_.dom); 
  this.buttonHandlers_ = { }; 
  this.addClassName(goog.getCssName('tr-dialog')); 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.setTitle = function(title) { 
  this.wrappedDialog_.setTitle(title); 
  return this; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.addOkButton = function(opt_label) { 
  var key = goog.ui.Dialog.DefaultButtonKeys.OK; 
  var MSG_TR_DIALOG_OK = goog.getMsg('OK'); 
  this.buttonSet_.set(key, opt_label || MSG_TR_DIALOG_OK, true); 
  this.buttonHandlers_[key]= goog.bind(this.editorDialog_.handleOk, this.editorDialog_); 
  return this; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.addCancelButton = function(opt_label) { 
  var key = goog.ui.Dialog.DefaultButtonKeys.CANCEL; 
  var MSG_TR_DIALOG_CANCEL = goog.getMsg('Cancel'); 
  this.buttonSet_.set(key, opt_label || MSG_TR_DIALOG_CANCEL, false, true); 
  this.buttonHandlers_[key]= goog.bind(this.editorDialog_.handleCancel, this.editorDialog_); 
  return this; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.addButton = function(label, handler, opt_buttonId) { 
  var key = opt_buttonId || goog.string.createUniqueString(); 
  this.buttonSet_.set(key, label); 
  this.buttonHandlers_[key]= handler; 
  return this; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.addClassName = function(className) { 
  goog.dom.classes.add(this.wrappedDialog_.getDialogElement(), className); 
  return this; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.setContent = function(contentElem) { 
  goog.dom.appendChild(this.wrappedDialog_.getContentElement(), contentElem); 
  return this; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.build = function() { 
  if(this.buttonSet_.isEmpty()) { 
    this.addOkButton(); 
    this.addCancelButton(); 
  } 
  this.wrappedDialog_.setButtonSet(this.buttonSet_); 
  var handlers = this.buttonHandlers_; 
  this.buttonHandlers_ = null; 
  this.wrappedDialog_.addEventListener(goog.ui.Dialog.EventType.SELECT, function(e) { 
    if(handlers[e.key]) { 
      return handlers[e.key](e); 
    } 
  }); 
  this.wrappedDialog_.setModal(true); 
  var dialog = this.wrappedDialog_; 
  this.wrappedDialog_ = null; 
  return dialog; 
}; 
goog.ui.editor.AbstractDialog.Builder.prototype.editorDialog_; 
goog.ui.editor.AbstractDialog.Builder.prototype.wrappedDialog_; 
goog.ui.editor.AbstractDialog.Builder.prototype.buttonSet_; 
goog.ui.editor.AbstractDialog.Builder.prototype.buttonHandlers_; 
goog.ui.editor.AbstractDialog.prototype.dom; 
goog.ui.editor.AbstractDialog.prototype.createDialogControl = goog.abstractMethod; 
goog.ui.editor.AbstractDialog.prototype.getOkButtonElement = function() { 
  return this.getButtonElement(goog.ui.Dialog.DefaultButtonKeys.OK); 
}; 
goog.ui.editor.AbstractDialog.prototype.getCancelButtonElement = function() { 
  return this.getButtonElement(goog.ui.Dialog.DefaultButtonKeys.CANCEL); 
}; 
goog.ui.editor.AbstractDialog.prototype.getButtonElement = function(buttonId) { 
  return this.dialogInternal_.getButtonSet().getButton(buttonId); 
}; 
goog.ui.editor.AbstractDialog.prototype.createOkEvent = goog.abstractMethod; 
goog.ui.editor.AbstractDialog.prototype.handleOk = function(e) { 
  var eventObj = this.createOkEvent(e); 
  if(eventObj) { 
    return this.dispatchEvent(eventObj); 
  } else { 
    return false; 
  } 
}; 
goog.ui.editor.AbstractDialog.prototype.handleCancel = function() { 
  return this.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.CANCEL); 
}; 
goog.ui.editor.AbstractDialog.prototype.disposeInternal = function() { 
  if(this.dialogInternal_) { 
    this.hide(); 
    this.dialogInternal_.dispose(); 
    this.dialogInternal_ = null; 
  } 
  goog.ui.editor.AbstractDialog.superClass_.disposeInternal.call(this); 
}; 
goog.ui.editor.AbstractDialog.prototype.dialogInternal_; 
goog.ui.editor.AbstractDialog.prototype.handleAfterHide_ = function() { 
  this.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.AFTER_HIDE); 
}; 
