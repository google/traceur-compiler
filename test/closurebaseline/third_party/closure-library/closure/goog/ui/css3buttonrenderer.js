
goog.provide('goog.ui.Css3ButtonRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ButtonRenderer'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.registry'); 
goog.ui.Css3ButtonRenderer = function() { 
  goog.ui.ButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.Css3ButtonRenderer, goog.ui.ButtonRenderer); 
goog.ui.Css3ButtonRenderer.instance_ = null; 
goog.addSingletonGetter(goog.ui.Css3ButtonRenderer); 
goog.ui.Css3ButtonRenderer.CSS_CLASS = goog.getCssName('goog-css3-button'); 
goog.ui.Css3ButtonRenderer.prototype.getContentElement = function(element) { 
  return(element); 
}; 
goog.ui.Css3ButtonRenderer.prototype.createDom = function(button) { 
  var attr = { 
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + this.getCssClass(), 
    'title': button.getTooltip() || '' 
  }; 
  return button.getDomHelper().createDom('div', attr, button.getContent()); 
}; 
goog.ui.Css3ButtonRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == goog.dom.TagName.DIV; 
}; 
goog.ui.Css3ButtonRenderer.prototype.decorate = function(button, element) { 
  goog.dom.classes.add(element, goog.ui.INLINE_BLOCK_CLASSNAME, this.getCssClass()); 
  return goog.ui.Css3ButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.Css3ButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.Css3ButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.Css3ButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null, goog.ui.Css3ButtonRenderer.getInstance()); 
}); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-css3-toggle-button'), function() { 
  var button = new goog.ui.Button(null, goog.ui.Css3ButtonRenderer.getInstance()); 
  button.setSupportedState(goog.ui.Component.State.CHECKED, true); 
  return button; 
}); 
