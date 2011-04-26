
goog.provide('goog.ui.ToolbarButton'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.ToolbarButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToolbarButton = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Button.call(this, content, opt_renderer || goog.ui.ToolbarButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ToolbarButton, goog.ui.Button); 
goog.ui.registry.setDecoratorByClassName(goog.ui.ToolbarButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.ToolbarButton(null); 
}); 
