
goog.provide('goog.editor.plugins.AbstractDialogPlugin'); 
goog.provide('goog.editor.plugins.AbstractDialogPlugin.EventType'); 
goog.require('goog.dom'); 
goog.require('goog.dom.Range'); 
goog.require('goog.editor.Field.EventType'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.range'); 
goog.require('goog.events'); 
goog.require('goog.ui.editor.AbstractDialog.EventType'); 
goog.editor.plugins.AbstractDialogPlugin = function(command) { 
  goog.editor.Plugin.call(this); 
  this.command_ = command; 
}; 
goog.inherits(goog.editor.plugins.AbstractDialogPlugin, goog.editor.Plugin); 
goog.editor.plugins.AbstractDialogPlugin.prototype.isSupportedCommand = function(command) { 
  return command == this.command_; 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.execCommand = function(command, var_args) { 
  return this.execCommandInternal.apply(this, arguments); 
}; 
goog.editor.plugins.AbstractDialogPlugin.EventType = { 
  OPENED: 'dialogOpened', 
  CLOSED: 'dialogClosed' 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.createDialog = goog.abstractMethod; 
goog.editor.plugins.AbstractDialogPlugin.prototype.getDialog = function() { 
  return this.dialog_; 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.setReuseDialog = function(reuse) { 
  this.reuseDialog_ = reuse; 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.execCommandInternal = function(command, opt_arg) { 
  if(! this.reuseDialog_) { 
    this.disposeDialog_(); 
  } 
  if(! this.dialog_) { 
    this.dialog_ = this.createDialog(goog.dom.getDomHelper(this.fieldObject.getAppWindow()), opt_arg); 
  } 
  var tempRange = this.fieldObject.getRange(); 
  this.savedRange_ = tempRange && goog.editor.range.saveUsingNormalizedCarets(tempRange); 
  goog.dom.Range.clearSelection(this.fieldObject.getEditableDomHelper().getWindow()); 
  goog.events.listenOnce(this.dialog_, goog.ui.editor.AbstractDialog.EventType.AFTER_HIDE, this.handleAfterHide, false, this); 
  this.fieldObject.setModalMode(true); 
  this.dialog_.show(); 
  this.dispatchEvent(goog.editor.plugins.AbstractDialogPlugin.EventType.OPENED); 
  this.fieldObject.dispatchSelectionChangeEvent(); 
  return true; 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.handleAfterHide = function(e) { 
  this.fieldObject.setModalMode(false); 
  this.restoreOriginalSelection(); 
  if(! this.reuseDialog_) { 
    this.disposeDialog_(); 
  } 
  this.dispatchEvent(goog.editor.plugins.AbstractDialogPlugin.EventType.CLOSED); 
  this.fieldObject.dispatchSelectionChangeEvent(); 
  this.fieldObject.debounceEvent(goog.editor.Field.EventType.SELECTIONCHANGE); 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.restoreOriginalSelection = function() { 
  this.fieldObject.focus(); 
  if(this.savedRange_) { 
    this.savedRange_.restore(); 
    this.savedRange_ = null; 
  } 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.disposeOriginalSelection = function() { 
  if(this.savedRange_) { 
    this.savedRange_.dispose(); 
    this.savedRange_ = null; 
  } 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.disposeInternal = function() { 
  this.disposeDialog_(); 
  goog.base(this, 'disposeInternal'); 
}; 
goog.editor.plugins.AbstractDialogPlugin.prototype.command_; 
goog.editor.plugins.AbstractDialogPlugin.prototype.dialog_; 
goog.editor.plugins.AbstractDialogPlugin.prototype.reuseDialog_ = false; 
goog.editor.plugins.AbstractDialogPlugin.prototype.isDisposingDialog_ = false; 
goog.editor.plugins.AbstractDialogPlugin.prototype.savedRange_; 
goog.editor.plugins.AbstractDialogPlugin.prototype.disposeDialog_ = function() { 
  if(this.dialog_ && ! this.isDisposingDialog_) { 
    this.isDisposingDialog_ = true; 
    this.dialog_.dispose(); 
    this.dialog_ = null; 
    this.isDisposingDialog_ = false; 
  } 
}; 
