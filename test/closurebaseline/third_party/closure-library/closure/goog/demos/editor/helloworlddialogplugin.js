
goog.provide('goog.demos.editor.HelloWorldDialogPlugin'); 
goog.provide('goog.demos.editor.HelloWorldDialogPlugin.Command'); 
goog.require('goog.demos.editor.HelloWorldDialog'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.plugins.AbstractDialogPlugin'); 
goog.require('goog.editor.range'); 
goog.require('goog.functions'); 
goog.require('goog.ui.editor.AbstractDialog.EventType'); 
goog.demos.editor.HelloWorldDialogPlugin = function() { 
  goog.editor.plugins.AbstractDialogPlugin.call(this, goog.demos.editor.HelloWorldDialogPlugin.Command.HELLO_WORLD_DIALOG); 
}; 
goog.inherits(goog.demos.editor.HelloWorldDialogPlugin, goog.editor.plugins.AbstractDialogPlugin); 
goog.demos.editor.HelloWorldDialogPlugin.Command = { HELLO_WORLD_DIALOG: 'helloWorldDialog' }; 
goog.demos.editor.HelloWorldDialogPlugin.prototype.getTrogClassId = goog.functions.constant('HelloWorldDialog'); 
goog.demos.editor.HelloWorldDialogPlugin.prototype.createDialog = function(dialogDomHelper) { 
  var dialog = new goog.demos.editor.HelloWorldDialog(dialogDomHelper); 
  dialog.addEventListener(goog.ui.editor.AbstractDialog.EventType.OK, this.handleOk_, false, this); 
  return dialog; 
}; 
goog.demos.editor.HelloWorldDialogPlugin.prototype.handleOk_ = function(e) { 
  this.restoreOriginalSelection(); 
  this.fieldObject.dispatchBeforeChange(); 
  var range = this.fieldObject.getRange(); 
  range.removeContents(); 
  var createdNode = this.getFieldDomHelper().createDom(goog.dom.TagName.SPAN, null, e.message); 
  createdNode = range.insertNode(createdNode, false); 
  goog.editor.range.placeCursorNextTo(createdNode, false); 
  this.fieldObject.dispatchSelectionChangeEvent(); 
  this.fieldObject.dispatchChange(); 
}; 
