
goog.provide('goog.ui.ImagelessButtonRenderer'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.CustomButtonRenderer'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.registry'); 
goog.ui.ImagelessButtonRenderer = function() { 
  goog.ui.CustomButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.ImagelessButtonRenderer, goog.ui.CustomButtonRenderer); 
goog.ui.ImagelessButtonRenderer.instance_ = null; 
goog.addSingletonGetter(goog.ui.ImagelessButtonRenderer); 
goog.ui.ImagelessButtonRenderer.CSS_CLASS = goog.getCssName('goog-imageless-button'); 
goog.ui.ImagelessButtonRenderer.prototype.createDom = goog.ui.ImagelessButtonRenderer.superClass_.createDom; 
goog.ui.ImagelessButtonRenderer.prototype.getContentElement = function(element) { 
  return(element && element.firstChild && element.firstChild.firstChild && element.firstChild.firstChild.firstChild.lastChild); 
}; 
goog.ui.ImagelessButtonRenderer.prototype.createButton = function(content, dom) { 
  var baseClass = this.getCssClass(); 
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' '; 
  return dom.createDom('div', inlineBlock + goog.getCssName(baseClass, 'outer-box'), dom.createDom('div', inlineBlock + goog.getCssName(baseClass, 'inner-box'), dom.createDom('div', goog.getCssName(baseClass, 'pos'), dom.createDom('div', goog.getCssName(baseClass, 'top-shadow'), '\u00A0'), dom.createDom('div', goog.getCssName(baseClass, 'content'), content)))); 
}; 
goog.ui.ImagelessButtonRenderer.prototype.hasBoxStructure = function(button, element) { 
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
goog.ui.ImagelessButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.ImagelessButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.ImagelessButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null, goog.ui.ImagelessButtonRenderer.getInstance()); 
}); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-imageless-toggle-button'), function() { 
  var button = new goog.ui.Button(null, goog.ui.ImagelessButtonRenderer.getInstance()); 
  button.setSupportedState(goog.ui.Component.State.CHECKED, true); 
  return button; 
}); 
