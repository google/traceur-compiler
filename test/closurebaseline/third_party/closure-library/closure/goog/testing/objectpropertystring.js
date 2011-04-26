
goog.provide('goog.testing.ObjectPropertyString'); 
goog.testing.ObjectPropertyString = function(object, propertyString) { 
  this.object_ = object; 
  this.propertyString_ =(propertyString); 
}; 
goog.testing.ObjectPropertyString.prototype.object_; 
goog.testing.ObjectPropertyString.prototype.propertyString_; 
goog.testing.ObjectPropertyString.prototype.getObject = function() { 
  return this.object_; 
}; 
goog.testing.ObjectPropertyString.prototype.getPropertyString = function() { 
  return this.propertyString_; 
}; 
