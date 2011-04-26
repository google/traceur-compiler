
goog.provide('goog.ui.MenuHeaderRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.MenuHeaderRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.MenuHeaderRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.MenuHeaderRenderer); 
goog.ui.MenuHeaderRenderer.CSS_CLASS = goog.getCssName('goog-menuheader'); 
goog.ui.MenuHeaderRenderer.prototype.getCssClass = function() { 
  return goog.ui.MenuHeaderRenderer.CSS_CLASS; 
}; 
