
goog.provide('goog.ui.MenuButtonRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.style'); 
goog.require('goog.ui.CustomButtonRenderer'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuRenderer'); 
goog.require('goog.userAgent'); 
goog.ui.MenuButtonRenderer = function() { 
  goog.ui.CustomButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.MenuButtonRenderer, goog.ui.CustomButtonRenderer); 
goog.addSingletonGetter(goog.ui.MenuButtonRenderer); 
goog.ui.MenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-menu-button'); 
goog.ui.MenuButtonRenderer.WRAPPER_PROP_ = '__goog_wrapper_div'; 
if(goog.userAgent.GECKO) { 
  goog.ui.MenuButtonRenderer.prototype.setContent = function(element, content) { 
    var caption = goog.ui.MenuButtonRenderer.superClass_.getContentElement.call(this,(element && element.firstChild)); 
    if(caption) { 
      goog.dom.replaceNode(this.createCaption(content, goog.dom.getDomHelper(element)), caption); 
    } 
  }; 
} 
goog.ui.MenuButtonRenderer.prototype.getContentElement = function(element) { 
  var content = goog.ui.MenuButtonRenderer.superClass_.getContentElement.call(this,(element && element.firstChild)); 
  if(goog.userAgent.GECKO && content && content[goog.ui.MenuButtonRenderer.WRAPPER_PROP_]) { 
    content =(content.firstChild); 
  } 
  return content; 
}; 
goog.ui.MenuButtonRenderer.prototype.decorate = function(button, element) { 
  var menuElem = goog.dom.getElementsByTagNameAndClass('*', goog.ui.MenuRenderer.CSS_CLASS, element)[0]; 
  if(menuElem) { 
    goog.style.showElement(menuElem, false); 
    goog.dom.appendChild(goog.dom.getOwnerDocument(menuElem).body, menuElem); 
    var menu = new goog.ui.Menu(); 
    menu.decorate(menuElem); 
    button.setMenu(menu); 
  } 
  return goog.ui.MenuButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.MenuButtonRenderer.prototype.createButton = function(content, dom) { 
  return goog.ui.MenuButtonRenderer.superClass_.createButton.call(this,[this.createCaption(content, dom), this.createDropdown(dom)], dom); 
}; 
goog.ui.MenuButtonRenderer.prototype.createCaption = function(content, dom) { 
  return goog.ui.MenuButtonRenderer.wrapCaption(content, this.getCssClass(), dom); 
}; 
goog.ui.MenuButtonRenderer.wrapCaption = function(content, cssClass, dom) { 
  return dom.createDom('div', goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(cssClass, 'caption'), content); 
}; 
goog.ui.MenuButtonRenderer.prototype.createDropdown = function(dom) { 
  return dom.createDom('div', goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'dropdown'), '\u00A0'); 
}; 
goog.ui.MenuButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.MenuButtonRenderer.CSS_CLASS; 
}; 
