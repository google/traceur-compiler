
goog.provide('goog.ui.style.app.PrimaryActionButtonRenderer'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.registry'); 
goog.require('goog.ui.style.app.ButtonRenderer'); 
goog.ui.style.app.PrimaryActionButtonRenderer = function() { 
  goog.ui.style.app.ButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.style.app.PrimaryActionButtonRenderer, goog.ui.style.app.ButtonRenderer); 
goog.addSingletonGetter(goog.ui.style.app.PrimaryActionButtonRenderer); 
goog.ui.style.app.PrimaryActionButtonRenderer.CSS_CLASS = 'goog-primaryactionbutton'; 
goog.ui.style.app.PrimaryActionButtonRenderer.IE6_CLASS_COMBINATIONS =[['goog-button-base-disabled', 'goog-primaryactionbutton'],['goog-button-base-focused', 'goog-primaryactionbutton'],['goog-button-base-hover', 'goog-primaryactionbutton']]; 
goog.ui.style.app.PrimaryActionButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.style.app.PrimaryActionButtonRenderer.CSS_CLASS; 
}; 
goog.ui.style.app.PrimaryActionButtonRenderer.prototype.getIe6ClassCombinations = function() { 
  return goog.ui.style.app.PrimaryActionButtonRenderer.IE6_CLASS_COMBINATIONS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.style.app.PrimaryActionButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null, goog.ui.style.app.PrimaryActionButtonRenderer.getInstance()); 
}); 
