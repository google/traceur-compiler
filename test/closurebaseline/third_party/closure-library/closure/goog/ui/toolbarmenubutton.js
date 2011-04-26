
goog.provide('goog.ui.ToolbarMenuButton'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.ToolbarMenuButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToolbarMenuButton = function(content, opt_menu, opt_renderer, opt_domHelper) { 
  goog.ui.MenuButton.call(this, content, opt_menu, opt_renderer || goog.ui.ToolbarMenuButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ToolbarMenuButton, goog.ui.MenuButton); 
goog.ui.registry.setDecoratorByClassName(goog.ui.ToolbarMenuButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.ToolbarMenuButton(null); 
}); 
