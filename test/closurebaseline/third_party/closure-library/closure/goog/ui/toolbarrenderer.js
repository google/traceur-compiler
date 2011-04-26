
goog.provide('goog.ui.ToolbarRenderer'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.ui.Container.Orientation'); 
goog.require('goog.ui.ContainerRenderer'); 
goog.require('goog.ui.Separator'); 
goog.require('goog.ui.ToolbarSeparatorRenderer'); 
goog.ui.ToolbarRenderer = function() { 
  goog.ui.ContainerRenderer.call(this); 
}; 
goog.inherits(goog.ui.ToolbarRenderer, goog.ui.ContainerRenderer); 
goog.addSingletonGetter(goog.ui.ToolbarRenderer); 
goog.ui.ToolbarRenderer.CSS_CLASS = goog.getCssName('goog-toolbar'); 
goog.ui.ToolbarRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.TOOLBAR; 
}; 
goog.ui.ToolbarRenderer.prototype.getDecoratorForChild = function(element) { 
  return element.tagName == 'HR' ? new goog.ui.Separator(goog.ui.ToolbarSeparatorRenderer.getInstance()): goog.ui.ToolbarRenderer.superClass_.getDecoratorForChild.call(this, element); 
}; 
goog.ui.ToolbarRenderer.prototype.getCssClass = function() { 
  return goog.ui.ToolbarRenderer.CSS_CLASS; 
}; 
goog.ui.ToolbarRenderer.prototype.getDefaultOrientation = function() { 
  return goog.ui.Container.Orientation.HORIZONTAL; 
}; 
