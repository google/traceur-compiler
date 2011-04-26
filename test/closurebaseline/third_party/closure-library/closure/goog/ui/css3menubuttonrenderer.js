
goog.provide('goog.ui.Css3MenuButtonRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.MenuButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.Css3MenuButtonRenderer = function() { 
  goog.ui.MenuButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.Css3MenuButtonRenderer, goog.ui.MenuButtonRenderer); 
goog.ui.Css3MenuButtonRenderer.instance_ = null; 
goog.addSingletonGetter(goog.ui.Css3MenuButtonRenderer); 
goog.ui.Css3MenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-css3-button'); 
goog.ui.Css3MenuButtonRenderer.prototype.getContentElement = function(element) { 
  if(element) { 
    var captionElem = goog.dom.getElementsByTagNameAndClass('*', goog.getCssName(this.getCssClass(), 'caption'), element)[0]; 
    return captionElem; 
  } 
  return null; 
}; 
goog.ui.Css3MenuButtonRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == goog.dom.TagName.DIV; 
}; 
goog.ui.Css3MenuButtonRenderer.prototype.createButton = function(content, dom) { 
  var baseClass = this.getCssClass(); 
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' '; 
  return dom.createDom('div', inlineBlock, dom.createDom('div',[goog.getCssName(baseClass, 'caption'), goog.getCssName('goog-inline-block')], content), dom.createDom('div',[goog.getCssName(baseClass, 'dropdown'), goog.getCssName('goog-inline-block')])); 
}; 
goog.ui.Css3MenuButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.Css3MenuButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-css3-menu-button'), function() { 
  return new goog.ui.MenuButton(null, null, goog.ui.Css3MenuButtonRenderer.getInstance()); 
}); 
