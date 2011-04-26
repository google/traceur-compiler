
goog.provide('goog.ui.ToolbarSeparatorRenderer'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.MenuSeparatorRenderer'); 
goog.ui.ToolbarSeparatorRenderer = function() { 
  goog.ui.MenuSeparatorRenderer.call(this); 
}; 
goog.inherits(goog.ui.ToolbarSeparatorRenderer, goog.ui.MenuSeparatorRenderer); 
goog.addSingletonGetter(goog.ui.ToolbarSeparatorRenderer); 
goog.ui.ToolbarSeparatorRenderer.CSS_CLASS = goog.getCssName('goog-toolbar-separator'); 
goog.ui.ToolbarSeparatorRenderer.prototype.createDom = function(separator) { 
  return separator.getDomHelper().createDom('div', this.getCssClass() + ' ' + goog.ui.INLINE_BLOCK_CLASSNAME, '\u00A0'); 
}; 
goog.ui.ToolbarSeparatorRenderer.prototype.decorate = function(separator, element) { 
  element = goog.ui.ToolbarSeparatorRenderer.superClass_.decorate.call(this, separator, element); 
  goog.dom.classes.add(element, goog.ui.INLINE_BLOCK_CLASSNAME); 
  return element; 
}; 
goog.ui.ToolbarSeparatorRenderer.prototype.getCssClass = function() { 
  return goog.ui.ToolbarSeparatorRenderer.CSS_CLASS; 
}; 
