
goog.provide('goog.ui.ToggleButton'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.CustomButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ToggleButton = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Button.call(this, content, opt_renderer || goog.ui.CustomButtonRenderer.getInstance(), opt_domHelper); 
  this.setSupportedState(goog.ui.Component.State.CHECKED, true); 
}; 
goog.inherits(goog.ui.ToggleButton, goog.ui.Button); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-toggle-button'), function() { 
  return new goog.ui.ToggleButton(null); 
}); 
