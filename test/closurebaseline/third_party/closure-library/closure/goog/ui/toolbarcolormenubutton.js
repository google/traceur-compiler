
goog.provide('goog.ui.ToolbarColorMenuButton'); 
goog.require('goog.ui.ColorMenuButton'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.ToolbarColorMenuButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToolbarColorMenuButton = function(content, opt_menu, opt_renderer, opt_domHelper) { 
  goog.ui.ColorMenuButton.call(this, content, opt_menu, opt_renderer || goog.ui.ToolbarColorMenuButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ToolbarColorMenuButton, goog.ui.ColorMenuButton); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-toolbar-color-menu-button'), function() { 
  return new goog.ui.ToolbarColorMenuButton(null); 
}); 
