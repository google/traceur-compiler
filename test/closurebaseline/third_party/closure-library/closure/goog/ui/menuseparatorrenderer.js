
goog.provide('goog.ui.MenuSeparatorRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.MenuSeparatorRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.MenuSeparatorRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.MenuSeparatorRenderer); 
goog.ui.MenuSeparatorRenderer.CSS_CLASS = goog.getCssName('goog-menuseparator'); 
goog.ui.MenuSeparatorRenderer.prototype.createDom = function(separator) { 
  return separator.getDomHelper().createDom('div', this.getCssClass()); 
}; 
goog.ui.MenuSeparatorRenderer.prototype.decorate = function(separator, element) { 
  if(element.tagName == 'HR') { 
    var hr = element; 
    element = this.createDom(separator); 
    goog.dom.insertSiblingBefore(element, hr); 
    goog.dom.removeNode(hr); 
  } else { 
    goog.dom.classes.add(element, this.getCssClass()); 
  } 
  return element; 
}; 
goog.ui.MenuSeparatorRenderer.prototype.setContent = function(separator, content) { }; 
goog.ui.MenuSeparatorRenderer.prototype.getCssClass = function() { 
  return goog.ui.MenuSeparatorRenderer.CSS_CLASS; 
}; 
