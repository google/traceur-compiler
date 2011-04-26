
goog.provide('goog.ui.MenuSeparator'); 
goog.require('goog.ui.MenuSeparatorRenderer'); 
goog.require('goog.ui.Separator'); 
goog.require('goog.ui.registry'); 
goog.ui.MenuSeparator = function(opt_domHelper) { 
  goog.ui.Separator.call(this, goog.ui.MenuSeparatorRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.MenuSeparator, goog.ui.Separator); 
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() { 
  return new goog.ui.Separator(); 
}); 
