
goog.require('goog.structs.Map'); 
goog.provide('goog.testing.MockStorage'); 
goog.testing.MockStorage = function() { 
  this.store_ = new goog.structs.Map(); 
  this.length = 0; 
}; 
goog.testing.MockStorage.prototype.setItem = function(key, value) { 
  this.store_.set(key, String(value)); 
  this.length = this.store_.getCount(); 
}; 
goog.testing.MockStorage.prototype.getItem = function(key) { 
  var val = this.store_.get(key); 
  return(val != null) ?(val): null; 
}; 
goog.testing.MockStorage.prototype.removeItem = function(key) { 
  this.store_.remove(key); 
  this.length = this.store_.getCount(); 
}; 
goog.testing.MockStorage.prototype.clear = function() { 
  this.store_.clear(); 
  this.length = 0; 
}; 
goog.testing.MockStorage.prototype.key = function(index) { 
  return this.store_.getKeys()[index]|| null; 
}; 
