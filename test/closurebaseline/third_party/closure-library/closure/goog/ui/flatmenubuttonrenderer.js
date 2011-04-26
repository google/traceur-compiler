
goog.provide('goog.ui.FlatMenuButtonRenderer'); 
goog.require('goog.style'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.FlatButtonRenderer'); 
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.MenuRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.FlatMenuButtonRenderer = function() { 
  goog.ui.FlatButtonRenderer.call(this); 
}; 
goog.inherits(goog.ui.FlatMenuButtonRenderer, goog.ui.FlatButtonRenderer); 
goog.addSingletonGetter(goog.ui.FlatMenuButtonRenderer); 
goog.ui.FlatMenuButtonRenderer.CSS_CLASS = goog.getCssName('goog-flat-menu-button'); 
goog.ui.FlatMenuButtonRenderer.prototype.createDom = function(button) { 
  var classNames = this.getClassNames(button); 
  var attributes = { 
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' '), 
    'title': button.getTooltip() || '' 
  }; 
  return button.getDomHelper().createDom('div', attributes,[this.createCaption(button.getContent(), button.getDomHelper()), this.createDropdown(button.getDomHelper())]); 
}; 
goog.ui.FlatMenuButtonRenderer.prototype.getContentElement = function(element) { 
  return element &&(element.firstChild); 
}; 
goog.ui.FlatMenuButtonRenderer.prototype.decorate = function(button, element) { 
  var menuElem = goog.dom.getElementsByTagNameAndClass('*', goog.ui.MenuRenderer.CSS_CLASS, element)[0]; 
  if(menuElem) { 
    goog.style.showElement(menuElem, false); 
    button.getDomHelper().getDocument().body.appendChild(menuElem); 
    var menu = new goog.ui.Menu(); 
    menu.decorate(menuElem); 
    button.setMenu(menu); 
  } 
  var captionElem = goog.dom.getElementsByTagNameAndClass('*', goog.getCssName(this.getCssClass(), 'caption'), element)[0]; 
  if(! captionElem) { 
    element.appendChild(this.createCaption(element.childNodes, button.getDomHelper())); 
  } 
  var dropdownElem = goog.dom.getElementsByTagNameAndClass('*', goog.getCssName(this.getCssClass(), 'dropdown'), element)[0]; 
  if(! dropdownElem) { 
    element.appendChild(this.createDropdown(button.getDomHelper())); 
  } 
  return goog.ui.FlatMenuButtonRenderer.superClass_.decorate.call(this, button, element); 
}; 
goog.ui.FlatMenuButtonRenderer.prototype.createCaption = function(content, dom) { 
  return dom.createDom('div', goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'caption'), content); 
}; 
goog.ui.FlatMenuButtonRenderer.prototype.createDropdown = function(dom) { 
  return dom.createDom('div', goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'dropdown'), '\u00A0'); 
}; 
goog.ui.FlatMenuButtonRenderer.prototype.getCssClass = function() { 
  return goog.ui.FlatMenuButtonRenderer.CSS_CLASS; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.FlatMenuButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.MenuButton(null, null, goog.ui.FlatMenuButtonRenderer.getInstance()); 
}); 
