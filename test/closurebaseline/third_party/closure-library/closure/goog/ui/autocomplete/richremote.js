
goog.provide('goog.ui.AutoComplete.RichRemote'); 
goog.require('goog.ui.AutoComplete'); 
goog.require('goog.ui.AutoComplete.Remote'); 
goog.require('goog.ui.AutoComplete.Renderer'); 
goog.require('goog.ui.AutoComplete.RichInputHandler'); 
goog.require('goog.ui.AutoComplete.RichRemoteArrayMatcher'); 
goog.ui.AutoComplete.RichRemote = function(url, input, opt_multi, opt_useSimilar) { 
  var customRenderer = { }; 
  customRenderer.renderRow = function(row, token, node) { 
    return row.data.render(node, token); 
  }; 
  var renderer = new goog.ui.AutoComplete.Renderer(null, customRenderer); 
  this.renderer_ = renderer; 
  var matcher = new goog.ui.AutoComplete.RichRemoteArrayMatcher(url, ! opt_useSimilar); 
  this.matcher_ = matcher; 
  var inputhandler = new goog.ui.AutoComplete.RichInputHandler(null, null, ! ! opt_multi, 300); 
  goog.ui.AutoComplete.call(this, matcher, renderer, inputhandler); 
  inputhandler.attachAutoComplete(this); 
  inputhandler.attachInputs(input); 
}; 
goog.inherits(goog.ui.AutoComplete.RichRemote, goog.ui.AutoComplete.Remote); 
goog.ui.AutoComplete.RichRemote.prototype.setRowFilter = function(rowFilter) { 
  this.matcher_.setRowFilter(rowFilter); 
}; 
