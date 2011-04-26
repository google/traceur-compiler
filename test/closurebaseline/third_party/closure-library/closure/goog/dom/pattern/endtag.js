
goog.provide('goog.dom.pattern.EndTag'); 
goog.require('goog.dom.TagWalkType'); 
goog.require('goog.dom.pattern.Tag'); 
goog.dom.pattern.EndTag = function(tag, opt_attrs, opt_styles, opt_test) { 
  goog.dom.pattern.Tag.call(this, tag, goog.dom.TagWalkType.END_TAG, opt_attrs, opt_styles, opt_test); 
}; 
goog.inherits(goog.dom.pattern.EndTag, goog.dom.pattern.Tag); 
