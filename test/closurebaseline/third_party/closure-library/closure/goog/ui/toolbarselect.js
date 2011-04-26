
goog.provide('goog.ui.ToolbarSelect'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.Select'); 
goog.require('goog.ui.ToolbarMenuButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToolbarSelect = function(caption, opt_menu, opt_renderer, opt_domHelper) { 
  goog.ui.Select.call(this, caption, opt_menu, opt_renderer || goog.ui.ToolbarMenuButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ToolbarSelect, goog.ui.Select); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-toolbar-select'), function() { 
  return new goog.ui.ToolbarSelect(null); 
}); 
