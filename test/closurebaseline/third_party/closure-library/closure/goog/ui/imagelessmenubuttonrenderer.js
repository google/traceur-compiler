
goog.provide('goog.ui.ImagelessMenuButtonRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.MenuButtonRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.ImagelessMenuButtonRenderer = function() { 
  goog.ui.MenuButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.ImagelessMenuButtonRenderer, goog.ui.MenuButtonRenderer); 
goog.ui.ImagelessMenuButtonRenderer.instance_ = null; 
goog.addSingletonGetter(goog.ui.ImagelessMenuButtonRenderer); 
goog.ui.ImagelessMenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-imageless-button'); 
goog.ui.ImagelessMenuButtonRenderer.prototype.getContentElement = function(element) { 
  if(element) { 
    var captionElem = goog.dom.getElementsByTagNameAndClass('*', goog.getCssName(this.getCssClass(), 'caption'), element)[0]; 
    return captionElem; 
  } 
  return null; 
}; 
goog.ui.ImagelessMenuButtonRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == goog.dom.TagName.DIV; 
}; 
goog.ui.ImagelessMenuButtonRenderer.prototype.createButton = function(content, dom) { 
  var baseClass = this.getCssClass(); 
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' '; 
  return dom.createDom('div', inlineBlock + goog.getCssName(baseClass, 'outer-box'), dom.createDom('div', inlineBlock + goog.getCssName(baseClass, 'inner-box'), dom.createDom('div', goog.getCssName(baseClass, 'pos'), dom.createDom('div', goog.getCssName(baseClass, 'top-shadow'), '\u00A0'), dom.createDom('div',[goog.getCssName(baseClass, 'content'), goog.getCssName(baseClass, 'caption'), goog.getCssName('goog-inline-block')], content), dom.createDom('div',[goog.getCssName(baseClass, 'dropdown'), goog.getCssName('goog-inline-block')])))); 
}; 
goog.ui.ImagelessMenuButtonRenderer.prototype.hasBoxStructure = function(button, element) { 
  var outer = button.getDomHelper().getFirstElementChild(element); 
  if(outer && outer.className.indexOf(goog.getCssName(this.getCssClass(), 'outer-box')) != - 1) { 
    var inner = button.getDomHelper().getFirstElementChild(outer); 
    if(inner && inner.className.indexOf(goog.getCssName(this.getCssClass(), 'inner-box')) != - 1) { 
      var pos = button.getDomHelper().getFirstElementChild(inner); 
      if(pos && pos.className.indexOf(goog.getCssName(this.getCssClass(), 'pos')) != - 1) { 
        var shadow = button.getDomHelper().getFirstElementChild(pos); 
        if(shadow && shadow.className.indexOf(goog.getCssName(this.getCssClass(), 'top-shadow')) != - 1) { 
          var content = button.getDomHelper().getNextElementSibling(shadow); 
          if(content && content.className.indexOf(goog.getCssName(this.getCssClass(), 'content')) != - 1) { 
            return true; 
          } 
        } 
      } 
    } 
  } 
  return false; 
}; 
goog.ui.ImagelessMenuButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.ImagelessMenuButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-imageless-menu-button'), function() { 
  return new goog.ui.MenuButton(null, null, goog.ui.ImagelessMenuButtonRenderer.getInstance()); 
}); 
