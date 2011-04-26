
goog.provide('goog.ui.Option'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.registry'); 
goog.ui.Option = function(content, opt_model, opt_domHelper) { 
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper); 
  this.setSelectable(true); 
}; 
goog.inherits(goog.ui.Option, goog.ui.MenuItem); 
goog.ui.Option.prototype.performActionInternal = function(e) { 
  return this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
}; 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-option'), function() { 
  return new goog.ui.Option(null); 
}); 
