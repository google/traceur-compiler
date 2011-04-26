
goog.provide('goog.ui.style.app.MenuButtonRenderer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.style'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuRenderer'); 
goog.require('goog.ui.style.app.ButtonRenderer'); 
goog.ui.style.app.MenuButtonRenderer = function() { 
  goog.ui.style.app.ButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.style.app.MenuButtonRenderer, goog.ui.style.app.ButtonRenderer); 
goog.addSingletonGetter(goog.ui.style.app.MenuButtonRenderer); 
goog.ui.style.app.MenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-menu-button'); 
goog.ui.style.app.MenuButtonRenderer.IE6_CLASS_COMBINATIONS =[[goog.getCssName('goog-button-base-rtl'), goog.getCssName('goog-menu-button')],[goog.getCssName('goog-button-base-hover'), goog.getCssName('goog-menu-button')],[goog.getCssName('goog-button-base-focused'), goog.getCssName('goog-menu-button')],[goog.getCssName('goog-button-base-disabled'), goog.getCssName('goog-menu-button')],[goog.getCssName('goog-button-base-active'), goog.getCssName('goog-menu-button')],[goog.getCssName('goog-button-base-open'), goog.getCssName('goog-menu-button')],[goog.getCssName('goog-button-base-active'), goog.getCssName('goog-button-base-open'), goog.getCssName('goog-menu-button')]]; 
goog.ui.style.app.MenuButtonRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.MENU; 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.getContentElement = function(element) { 
  return goog.ui.style.app.MenuButtonRenderer.superClass_.getContentElement.call(this, element); 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.decorate = function(button, element) { 
  var menuElem = goog.dom.getElementsByTagNameAndClass('*', goog.ui.MenuRenderer.CSS_CLASS, element)[0]; 
  if(menuElem) { 
    goog.style.showElement(menuElem, false); 
    goog.dom.appendChild(goog.dom.getOwnerDocument(menuElem).body, menuElem); 
    var menu = new goog.ui.Menu(); 
    menu.decorate(menuElem); 
    button.setMenu(menu); 
  } 
  return goog.ui.style.app.MenuButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.createButton = function(content, dom) { 
  var contentWithDropdown = this.createContentWithDropdown(content, dom); 
  return goog.ui.style.app.MenuButtonRenderer.superClass_.createButton.call(this, contentWithDropdown, dom); 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.setContent = function(element, content) { 
  var dom = goog.dom.getDomHelper(this.getContentElement(element)); 
  goog.ui.style.app.MenuButtonRenderer.superClass_.setContent.call(this, element, this.createContentWithDropdown(content, dom)); 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.createContentWithDropdown = function(content, dom) { 
  var caption = dom.createDom('div', null, content, this.createDropdown(dom)); 
  return goog.array.toArray(caption.childNodes); 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.createDropdown = function(dom) { 
  return dom.createDom('div', goog.getCssName(this.getCssClass(), 'dropdown')); 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.style.app.MenuButtonRenderer.CSS_CLASS; 
}; 
goog.ui.style.app.MenuButtonRenderer.prototype.getIe6ClassCombinations = function() { 
  return goog.ui.style.app.MenuButtonRenderer.IE6_CLASS_COMBINATIONS; 
}; 
