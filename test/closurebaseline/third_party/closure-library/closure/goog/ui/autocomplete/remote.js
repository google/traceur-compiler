
goog.provide('goog.ui.AutoComplete.Remote'); 
goog.require('goog.ui.AutoComplete'); 
goog.require('goog.ui.AutoComplete.InputHandler'); 
goog.require('goog.ui.AutoComplete.RemoteArrayMatcher'); 
goog.require('goog.ui.AutoComplete.Renderer'); 
goog.ui.AutoComplete.Remote = function(url, input, opt_multi, opt_useSimilar) { 
  var matcher = new goog.ui.AutoComplete.RemoteArrayMatcher(url, ! opt_useSimilar); 
  this.matcher_ = matcher; 
  var renderer = new goog.ui.AutoComplete.Renderer(); 
  var inputhandler = new goog.ui.AutoComplete.InputHandler(null, null, ! ! opt_multi, 300); 
  goog.ui.AutoComplete.call(this, matcher, renderer, inputhandler); 
  inputhandler.attachAutoComplete(this); 
  inputhandler.attachInputs(input); 
}; 
goog.inherits(goog.ui.AutoComplete.Remote, goog.ui.AutoComplete); 
goog.ui.AutoComplete.Remote.prototype.setUseStandardHighlighting = function(useStandardHighlighting) { 
  this.renderer_.setUseStandardHighlighting(useStandardHighlighting); 
}; 
goog.ui.AutoComplete.Remote.prototype.getInputHandler = function() { 
  return(this.selectionHandler_); 
}; 
goog.ui.AutoComplete.Remote.prototype.setMethod = function(method) { 
  this.matcher_.setMethod(method); 
}; 
goog.ui.AutoComplete.Remote.prototype.setContent = function(content) { 
  this.matcher_.setContent(content); 
}; 
goog.ui.AutoComplete.Remote.prototype.setHeaders = function(headers) { 
  this.matcher_.setHeaders(headers); 
}; 
goog.ui.AutoComplete.Remote.prototype.setTimeoutInterval = function(interval) { 
  this.matcher_.setTimeoutInterval(interval); 
}; 
