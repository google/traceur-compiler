
goog.provide('goog.ui.MenuHeader'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.MenuHeaderRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.MenuHeader = function(content, opt_domHelper, opt_renderer) { 
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.MenuHeaderRenderer.getInstance(), opt_domHelper); 
  this.setSupportedState(goog.ui.Component.State.DISABLED, false); 
  this.setSupportedState(goog.ui.Component.State.HOVER, false); 
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false); 
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false); 
  this.setStateInternal(goog.ui.Component.State.DISABLED); 
}; 
goog.inherits(goog.ui.MenuHeader, goog.ui.Control); 
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuHeaderRenderer.CSS_CLASS, function() { 
  return new goog.ui.MenuHeader(null); 
}); 
