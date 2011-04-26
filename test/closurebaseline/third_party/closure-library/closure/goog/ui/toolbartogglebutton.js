
goog.provide('goog.ui.ToolbarToggleButton'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.ToggleButton'); 
goog.require('goog.ui.ToolbarButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToolbarToggleButton = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.ToggleButton.call(this, content, opt_renderer || goog.ui.ToolbarButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ToolbarToggleButton, goog.ui.ToggleButton); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-toolbar-toggle-button'), function() { 
  return new goog.ui.ToolbarToggleButton(null); 
}); 
