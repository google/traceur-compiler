
goog.provide('goog.ui.CustomButtonRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.string'); 
goog.require('goog.ui.ButtonRenderer'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.ui.CustomButtonRenderer = function() { 
  goog.ui.ButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.CustomButtonRenderer, goog.ui.ButtonRenderer); 
goog.addSingletonGetter(goog.ui.CustomButtonRenderer); 
goog.ui.CustomButtonRenderer.CSS_CLASS = goog.getCssName('goog-custom-button'); 
goog.ui.CustomButtonRenderer.prototype.createDom = function(button) { 
  var classNames = this.getClassNames(button); 
  var attributes = { 
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' '), 
    'title': button.getTooltip() || '' 
  }; 
  return button.getDomHelper().createDom('div', attributes, this.createButton(button.getContent(), button.getDomHelper())); 
}; 
goog.ui.CustomButtonRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.BUTTON; 
}; 
goog.ui.CustomButtonRenderer.prototype.getContentElement = function(element) { 
  return element &&(element.firstChild.firstChild); 
}; 
goog.ui.CustomButtonRenderer.prototype.createButton = function(content, dom) { 
  return dom.createDom('div', goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'outer-box'), dom.createDom('div', goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'inner-box'), content)); 
}; 
goog.ui.CustomButtonRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == 'DIV'; 
}; 
goog.ui.CustomButtonRenderer.prototype.hasBoxStructure = function(button, element) { 
  var outer = button.getDomHelper().getFirstElementChild(element); 
  if(outer && outer.className.indexOf(goog.getCssName(this.getCssClass(), 'outer-box')) != - 1) { 
    var inner = button.getDomHelper().getFirstElementChild(outer); 
    if(inner && inner.className.indexOf(goog.getCssName(this.getCssClass(), 'inner-box')) != - 1) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.ui.CustomButtonRenderer.prototype.decorate = function(button, element) { 
  goog.ui.CustomButtonRenderer.trimTextNodes_(element, true); 
  goog.ui.CustomButtonRenderer.trimTextNodes_(element, false); 
  if(! this.hasBoxStructure(button, element)) { 
    element.appendChild(this.createButton(element.childNodes, button.getDomHelper())); 
  } 
  goog.dom.classes.add(element, goog.ui.INLINE_BLOCK_CLASSNAME, this.getCssClass()); 
  return goog.ui.CustomButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.CustomButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.CustomButtonRenderer.CSS_CLASS; 
}; 
goog.ui.CustomButtonRenderer.trimTextNodes_ = function(element, fromStart) { 
  if(element) { 
    var node = fromStart ? element.firstChild: element.lastChild, next; 
    while(node && node.parentNode == element) { 
      next = fromStart ? node.nextSibling: node.previousSibling; 
      if(node.nodeType == goog.dom.NodeType.TEXT) { 
        var text = node.nodeValue; 
        if(goog.string.trim(text) == '') { 
          element.removeChild(node); 
        } else { 
          node.nodeValue = fromStart ? goog.string.trimLeft(text): goog.string.trimRight(text); 
          break; 
        } 
      } else { 
        break; 
      } 
      node = next; 
    } 
  } 
}; 
