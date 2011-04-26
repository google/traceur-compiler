
goog.provide('goog.ui.Toolbar'); 
goog.require('goog.ui.Container'); 
goog.require('goog.ui.ToolbarRenderer'); 
goog.ui.Toolbar = function(opt_renderer, opt_orientation, opt_domHelper) { 
  goog.ui.Container.call(this, opt_orientation, opt_renderer || goog.ui.ToolbarRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.Toolbar, goog.ui.Container); 
