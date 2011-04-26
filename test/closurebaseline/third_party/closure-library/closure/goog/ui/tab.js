
goog.provide('goog.ui.Tab'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.TabRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.Tab = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.TabRenderer.getInstance(), opt_domHelper); 
  this.setSupportedState(goog.ui.Component.State.SELECTED, true); 
  this.setDispatchTransitionEvents(goog.ui.Component.State.DISABLED | goog.ui.Component.State.SELECTED, true); 
}; 
goog.inherits(goog.ui.Tab, goog.ui.Control); 
goog.ui.Tab.prototype.tooltip_; 
goog.ui.Tab.prototype.getTooltip = function() { 
  return this.tooltip_; 
}; 
goog.ui.Tab.prototype.setTooltip = function(tooltip) { 
  this.getRenderer().setTooltip(this.getElement(), tooltip); 
  this.setTooltipInternal(tooltip); 
}; 
goog.ui.Tab.prototype.setTooltipInternal = function(tooltip) { 
  this.tooltip_ = tooltip; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.TabRenderer.CSS_CLASS, function() { 
  return new goog.ui.Tab(null); 
}); 
