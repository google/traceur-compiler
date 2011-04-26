
goog.provide('goog.testing.editor.FieldMock'); 
goog.require('goog.dom'); 
goog.require('goog.dom.Range'); 
goog.require('goog.editor.Field'); 
goog.require('goog.testing.LooseMock'); 
goog.testing.editor.FieldMock = function(opt_window, opt_appWindow, opt_range) { 
  goog.testing.LooseMock.call(this, goog.editor.Field); 
  opt_window = opt_window || window; 
  opt_appWindow = opt_appWindow || opt_window; 
  this.getAppWindow(); 
  this.$anyTimes(); 
  this.$returns(opt_appWindow); 
  this.getRange(); 
  this.$anyTimes(); 
  this.$does(function() { 
    return opt_range || goog.dom.Range.createFromWindow(opt_window); 
  }); 
  this.getEditableDomHelper(); 
  this.$anyTimes(); 
  this.$returns(goog.dom.getDomHelper(opt_window.document)); 
  this.usesIframe(); 
  this.$anyTimes(); 
  this.getBaseZindex(); 
  this.$anyTimes(); 
  this.$returns(0); 
  var inModalMode = false; 
  this.inModalMode = function() { 
    return inModalMode; 
  }; 
  this.setModalMode = function(mode) { 
    inModalMode = mode; 
  }; 
}; 
goog.inherits(goog.testing.editor.FieldMock, goog.testing.LooseMock); 
