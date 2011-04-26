
goog.provide('goog.ui.style.app.ButtonRenderer'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.CustomButtonRenderer'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.registry'); 
goog.ui.style.app.ButtonRenderer = function() { 
  goog.ui.CustomButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.style.app.ButtonRenderer, goog.ui.CustomButtonRenderer); 
goog.addSingletonGetter(goog.ui.style.app.ButtonRenderer); 
goog.ui.style.app.ButtonRenderer.CSS_CLASS = goog.getCssName('goog-button'); 
goog.ui.style.app.ButtonRenderer.IE6_CLASS_COMBINATIONS =[]; 
goog.ui.style.app.ButtonRenderer.prototype.createDom = goog.ui.style.app.ButtonRenderer.superClass_.createDom; 
goog.ui.style.app.ButtonRenderer.prototype.getContentElement = function(element) { 
  return element &&(element.firstChild.firstChild.firstChild.lastChild); 
}; 
goog.ui.style.app.ButtonRenderer.prototype.createButton = function(content, dom) { 
  var baseClass = this.getStructuralCssClass(); 
  var inlineBlock = goog.ui.INLINE_BLOCK_CLASSNAME + ' '; 
  return dom.createDom('div', inlineBlock + goog.getCssName(baseClass, 'outer-box'), dom.createDom('div', inlineBlock + goog.getCssName(baseClass, 'inner-box'), dom.createDom('div', goog.getCssName(baseClass, 'pos'), dom.createDom('div', goog.getCssName(baseClass, 'top-shadow'), '\u00A0'), dom.createDom('div', goog.getCssName(baseClass, 'content'), content)))); 
}; 
goog.ui.style.app.ButtonRenderer.prototype.hasBoxStructure = function(button, element) { 
  var baseClass = this.getStructuralCssClass(); 
  var outer = button.getDomHelper().getFirstElementChild(element); 
  if(outer && outer.className.indexOf(goog.getCssName(baseClass, 'outer-box')) != - 1) { 
    var inner = button.getDomHelper().getFirstElementChild(outer); 
    if(inner && inner.className.indexOf(goog.getCssName(baseClass, 'inner-box')) != - 1) { 
      var pos = button.getDomHelper().getFirstElementChild(inner); 
      if(pos && pos.className.indexOf(goog.getCssName(baseClass, 'pos')) != - 1) { 
        var shadow = button.getDomHelper().getFirstElementChild(pos); 
        if(shadow && shadow.className.indexOf(goog.getCssName(baseClass, 'top-shadow')) != - 1) { 
          var content = button.getDomHelper().getNextElementSibling(shadow); 
          if(content && content.className.indexOf(goog.getCssName(baseClass, 'content')) != - 1) { 
            return true; 
          } 
        } 
      } 
    } 
  } 
  return false; 
}; 
goog.ui.style.app.ButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.style.app.ButtonRenderer.CSS_CLASS; 
}; 
goog.ui.style.app.ButtonRenderer.prototype.getStructuralCssClass = function() { 
  return goog.getCssName('goog-button-base'); 
}; 
goog.ui.style.app.ButtonRenderer.prototype.getIe6ClassCombinations = function() { 
  return goog.ui.style.app.ButtonRenderer.IE6_CLASS_COMBINATIONS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.style.app.ButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.Button(null, goog.ui.style.app.ButtonRenderer.getInstance()); 
}); 
