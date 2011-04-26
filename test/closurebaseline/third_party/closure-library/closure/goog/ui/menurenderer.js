
goog.provide('goog.ui.MenuRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.ui.ContainerRenderer'); 
goog.require('goog.ui.Separator'); 
goog.ui.MenuRenderer = function() { 
  goog.ui.ContainerRenderer.call(this); 
}; 
goog.inherits(goog.ui.MenuRenderer, goog.ui.ContainerRenderer); 
goog.addSingletonGetter(goog.ui.MenuRenderer); 
goog.ui.MenuRenderer.CSS_CLASS = goog.getCssName('goog-menu'); 
goog.ui.MenuRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.MENU; 
}; 
goog.ui.MenuRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == 'UL' || goog.ui.MenuRenderer.superClass_.canDecorate.call(this, element); 
}; 
goog.ui.MenuRenderer.prototype.getDecoratorForChild = function(element) { 
  return element.tagName == 'HR' ? new goog.ui.Separator(): goog.ui.MenuRenderer.superClass_.getDecoratorForChild.call(this, element); 
}; 
goog.ui.MenuRenderer.prototype.containsElement = function(menu, element) { 
  return goog.dom.contains(menu.getElement(), element); 
}; 
goog.ui.MenuRenderer.prototype.getCssClass = function() { 
  return goog.ui.MenuRenderer.CSS_CLASS; 
}; 
goog.ui.MenuRenderer.prototype.initializeDom = function(container) { 
  goog.ui.MenuRenderer.superClass_.initializeDom.call(this, container); 
  var element = container.getElement(); 
  goog.dom.a11y.setState(element, goog.dom.a11y.State.HASPOPUP, 'true'); 
}; 
