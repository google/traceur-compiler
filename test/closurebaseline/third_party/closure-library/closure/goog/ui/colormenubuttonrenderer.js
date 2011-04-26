
goog.provide('goog.ui.ColorMenuButtonRenderer'); 
goog.require('goog.color'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuButtonRenderer'); 
goog.require('goog.userAgent'); 
goog.ui.ColorMenuButtonRenderer = function() { 
  goog.ui.MenuButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.ColorMenuButtonRenderer, goog.ui.MenuButtonRenderer); 
goog.addSingletonGetter(goog.ui.ColorMenuButtonRenderer); 
goog.ui.ColorMenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-color-menu-button'); 
goog.ui.ColorMenuButtonRenderer.prototype.createCaption = function(content, dom) { 
  return goog.ui.ColorMenuButtonRenderer.superClass_.createCaption.call(this, goog.ui.ColorMenuButtonRenderer.wrapCaption(content, dom), dom); 
}; 
goog.ui.ColorMenuButtonRenderer.wrapCaption = function(content, dom) { 
  return dom.createDom('div', goog.getCssName(goog.ui.ColorMenuButtonRenderer.CSS_CLASS, 'indicator'), content); 
}; 
goog.ui.ColorMenuButtonRenderer.prototype.setValue = function(element, value) { 
  if(element) { 
    goog.ui.ColorMenuButtonRenderer.setCaptionValue(this.getContentElement(element), value); 
  } 
}; 
goog.ui.ColorMenuButtonRenderer.setCaptionValue = function(caption, value) { 
  if(caption && caption.firstChild) { 
    var hexColor; 
    try { 
      hexColor = goog.color.parse((value)).hex; 
    } catch(ex) { 
      hexColor = null; 
    } 
    caption.firstChild.style.borderBottomColor = hexColor ||(goog.userAgent.IE ? '': 'transparent'); 
  } 
}; 
goog.ui.ColorMenuButtonRenderer.prototype.initializeDom = function(button) { 
  this.setValue(button.getElement(), button.getValue()); 
  goog.dom.classes.add(button.getElement(), goog.ui.ColorMenuButtonRenderer.CSS_CLASS); 
  goog.ui.ColorMenuButtonRenderer.superClass_.initializeDom.call(this, button); 
}; 
