
goog.provide('goog.editor.plugins.LinkDialogPlugin'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.plugins.AbstractDialogPlugin'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.functions'); 
goog.require('goog.ui.editor.AbstractDialog.EventType'); 
goog.require('goog.ui.editor.LinkDialog'); 
goog.require('goog.ui.editor.LinkDialog.OkEvent'); 
goog.editor.plugins.LinkDialogPlugin = function() { 
  goog.base(this, goog.editor.Command.MODAL_LINK_EDITOR); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.editor.plugins.LinkDialogPlugin, goog.editor.plugins.AbstractDialogPlugin); 
goog.editor.plugins.LinkDialogPlugin.prototype.currentLink_; 
goog.editor.plugins.LinkDialogPlugin.prototype.emailWarning_; 
goog.editor.plugins.LinkDialogPlugin.prototype.stopReferrerLeaks_ = false; 
goog.editor.plugins.LinkDialogPlugin.prototype.getTrogClassId = goog.functions.constant('LinkDialogPlugin'); 
goog.editor.plugins.LinkDialogPlugin.prototype.stopReferrerLeaks = function() { 
  this.stopReferrerLeaks_ = true; 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.setEmailWarning = function(emailWarning) { 
  this.emailWarning_ = emailWarning; 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.execCommandInternal = function(command, opt_arg) { 
  this.currentLink_ =(opt_arg); 
  return goog.base(this, 'execCommandInternal', command, opt_arg); 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.handleAfterHide = function(e) { 
  goog.base(this, 'handleAfterHide', e); 
  this.currentLink_ = null; 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.getEventHandler = function() { 
  return this.eventHandler_; 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.getCurrentLink = function() { 
  return this.currentLink_; 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.createDialog = function(dialogDomHelper, link) { 
  var dialog = new goog.ui.editor.LinkDialog(dialogDomHelper,(link)); 
  if(this.emailWarning_) { 
    dialog.setEmailWarning(this.emailWarning_); 
  } 
  dialog.setStopReferrerLeaks(this.stopReferrerLeaks_); 
  this.eventHandler_.listen(dialog, goog.ui.editor.AbstractDialog.EventType.OK, this.handleOk_).listen(dialog, goog.ui.editor.AbstractDialog.EventType.CANCEL, this.handleCancel_); 
  return dialog; 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.eventHandler_.dispose(); 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.handleOk_ = function(e) { 
  this.disposeOriginalSelection(); 
  this.currentLink_.setTextAndUrl(e.linkText, e.linkUrl); 
  this.currentLink_.placeCursorRightOf(); 
  this.fieldObject.dispatchSelectionChangeEvent(); 
  this.fieldObject.dispatchChange(); 
  this.eventHandler_.removeAll(); 
}; 
goog.editor.plugins.LinkDialogPlugin.prototype.handleCancel_ = function(e) { 
  if(this.currentLink_.isNew()) { 
    goog.dom.flattenElement(this.currentLink_.getAnchor()); 
    this.fieldObject.dispatchChange(); 
  } 
  this.eventHandler_.removeAll(); 
}; 
