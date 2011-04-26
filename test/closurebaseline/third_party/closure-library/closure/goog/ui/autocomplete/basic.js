
goog.provide('goog.ui.AutoComplete.Basic'); 
goog.require('goog.ui.AutoComplete'); 
goog.require('goog.ui.AutoComplete.ArrayMatcher'); 
goog.require('goog.ui.AutoComplete.InputHandler'); 
goog.require('goog.ui.AutoComplete.Renderer'); 
goog.ui.AutoComplete.Basic = function(data, input, opt_multi, opt_useSimilar) { 
  var matcher = new goog.ui.AutoComplete.ArrayMatcher(data, ! opt_useSimilar); 
  var renderer = new goog.ui.AutoComplete.Renderer(); 
  var inputhandler = new goog.ui.AutoComplete.InputHandler(null, null, ! ! opt_multi); 
  goog.ui.AutoComplete.call(this, matcher, renderer, inputhandler); 
  inputhandler.attachAutoComplete(this); 
  inputhandler.attachInputs(input); 
}; 
goog.inherits(goog.ui.AutoComplete.Basic, goog.ui.AutoComplete); 
