
goog.provide('goog.ui.RoundedTabRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.ui.Tab'); 
goog.require('goog.ui.TabBar.Location'); 
goog.require('goog.ui.TabRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.RoundedTabRenderer = function() { 
  goog.ui.TabRenderer.call(this); 
}; 
goog.inherits(goog.ui.RoundedTabRenderer, goog.ui.TabRenderer); 
goog.addSingletonGetter(goog.ui.RoundedTabRenderer); 
goog.ui.RoundedTabRenderer.CSS_CLASS = goog.getCssName('goog-rounded-tab'); 
goog.ui.RoundedTabRenderer.prototype.getCssClass = function() { 
  return goog.ui.RoundedTabRenderer.CSS_CLASS; 
}; 
goog.ui.RoundedTabRenderer.prototype.createDom = function(tab) { 
  return this.decorate(tab, goog.ui.RoundedTabRenderer.superClass_.createDom.call(this, tab)); 
}; 
goog.ui.RoundedTabRenderer.prototype.decorate = function(tab, element) { 
  var tabBar = tab.getParent(); 
  if(! this.getContentElement(element)) { 
    element.appendChild(this.createTab(tab.getDomHelper(), element.childNodes, tabBar.getLocation())); 
  } 
  return goog.ui.RoundedTabRenderer.superClass_.decorate.call(this, tab, element); 
}; 
goog.ui.RoundedTabRenderer.prototype.createTab = function(dom, caption, location) { 
  var rows =[]; 
  if(location != goog.ui.TabBar.Location.BOTTOM) { 
    rows.push(this.createEdge(dom, true)); 
  } 
  rows.push(this.createCaption(dom, caption)); 
  if(location != goog.ui.TabBar.Location.TOP) { 
    rows.push(this.createEdge(dom, false)); 
  } 
  return dom.createDom('table', { 
    'cellPadding': 0, 
    'cellSpacing': 0, 
    'className': goog.getCssName(this.getStructuralCssClass(), 'table') 
  }, dom.createDom('tbody', null, rows)); 
}; 
goog.ui.RoundedTabRenderer.prototype.createCaption = function(dom, caption) { 
  var baseClass = this.getStructuralCssClass(); 
  return dom.createDom('tr', null, dom.createDom('td', { 'noWrap': true }, dom.createDom('div', goog.getCssName(baseClass, 'caption'), caption))); 
}; 
goog.ui.RoundedTabRenderer.prototype.createEdge = function(dom, isTopEdge) { 
  var baseClass = this.getStructuralCssClass(); 
  var inner = dom.createDom('div', goog.getCssName(baseClass, 'inner-edge')); 
  var outer = dom.createDom('div', goog.getCssName(baseClass, 'outer-edge')); 
  return dom.createDom('tr', null, dom.createDom('td', { 'noWrap': true }, isTopEdge ?[outer, inner]:[inner, outer])); 
}; 
goog.ui.RoundedTabRenderer.prototype.getContentElement = function(element) { 
  var baseClass = this.getStructuralCssClass(); 
  return element && goog.dom.getElementsByTagNameAndClass('div', goog.getCssName(baseClass, 'caption'), element)[0]; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.RoundedTabRenderer.CSS_CLASS, function() { 
  return new goog.ui.Tab(null, goog.ui.RoundedTabRenderer.getInstance()); 
}); 
