
goog.provide('goog.debug.devCssRunner'); 
goog.require('goog.debug.DevCss'); 
(function() { 
  var devCssInstance = new goog.debug.DevCss(); 
  devCssInstance.activateBrowserSpecificCssRules(); 
})(); 
