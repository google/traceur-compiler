
goog.provide('goog.ui.SubMenuRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.dom.classes'); 
goog.require('goog.style'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuItemRenderer'); 
goog.ui.SubMenuRenderer = function() { 
  goog.ui.MenuItemRenderer.call(this); 
}; 
goog.inherits(goog.ui.SubMenuRenderer, goog.ui.MenuItemRenderer); 
goog.addSingletonGetter(goog.ui.SubMenuRenderer); 
goog.ui.SubMenuRenderer.CSS_CLASS = goog.getCssName('goog-submenu'); 
goog.ui.SubMenuRenderer.prototype.createDom = function(subMenu) { 
  var element = goog.ui.SubMenuRenderer.superClass_.createDom.call(this, subMenu); 
  goog.dom.classes.add(element, goog.ui.SubMenuRenderer.CSS_CLASS); 
  this.addArrow_(subMenu, element); 
  return element; 
}; 
goog.ui.SubMenuRenderer.prototype.decorate = function(subMenu, element) { 
  element = goog.ui.SubMenuRenderer.superClass_.decorate.call(this, subMenu, element); 
  goog.dom.classes.add(element, goog.ui.SubMenuRenderer.CSS_CLASS); 
  this.addArrow_(subMenu, element); 
  var childMenuEls = goog.dom.getElementsByTagNameAndClass('div', goog.getCssName('goog-menu'), element); 
  if(childMenuEls.length) { 
    var childMenu = new goog.ui.Menu(subMenu.getDomHelper()); 
    var childMenuEl = childMenuEls[0]; 
    goog.style.showElement(childMenuEl, false); 
    subMenu.getDomHelper().getDocument().body.appendChild(childMenuEl); 
    childMenu.decorate(childMenuEl); 
    subMenu.setMenu(childMenu, true); 
  } 
  return element; 
}; 
goog.ui.SubMenuRenderer.prototype.initializeDom = function(subMenu) { 
  goog.ui.SubMenuRenderer.superClass_.initializeDom.call(this, subMenu); 
  var element = subMenu.getContentElement(); 
  var arrow = subMenu.getDomHelper().getElementsByTagNameAndClass('span', goog.getCssName('goog-submenu-arrow'), element)[0]; 
  goog.ui.SubMenuRenderer.setArrowTextContent_(subMenu, arrow); 
  if(arrow != element.lastChild) { 
    element.appendChild(arrow); 
  } 
  goog.dom.a11y.setState(subMenu.getElement(), goog.dom.a11y.State.HASPOPUP, 'true'); 
}; 
goog.ui.SubMenuRenderer.prototype.addArrow_ = function(subMenu, element) { 
  var arrow = subMenu.getDomHelper().createDom('span'); 
  arrow.className = goog.getCssName('goog-submenu-arrow'); 
  goog.ui.SubMenuRenderer.setArrowTextContent_(subMenu, arrow); 
  this.getContentElement(element).appendChild(arrow); 
}; 
goog.ui.SubMenuRenderer.LEFT_ARROW_ = '\u25C4'; 
goog.ui.SubMenuRenderer.RIGHT_ARROW_ = '\u25BA'; 
goog.ui.SubMenuRenderer.setArrowTextContent_ = function(subMenu, arrow) { 
  var leftArrow = goog.ui.SubMenuRenderer.LEFT_ARROW_; 
  var rightArrow = goog.ui.SubMenuRenderer.RIGHT_ARROW_; 
  if(subMenu.isRightToLeft()) { 
    goog.dom.classes.add(arrow, goog.getCssName('goog-submenu-arrow-rtl')); 
    goog.dom.setTextContent(arrow, subMenu.isAlignedToEnd() ? leftArrow: rightArrow); 
  } else { 
    goog.dom.classes.remove(arrow, goog.getCssName('goog-submenu-arrow-rtl')); 
    goog.dom.setTextContent(arrow, subMenu.isAlignedToEnd() ? rightArrow: leftArrow); 
  } 
}; 
