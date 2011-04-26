
goog.provide('goog.ui.ToolbarMenuButtonRenderer'); 
goog.require('goog.ui.MenuButtonRenderer'); 
goog.ui.ToolbarMenuButtonRenderer = function() { 
  goog.ui.MenuButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.ToolbarMenuButtonRenderer, goog.ui.MenuButtonRenderer); 
goog.addSingletonGetter(goog.ui.ToolbarMenuButtonRenderer); 
goog.ui.ToolbarMenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-toolbar-menu-button'); 
goog.ui.ToolbarMenuButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.ToolbarMenuButtonRenderer.CSS_CLASS; 
}; 
