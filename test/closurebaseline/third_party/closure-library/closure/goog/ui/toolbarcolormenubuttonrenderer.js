
goog.provide('goog.ui.ToolbarColorMenuButtonRenderer'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.ColorMenuButtonRenderer'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuButtonRenderer'); 
goog.require('goog.ui.ToolbarMenuButtonRenderer'); 
goog.ui.ToolbarColorMenuButtonRenderer = function() { 
  goog.ui.ToolbarMenuButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.ToolbarColorMenuButtonRenderer, goog.ui.ToolbarMenuButtonRenderer); 
goog.addSingletonGetter(goog.ui.ToolbarColorMenuButtonRenderer); 
goog.ui.ToolbarColorMenuButtonRenderer.prototype.createCaption = function(content, dom) { 
  return goog.ui.MenuButtonRenderer.wrapCaption(goog.ui.ColorMenuButtonRenderer.wrapCaption(content, dom), this.getCssClass(), dom); 
}; 
goog.ui.ToolbarColorMenuButtonRenderer.prototype.setValue = function(element, value) { 
  if(element) { 
    goog.ui.ColorMenuButtonRenderer.setCaptionValue(this.getContentElement(element), value); 
  } 
}; 
goog.ui.ToolbarColorMenuButtonRenderer.prototype.initializeDom = function(button) { 
  this.setValue(button.getElement(), button.getValue()); 
  goog.dom.classes.add(button.getElement(), goog.getCssName('goog-toolbar-color-menu-button')); 
  goog.ui.ToolbarColorMenuButtonRenderer.superClass_.initializeDom.call(this, button); 
}; 
