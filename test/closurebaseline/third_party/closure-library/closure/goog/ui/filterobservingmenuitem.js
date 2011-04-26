
goog.provide('goog.ui.FilterObservingMenuItem'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.FilterObservingMenuItemRenderer'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.registry'); 
goog.ui.FilterObservingMenuItem = function(content, opt_model, opt_domHelper, opt_renderer) { 
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper, opt_renderer || new goog.ui.FilterObservingMenuItemRenderer()); 
}; 
goog.inherits(goog.ui.FilterObservingMenuItem, goog.ui.MenuItem); 
goog.ui.FilterObservingMenuItem.prototype.observer_ = null; 
goog.ui.FilterObservingMenuItem.prototype.enterDocument = function() { 
  goog.ui.FilterObservingMenuItem.superClass_.enterDocument.call(this); 
  this.callObserver(); 
}; 
goog.ui.FilterObservingMenuItem.prototype.setObserver = function(f) { 
  this.observer_ = f; 
  this.callObserver(); 
}; 
goog.ui.FilterObservingMenuItem.prototype.callObserver = function(opt_str) { 
  if(this.observer_) { 
    this.observer_(this, opt_str || ''); 
  } 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.FilterObservingMenuItemRenderer.CSS_CLASS, function() { 
  return new goog.ui.FilterObservingMenuItem(null); 
}); 
