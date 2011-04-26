
goog.provide('goog.ui.ColorButton'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ColorButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ColorButton = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Button.call(this, content, opt_renderer || goog.ui.ColorButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ColorButton, goog.ui.Button); 
goog.ui.registry.setDecoratorByClassName(goog.ui.ColorButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.ColorButton(null); 
}); 
