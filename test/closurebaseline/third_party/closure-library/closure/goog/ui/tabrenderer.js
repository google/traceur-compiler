
goog.provide('goog.ui.TabRenderer'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.TabRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.TabRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.TabRenderer); 
goog.ui.TabRenderer.CSS_CLASS = goog.getCssName('goog-tab'); 
goog.ui.TabRenderer.prototype.getCssClass = function() { 
  return goog.ui.TabRenderer.CSS_CLASS; 
}; 
goog.ui.TabRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.TAB; 
}; 
goog.ui.TabRenderer.prototype.createDom = function(tab) { 
  var element = goog.ui.TabRenderer.superClass_.createDom.call(this, tab); 
  var tooltip = tab.getTooltip(); 
  if(tooltip) { 
    this.setTooltip(element, tooltip); 
  } 
  return element; 
}; 
goog.ui.TabRenderer.prototype.decorate = function(tab, element) { 
  element = goog.ui.TabRenderer.superClass_.decorate.call(this, tab, element); 
  var tooltip = this.getTooltip(element); 
  if(tooltip) { 
    tab.setTooltipInternal(tooltip); 
  } 
  if(tab.isSelected()) { 
    var tabBar = tab.getParent(); 
    if(tabBar && goog.isFunction(tabBar.setSelectedTab)) { 
      tab.setState(goog.ui.Component.State.SELECTED, false); 
      tabBar.setSelectedTab(tab); 
    } 
  } 
  return element; 
}; 
goog.ui.TabRenderer.prototype.getTooltip = function(element) { 
  return element.title || ''; 
}; 
goog.ui.TabRenderer.prototype.setTooltip = function(element, tooltip) { 
  if(element) { 
    element.title = tooltip || ''; 
  } 
}; 
