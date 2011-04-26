
goog.provide('goog.ui.ColorSplitBehavior'); 
goog.require('goog.ui.ColorButton'); 
goog.require('goog.ui.ColorMenuButton'); 
goog.require('goog.ui.SplitBehavior'); 
goog.ui.ColorSplitBehavior = function(colorButton, opt_domHelper) { 
  goog.base(this, colorButton, new goog.ui.ColorMenuButton(goog.ui.ColorSplitBehavior.ZERO_WIDTH_SPACE_), goog.ui.SplitBehavior.DefaultHandlers.VALUE, undefined, opt_domHelper); 
}; 
goog.inherits(goog.ui.ColorSplitBehavior, goog.ui.SplitBehavior); 
goog.ui.ColorSplitBehavior.ZERO_WIDTH_SPACE_ = '\uFEFF'; 
