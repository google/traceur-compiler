
goog.provide('goog.ui.ColorButtonRenderer'); 
goog.require('goog.dom.classes'); 
goog.require('goog.functions'); 
goog.require('goog.ui.ColorMenuButtonRenderer'); 
goog.ui.ColorButtonRenderer = function() { 
  goog.base(this); 
  this.createDropdown = goog.functions.NULL; 
}; 
goog.inherits(goog.ui.ColorButtonRenderer, goog.ui.ColorMenuButtonRenderer); 
goog.addSingletonGetter(goog.ui.ColorButtonRenderer); 
goog.ui.ColorButtonRenderer.CSS_CLASS = goog.getCssName('goog-color-button'); 
goog.ui.ColorButtonRenderer.prototype.createCaption = function(content, dom) { 
  var caption = goog.base(this, 'createCaption', content, dom); 
  goog.dom.classes.add(caption, goog.ui.ColorButtonRenderer.CSS_CLASS); 
  return caption; 
}; 
goog.ui.ColorButtonRenderer.prototype.initializeDom = function(button) { 
  goog.base(this, 'initializeDom', button); 
  goog.dom.classes.add(button.getElement(), goog.ui.ColorButtonRenderer.CSS_CLASS); 
}; 
