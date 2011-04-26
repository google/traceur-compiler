
goog.provide('goog.ui.CustomButton'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.CustomButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.CustomButton = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Button.call(this, content, opt_renderer || goog.ui.CustomButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.CustomButton, goog.ui.Button); 
goog.ui.registry.setDecoratorByClassName(goog.ui.CustomButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.CustomButton(null); 
}); 
