
goog.provide('goog.dom.pattern.StartTag'); 
goog.require('goog.dom.TagWalkType'); 
goog.require('goog.dom.pattern.Tag'); 
goog.dom.pattern.StartTag = function(tag, opt_attrs, opt_styles, opt_test) { 
  goog.dom.pattern.Tag.call(this, tag, goog.dom.TagWalkType.START_TAG, opt_attrs, opt_styles, opt_test); 
}; 
goog.inherits(goog.dom.pattern.StartTag, goog.dom.pattern.Tag); 
