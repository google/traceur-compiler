
goog.provide('goog.ui.TriStateMenuItemRenderer'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.MenuItemRenderer'); 
goog.ui.TriStateMenuItemRenderer = function() { 
  goog.ui.MenuItemRenderer.call(this); 
}; 
goog.inherits(goog.ui.TriStateMenuItemRenderer, goog.ui.MenuItemRenderer); 
goog.addSingletonGetter(goog.ui.TriStateMenuItemRenderer); 
goog.ui.TriStateMenuItemRenderer.CSS_CLASS = goog.getCssName('goog-tristatemenuitem'); 
goog.ui.TriStateMenuItemRenderer.prototype.decorate = function(item, element) { 
  element = goog.ui.TriStateMenuItemRenderer.superClass_.decorate.call(this, item, element); 
  this.setSelectable(item, element, true); 
  if(goog.dom.classes.has(element, goog.getCssName(this.getCssClass(), 'fully-checked'))) { 
    item.setCheckedState(goog.ui.TriStateMenuItem.State.FULLY_CHECKED); 
  } else if(goog.dom.classes.has(element, goog.getCssName(this.getCssClass(), 'partially-checked'))) { 
    item.setCheckedState(goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED); 
  } else { 
    item.setCheckedState(goog.ui.TriStateMenuItem.State.NOT_CHECKED); 
  } 
  return element; 
}; 
goog.ui.TriStateMenuItemRenderer.prototype.getCssClass = function() { 
  return goog.ui.TriStateMenuItemRenderer.CSS_CLASS; 
}; 
