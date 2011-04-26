
goog.provide('goog.ui.ToolbarButtonRenderer'); 
goog.require('goog.ui.CustomButtonRenderer'); 
goog.ui.ToolbarButtonRenderer = function() { 
  goog.ui.CustomButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.ToolbarButtonRenderer, goog.ui.CustomButtonRenderer); 
goog.addSingletonGetter(goog.ui.ToolbarButtonRenderer); 
goog.ui.ToolbarButtonRenderer.CSS_CLASS = goog.getCssName('goog-toolbar-button'); 
goog.ui.ToolbarButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.ToolbarButtonRenderer.CSS_CLASS; 
}; 
