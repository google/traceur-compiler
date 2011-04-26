
goog.provide('goog.ui.CheckBoxMenuItem'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.registry'); 
goog.ui.CheckBoxMenuItem = function(content, opt_model, opt_domHelper) { 
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper); 
  this.setCheckable(true); 
}; 
goog.inherits(goog.ui.CheckBoxMenuItem, goog.ui.MenuItem); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-checkbox-menuitem'), function() { 
  return new goog.ui.CheckBoxMenuItem(null); 
}); 
