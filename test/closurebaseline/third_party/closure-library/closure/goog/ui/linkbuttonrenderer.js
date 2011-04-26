
goog.provide('goog.ui.LinkButtonRenderer'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.FlatButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.LinkButtonRenderer = function() { 
  goog.ui.FlatButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.LinkButtonRenderer, goog.ui.FlatButtonRenderer); 
goog.addSingletonGetter(goog.ui.LinkButtonRenderer); 
goog.ui.LinkButtonRenderer.CSS_CLASS = goog.getCssName('goog-link-button'); 
goog.ui.LinkButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.LinkButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.LinkButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null, goog.ui.LinkButtonRenderer.getInstance()); 
}); 
