
goog.provide('goog.ui.FilterObservingMenuItemRenderer'); 
goog.require('goog.ui.MenuItemRenderer'); 
goog.ui.FilterObservingMenuItemRenderer = function() { 
  goog.ui.MenuItemRenderer.call(this); 
}; 
goog.inherits(goog.ui.FilterObservingMenuItemRenderer, goog.ui.MenuItemRenderer); 
goog.addSingletonGetter(goog.ui.FilterObservingMenuItemRenderer); 
goog.ui.FilterObservingMenuItemRenderer.CSS_CLASS = goog.getCssName('goog-filterobsmenuitem'); 
goog.ui.FilterObservingMenuItemRenderer.prototype.getCssClass = function() { 
  return goog.ui.FilterObservingMenuItemRenderer.CSS_CLASS; 
}; 
