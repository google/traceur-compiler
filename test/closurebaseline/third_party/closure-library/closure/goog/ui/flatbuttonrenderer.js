
goog.provide('goog.ui.FlatButtonRenderer'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ButtonRenderer'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.registry'); 
goog.ui.FlatButtonRenderer = function() { 
  goog.ui.ButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.FlatButtonRenderer, goog.ui.ButtonRenderer); 
goog.addSingletonGetter(goog.ui.FlatButtonRenderer); 
goog.ui.FlatButtonRenderer.CSS_CLASS = goog.getCssName('goog-flat-button'); 
goog.ui.FlatButtonRenderer.prototype.createDom = function(button) { 
  var classNames = this.getClassNames(button); 
  var attributes = { 
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' '), 
    'title': button.getTooltip() || '' 
  }; 
  return button.getDomHelper().createDom('div', attributes, button.getContent()); 
}; 
goog.ui.FlatButtonRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.BUTTON; 
}; 
goog.ui.FlatButtonRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == 'DIV'; 
}; 
goog.ui.FlatButtonRenderer.prototype.decorate = function(button, element) { 
  goog.dom.classes.add(element, goog.ui.INLINE_BLOCK_CLASSNAME); 
  return goog.ui.FlatButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.FlatButtonRenderer.prototype.getValue = function(element) { 
  return null; 
}; 
goog.ui.FlatButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.FlatButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.FlatButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null, goog.ui.FlatButtonRenderer.getInstance()); 
}); 
