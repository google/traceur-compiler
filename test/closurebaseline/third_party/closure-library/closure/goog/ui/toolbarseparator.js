
goog.provide('goog.ui.ToolbarSeparator'); 
goog.require('goog.ui.Separator'); 
goog.require('goog.ui.ToolbarSeparatorRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToolbarSeparator = function(opt_renderer, opt_domHelper) { 
  goog.ui.Separator.call(this, opt_renderer || goog.ui.ToolbarSeparatorRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ToolbarSeparator, goog.ui.Separator); 
goog.ui.registry.setDecoratorByClassName(goog.ui.ToolbarSeparatorRenderer.CSS_CLASS, function() { 
  return new goog.ui.ToolbarSeparator(); 
}); 
